const API_URL = "http://localhost:8000/index.php?resource=screenings";


function toggleModal() {
    const modal = document.getElementById('screening-modal');
    modal.classList.toggle('hidden');
}

async function fetchPlanning() {
    try {
        const response = await fetch(API_URL);
        const screenings = await response.json();

        if (!Array.isArray(screenings)) return;

        const container = document.getElementById('planning-container');
        container.innerHTML = "";

        // On filtre d'abord pour supprimer automatiquement les séances finies depuis 2h
        const filteredScreenings = screenings.filter(s => {
            const endTime = new Date(new Date(s.start_time).getTime() + 120 * 60000);
            return endTime > new Date();
        });

        if (filteredScreenings.length === 0) {
            container.innerHTML = `<p class="text-gray-500 italic">Aucune séance à venir.</p>`;
            return;
        }

        // On groupe par salle
        const groupedByRoom = filteredScreenings.reduce((acc, s) => {
            if (!acc[s.room_name]) acc[s.room_name] = [];
            acc[s.room_name].push(s);
            return acc;
        }, {});

        // On boucle sur chaque salle pour créer les sections
        for (const roomName in groupedByRoom) {
            // Création de l'entête de la salle
            container.innerHTML += `
                <div class="mt-12 mb-8 flex items-center gap-4">
                    <h2 class="text-3xl font-black text-white uppercase tracking-tighter italic">${roomName}</h2>
                    <div class="h-[2px] flex-grow bg-gradient-to-r from-red-600 to-transparent"></div>
                </div>
                <div class="space-y-12 border-l-2 border-zinc-800 ml-4 pl-10 pb-10">
                    ${groupedByRoom[roomName].map(s => renderMyFriseCard(s)).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error("Erreur planning:", error);
    }
}

// (Frise) isolée pour rester propre
function renderMyFriseCard(s) {
    const now = new Date();
    const startTime = new Date(s.start_time.replace(' ', 'T'));
    const duration = 120;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const isLive = now >= startTime && now <= endTime;
    const isPast = now > endTime;

    const dateFr = startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const heure = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Calcul de la progression pour la barre (en %)
    const elapsed = Math.max(0, Math.min(100, ((now - startTime) / (duration * 60000)) * 100));

    return `
        <div class="relative ${isPast ? 'opacity-40' : ''}">
            <div class="absolute -left-[51px] top-1 w-5 h-5 rounded-full ${isLive ? 'bg-green-500 animate-ping' : 'bg-red-600'} border-4 border-[#141414]"></div>
            
            <div class="mb-4 flex items-center gap-4">
                <span class="text-sm font-bold uppercase ${isLive ? 'text-green-500' : 'text-red-600'} tracking-widest">${dateFr}</span>
                ${isLive ? '<span class="bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded">EN COURS</span>' : ''}
            </div>

            <div class="bg-zinc-900/80 border ${isLive ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-zinc-800'} p-0 rounded-xl flex items-center overflow-hidden hover:bg-zinc-800 transition duration-300 group">
                <div class="w-32 h-44 flex-shrink-0">
                    <img src="${s.movie_poster}?t=${Date.now()}" alt="${s.movie_title}" class="w-full h-full object-cover">
                </div>

                <div class="flex flex-col flex-grow p-6">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-6">
                            <div class="text-4xl font-black hour-glow tracking-tighter">${heure}</div>
                            <div>
                                <h3 class="text-2xl font-bold group-hover:text-red-500 transition-colors uppercase tracking-tight">${s.movie_title}</h3>
                                <div class="flex gap-3 mt-2">
                                    <span class="bg-zinc-800 text-gray-400 text-[10px] px-2 py-1 rounded font-bold">4K / ATMOS</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex gap-4">
                            <button onclick="editScreening(${s.id})" class="hover:scale-120 transition hover:text-blue-500 text-xl">✏️</button>
                            <button onclick="deleteScreening(${s.id})" class="hover:scale-120 transition hover:text-red-500 text-xl">🗑️</button>
                        </div>
                    </div>
                    
                    ${isLive ? `
                    <div class="mt-6">
                        <div class="flex justify-between text-[10px] text-gray-500 mb-1 font-bold">
                            <span>DÉBUT</span>
                            <span>PROGRESSION (${Math.round(elapsed)}%)</span>
                            <span>FIN</span>
                        </div>
                        <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-green-500 h-full transition-all duration-1000" style="width: ${elapsed}%"></div>
                        </div>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', fetchPlanning);

// Charge dynamiquement les films et les salles depuis ton API
async function loadFormOptions() {
    try {
        const [moviesRes, roomsRes] = await Promise.all([
            fetch("http://localhost:8000/index.php?resource=movies"),
            fetch("http://localhost:8000/index.php?resource=rooms")
        ]);
        
        const movies = await moviesRes.json();
        const rooms = await roomsRes.json();

        // On remplit les listes déroulantes
        document.getElementById('movie-select').innerHTML = movies.map(m => 
            `<option value="${m.id}">${m.title} (${m.release_year})</option>`).join('');

        document.getElementById('room-select').innerHTML = rooms.map(r => 
            `<option value="${r.id}">${r.name} (${r.capacity} places)</option>`).join('');
            
    } catch (err) {
        console.error("Erreur lors du chargement des options :", err);
    }
}

// Gère l'envoi du formulaire
document.getElementById('screening-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // On récupère la date du formulaire (ex: 2026-02-05T20:00)
    const dateInput = document.getElementById('screening-date').value;
    
    // FIX : On remplace le 'T' par un espace pour MySQL
    const formattedDate = dateInput.replace('T', ' ');

    const formData = {
        movie_id: document.getElementById('movie-select').value,
        room_id: document.getElementById('room-select').value,
        start_time: formattedDate // On envoie la date propre
    };

    console.log("Données envoyées :", formData);

    try {
        const response = await fetch("http://localhost:8000/index.php?resource=screenings", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            toggleModal();
            // On attend un petit peu que le SQL finisse avant de rafraîchir
            setTimeout(() => {
                fetchPlanning();
            }, 500);
            alert("Séance programmée avec succès !");
        } else {
            alert("Erreur lors de l'enregistrement.");
        }
    } catch (err) {
        console.error("Erreur POST :", err);
    }
});

async function deleteScreening(id) {
    if (!confirm("Supprimer cette séance ?")) return;

    try {
        const response = await fetch(`http://localhost:8000/index.php?resource=screenings&id=${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchPlanning();
        }
    } catch (err) {
        console.error("Erreur suppression:", err);
    }
}

// let editId = null;

// async function editScreening(id) {
//     toggleModal();
//     loadFormOptions();
//     editId = id;
// }

let editMode = false;
let currentEditId = null;

async function editScreening(id) {
    try {
        // On récupère toutes les séances pour trouver la bonne
        const response = await fetch(API_URL);
        const screenings = await response.json();
        const s = screenings.find(item => item.id == id);

        if (s) {
            editMode = true;
            currentEditId = id;

            // On ouvre le modal
            toggleModal(); 

            // On remplit les champs du formulaire
            // Attention : assure-toi que les ID correspondent à ton HTML
            document.getElementById('movie_id').value = s.movie_id;
            document.getElementById('room_id').value = s.room_id;
            
            // Formatage de la date pour l'input datetime-local (YYYY-MM-DDTHH:MM)
            const dateInput = s.start_time.replace(' ', 'T').substring(0, 16);
            document.getElementById('start_time').value = dateInput;

            // On change le titre et le bouton du modal pour le look
            document.getElementById('modal-title').innerText = "Modifier la séance";
            document.getElementById('submit-btn').innerText = "Mettre à jour";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des infos :", error);
    }
}

document.getElementById('add-screening-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        movie_id: document.getElementById('movie_id').value,
        room_id: document.getElementById('room_id').value,
        start_time: document.getElementById('start_time').value
    };

    // Si on est en mode édition, on ajoute l'ID et on change la méthode
    const method = editMode ? 'PUT' : 'POST';
    if (editMode) data.id = currentEditId;

    try {
        const response = await fetch(API_URL, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert(editMode ? "Séance mise à jour !" : "Séance ajoutée !");
            toggleModal();
            resetForm();
            fetchPlanning();
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
});

// Fonction pour remettre le formulaire à l'état "Ajout"
function resetForm() {
    editMode = false;
    currentEditId = null;
    document.getElementById('add-screening-form').reset();
    document.getElementById('modal-title').innerText = "Programmer une séance";
    document.getElementById('submit-btn').innerText = "Confirmer la programmation";
}