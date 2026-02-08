const API_URL = "http://localhost:8000/index.php?resource=screenings";


function toggleModal() {
    const modal = document.getElementById('screening-modal');
    modal.classList.toggle('hidden');
}

async function fetchPlanning() {
    try {
        const response = await fetch(API_URL);
        const screenings = await response.json();

        console.log("Brut reçu :", screenings);

        if (!Array.isArray(screenings)) {
            console.error("Le serveur n'a pas renvoyé un tableau:", screenings);
            return;
        }
        const container = document.getElementById('planning-container');
        container.innerHTML = "";

        if (screenings.length === 0) {
            container.innerHTML = `<p class="text-gray-500 italic">Aucune séance programmée.</p>`;
            return;
        }

        screenings.forEach(s => {
            const now = new Date();
            const startTime = new Date(s.start_time.replace(' ', 'T'));
            const duration = 120; // On part sur une base de 2h par film
            const endTime = new Date(startTime.getTime() + duration * 60000);
            
            // Calcul pour le badge "LIVE"
            const isLive = now >= startTime && now <= endTime;
            const isPast = now > endTime;

            const dateFr = startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
            const heure = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            container.innerHTML += `
                <div class="relative ${isPast ? 'opacity-40' : ''}">
                    <div class="absolute -left-[41px] top-1 w-4 h-4 rounded-full ${isLive ? 'bg-green-500 animate-ping' : 'bg-red-600'} border-4 border-[#141414]"></div>
                    
                    <div class="mb-4 flex items-center gap-4">
                        <span class="text-sm font-bold uppercase ${isLive ? 'text-green-500' : 'text-red-600'} tracking-widest">${dateFr}</span>
                        ${isLive ? '<span class="bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded">EN COURS</span>' : ''}
                    </div>

                    <div class="bg-zinc-900/80 border ${isLive ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-zinc-800'} p-0 rounded-xl flex items-center overflow-hidden hover:bg-zinc-800 transition duration-300 group">
                        <div class="w-32 h-44 flex-shrink-0">
                            <img src="${s.movie_poster}?t=${Date.now()}" 
                                 alt="${s.movie_title}" 
                                 class="w-full h-full object-cover">
                        </div>

                        <div class="flex flex-col flex-grow p-6">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center gap-6">
                                    <div class="text-4xl font-black hour-glow tracking-tighter">${heure}</div>
                                    <div>
                                        <h3 class="text-2xl font-bold group-hover:text-red-500 transition-colors uppercase tracking-tight">${s.movie_title}</h3>
                                        <div class="flex gap-3 mt-2">
                                            <span class="bg-red-600/10 text-red-500 text-[10px] px-2 py-1 rounded font-bold uppercase border border-red-500/20">${s.room_name}</span>
                                            <span class="bg-zinc-800 text-gray-400 text-[10px] px-2 py-1 rounded font-bold">4K / ATMOS</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="flex gap-4">
                                    <button class="hover:scale-110 transition">✏️</button>
                                    <button class="hover:scale-110 transition text-red-500">🗑️</button>
                                </div>
                            </div>
                            
                            ${isLive ? `
                            <div class="mt-6">
                                <div class="flex justify-between text-[10px] text-gray-500 mb-1 font-bold">
                                    <span>DÉBUT</span>
                                    <span>EN COURS...</span>
                                    <span>FIN</span>
                                </div>
                                <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                    <div class="bg-green-500 h-full w-[45%] animate-pulse"></div>
                                </div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erreur planning:", error);
    }
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