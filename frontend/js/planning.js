const API_URL = "http://localhost:8000/index.php?resource=screenings";

// 1. GESTION DU MODAL
function toggleModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            loadFormOptions();
        } else {
            resetForm();
        }
    }
}

// 2. CHARGEMENT ET RENDER DU PLANNING
async function fetchPlanning() {
    try {
        const response = await fetch(API_URL);
        const screenings = await response.json();
        if (!Array.isArray(screenings)) return;

        const container = document.getElementById('planning-container');
        container.innerHTML = "";

        const filteredScreenings = screenings.filter(s => {
            const endTime = new Date(new Date(s.start_time).getTime() + 120 * 60000);
            return endTime > new Date();
        });

        if (filteredScreenings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-800">
                    <p class="text-zinc-500 text-xl italic font-medium">Aucune séance programmée pour le moment.</p>
                </div>`;
            return;
        }

        const groupedByRoom = filteredScreenings.reduce((acc, s) => {
            if (!acc[s.room_name]) acc[s.room_name] = [];
            acc[s.room_name].push(s);
            return acc;
        }, {});

        for (const roomName in groupedByRoom) {
            container.innerHTML += `
                <div class="mt-16 mb-8 flex items-center gap-6">
                    <h2 class="text-4xl font-black text-white uppercase tracking-tighter italic italic">${roomName}</h2>
                    <div class="h-[1px] flex-grow bg-gradient-to-r from-red-600 via-red-600/20 to-transparent"></div>
                </div>
                <div class="space-y-10 border-l border-zinc-800 ml-4 pl-10 pb-10">
                    ${groupedByRoom[roomName].sort((a,b) => new Date(a.start_time) - new Date(b.start_time)).map(s => renderAdminCard(s)).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error("Erreur planning:", error);
    }
}

function renderAdminCard(s) {
    const now = new Date();
    const startTime = new Date(s.start_time.replace(' ', 'T'));
    const endTime = new Date(startTime.getTime() + 120 * 60000);
    const isLive = now >= startTime && now <= endTime;
    const heure = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateFr = startTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const elapsed = Math.max(0, Math.min(100, ((now - startTime) / (120 * 60000)) * 100));

    return `
        <div class="relative group">
            <div class="absolute -left-[50.5px] top-2 w-5 h-5 rounded-full ${isLive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-zinc-700'} border-4 border-[#141414]"></div>
            
            <div class="bg-zinc-900/50 backdrop-blur-sm border ${isLive ? 'border-green-500/30 shadow-2xl shadow-green-500/5' : 'border-zinc-800/50'} p-0 rounded-2xl flex items-center overflow-hidden hover:border-zinc-600 transition-all duration-500">
                <div class="w-28 h-40 flex-shrink-0 relative overflow-hidden">
                    <img src="${s.movie_poster}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                    <div class="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                </div>

                <div class="flex-grow p-6 flex justify-between items-center">
                    <div class="flex items-center gap-8">
                        <div class="text-center">
                            <span class="block text-xs font-black text-red-600 uppercase mb-1">${dateFr}</span>
                            <span class="text-4xl font-black text-white tracking-tighter">${heure}</span>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white uppercase tracking-tight group-hover:text-red-500 transition">${s.movie_title}</h3>
                            <div class="flex gap-2 mt-2">
                                <span class="text-[10px] font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-widest border border-zinc-700">Premium Session</span>
                                ${isLive ? '<span class="text-[10px] font-black px-2 py-0.5 rounded bg-green-500/10 text-green-500 uppercase tracking-widest border border-green-500/20">Live</span>' : ''}
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button onclick="editScreening(${s.id})" class="p-3 bg-zinc-800 hover:bg-white hover:text-black rounded-xl transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onclick="deleteScreening(${s.id})" class="p-3 bg-zinc-800 hover:bg-red-600 text-white rounded-xl transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            ${isLive ? `
            <div class="absolute bottom-0 left-28 right-0 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div class="bg-green-500 h-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style="width: ${elapsed}%"></div>
            </div>` : ''}
        </div>`;
}

// 3. LOGIQUE FORMULAIRE (IDs HTML Respectés)
async function loadFormOptions() {
    try {
        const [mRes, rRes] = await Promise.all([
            fetch("http://localhost:8000/index.php?resource=movies"),
            fetch("http://localhost:8000/index.php?resource=rooms")
        ]);
        const movies = await mRes.json();
        const rooms = await rRes.json();
        document.getElementById('movie_id').innerHTML = movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
        document.getElementById('room_id').innerHTML = rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    } catch (e) { console.error(e); }
}

const form = document.getElementById('add-screening-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            movie_id: document.getElementById('movie_id').value,
            room_id: document.getElementById('room_id').value,
            start_time: document.getElementById('start_time').value.replace('T', ' ')
        };
        const method = editMode ? 'PUT' : 'POST';
        if (editMode) data.id = currentEditId;

        const res = await fetch(API_URL, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { toggleModal(); fetchPlanning(); }
    });
}

let editMode = false;
let currentEditId = null;

async function editScreening(id) {
    const res = await fetch(API_URL);
    const screenings = await res.json();
    const s = screenings.find(item => item.id == id);
    if (s) {
        editMode = true;
        currentEditId = id;
        toggleModal();
        setTimeout(() => {
            document.getElementById('movie_id').value = s.movie_id;
            document.getElementById('room_id').value = s.room_id;
            document.getElementById('start_time').value = s.start_time.replace(' ', 'T').substring(0, 16);
            document.getElementById('modal-title').innerText = "Modifier la séance";
            document.getElementById('submit-btn').innerText = "Mettre à jour";
        }, 100);
    }
}

function resetForm() {
    editMode = false;
    currentEditId = null;
    if(form) form.reset();
    document.getElementById('modal-title').innerText = "Programmer une séance";
    document.getElementById('submit-btn').innerText = "Confirmer";
}

async function deleteScreening(id) {
    if (confirm("Supprimer cette séance ?")) {
        await fetch(`${API_URL}&id=${id}`, { method: 'DELETE' });
        fetchPlanning();
    }
}

document.addEventListener('DOMContentLoaded', fetchPlanning);