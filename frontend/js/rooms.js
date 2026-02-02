const API_URL = "http://localhost:8000/index.php?resource=rooms";

async function fetchRooms() {
    try {
        const response = await fetch(API_URL);
        const rooms = await response.json();
        const container = document.getElementById('rooms-container');
        
        container.innerHTML = "";

        if (rooms.length === 0) {
            container.innerHTML = `<p class="text-gray-500 col-span-full text-center py-20 italic">Aucune salle configurée pour le moment.</p>`;
            return;
        }

        rooms.forEach(room => {
            // Utilisation d'une image par défaut si aucune n'est fournie
            const image = room.image_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070';
            
            container.innerHTML += `
                <div class="room-card relative group cursor-pointer overflow-hidden rounded-md bg-zinc-900 shadow-xl border border-transparent hover:border-zinc-500 transition-all duration-300">
                    
                    <div class="overflow-hidden h-64">
                        <img src="${image}" alt="${room.name}" class="w-full h-full object-cover opacity-70 group-hover:opacity-90">
                    </div>

                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                    <div class="absolute bottom-0 left-0 p-6 w-full">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded text-white">4K ULTRA HD</span>
                            <span class="bg-zinc-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-300 border border-zinc-600">DOLBY ATMOS</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">${room.name}</h3>
                        <p class="text-gray-300 text-sm mt-1 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Capacité : ${room.capacity} personnes
                        </p>
                    </div>

                    <div class="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button onclick="editRoom(${room.id})" class="bg-white text-black p-2 rounded-full hover:bg-gray-200 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erreur salles:", error);
        document.getElementById('rooms-container').innerHTML = `<p class="text-red-500 text-center col-span-full">Erreur de connexion au serveur.</p>`;
    }
}

// Pour plus tard : modifier une salle
function editRoom(id) {
    console.log("Modifier la salle ID:", id);
}

document.addEventListener('DOMContentLoaded', fetchRooms);