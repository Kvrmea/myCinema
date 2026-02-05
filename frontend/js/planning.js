const API_URL = "http://localhost:8000/index.php?resource=screenings";

async function fetchPlanning() {
    try {
        const response = await fetch(API_URL);
        const screenings = await response.json();
        const container = document.getElementById('planning-container');
        container.innerHTML = "";

        if (screenings.length === 0) {
            container.innerHTML = `<p class="text-gray-500 italic">Aucune séance programmée.</p>`;
            return;
        }

        screenings.forEach(s => {
            const dateObj = new Date(s.start_time);
            const dateFr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
            const heure = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            container.innerHTML += `
                <div class="relative">
                    <div class="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-red-600 border-4 border-[#141414]"></div>
                    
                    <div class="mb-4">
                        <span class="text-sm font-bold uppercase text-red-600 tracking-widest">${dateFr}</span>
                    </div>

                    <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition duration-300 group">
                        <div class="flex items-center gap-8">
                            <div class="text-4xl font-black hour-glow tracking-tighter w-24">
                                ${heure}
                            </div>
                            
                            <div>
                                <h3 class="text-xl font-bold group-hover:text-red-500 transition-colors">${s.movie_title}</h3>
                                <div class="flex gap-3 mt-2">
                                    <span class="bg-zinc-700 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider text-gray-300">
                                        Salle: ${s.room_name}
                                    </span>
                                    <span class="border border-zinc-700 text-[10px] px-2 py-1 rounded font-bold text-gray-400 uppercase">
                                        VF / Numérique
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <button class="text-gray-500 hover:text-white transition">✏️</button>
                            <button class="text-gray-500 hover:text-red-500 transition">🗑️</button>
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