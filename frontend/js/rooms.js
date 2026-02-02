const API_URL = "http://localhost:8000/index.php?resource=rooms";

function toggleModal() {
    document.getElementById('room-modal').classList.toggle('hidden');
    if(document.getElementById('room-modal').classList.contains('hidden')) {
        document.getElementById('room-form').reset();
        document.getElementById('room-id').value = "";
        document.getElementById('modal-title').innerText = "Ajouter une salle";
    }
}

// // Ouvrir le modal en mode "Modification"
// function editRoom(id) {
//     // Dans un vrai projet, on irait chercher les infos de la salle
//     // Pour l'instant, on va juste changer le titre et l'ID
//     document.getElementById('modal-title').innerText = "Modifier la salle";
//     document.getElementById('room-id').value = id;
//     toggleModal();
// }

async function fetchRooms() {
    const response = await fetch(API_URL);
    const rooms = await response.json();
    const container = document.getElementById('rooms-container');
    container.innerHTML = "";

    rooms.forEach(room => {
        const image = room.image_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
        container.innerHTML += `
            <div class="room-card relative group cursor-pointer overflow-hidden rounded-md bg-zinc-900 shadow-xl border border-transparent hover:border-zinc-500 transition-all duration-300">
                <div class="overflow-hidden h-64">
                    <img src="${image}" class="w-full h-full object-cover opacity-70 group-hover:opacity-90">
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-6 w-full">
                    <h3 class="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">${room.name}</h3>
                    <p class="text-gray-300 text-sm">Capacité : ${room.capacity} sièges</p>
                </div>
                <div class="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button onclick="editRoom(${room.id})" class="bg-white text-black p-2 rounded-full hover:bg-gray-200 shadow-lg">✏️</button>
                    <button onclick="deleteRoom(${room.id})" class="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg">🗑️</button>
                </div>
            </div>`;
    });
}

document.getElementById('room-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('room-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}&id=${id}` : API_URL;

    const roomData = {
        name: document.getElementById('room-name').value,
        capacity: document.getElementById('room-capacity').value,
        image_url: document.getElementById('room-image').value
    };

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    });

    if (response.ok) {
        toggleModal();
        fetchRooms();
    }
});

async function editRoom(id) {
    document.getElementById('modal-title').innerText = "Modifier la salle";
    document.getElementById('room-id').value = id;

    const response = await fetch(API_URL);
    const rooms = await response.json();
    const room = rooms.find(r => r.id == id);

    if (room) {
        document.getElementById('room-name').value = room.name;
        document.getElementById('room-capacity').value = room.capacity;
        document.getElementById('room-image').value = room.image_url;
    }

    toggleModal();
}

async function deleteRoom(id) {
    if (confirm("Voulez-vous vraiment supprimer cette salle ?")) {
        await fetch(`${API_URL}&id=${id}`, { method: 'DELETE' });
        fetchRooms();
    }
}

document.addEventListener('DOMContentLoaded', fetchRooms);