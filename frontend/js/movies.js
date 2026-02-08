const API_URL = "http://localhost:8000/index.php?resource=movies";

function toggleModal() {
    document.getElementById('modal').classList.toggle('hidden');
}

// fetchMovies accepte maintenant des filtres ---
async function fetchMovies(genre = "", year = "") {
    let url = API_URL;
    
    // Si on a des filtres, on les ajoute à l'URL
    if (genre !== "") url += `&genre=${encodeURIComponent(genre)}`;
    if (year !== "") url += `&year=${encodeURIComponent(year)}`;

    console.log("Appel API vers :", url);

    try {
        const response = await fetch(url);
        const movies = await response.json();
        const tbody = document.getElementById('movie-table-body');
        tbody.innerHTML = "";

        // Sécurité si aucun film n'est trouvé (retourne un tableau vide)
        if (!Array.isArray(movies) || movies.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 italic">Aucun film ne correspond à ces critères.</td></tr>`;
            return;
        }

        movies.forEach(movie => {
            tbody.innerHTML += `
                <tr class="border-t border-zinc-800 hover:bg-zinc-800 transition">
                    <td class="p-4 font-semibold">${movie.title}</td>
                    <td class="p-4 text-gray-400">${movie.genre}</td>
                    <td class="p-4 text-gray-400">${movie.release_year}</td>
                    <td class="p-4 text-gray-400">${movie.duration} min</td>
                    <td class="p-4">
                        <button class="text-blue-400 hover:underline mr-3">Modifier</button>
                        <button onclick="deleteMovie(${movie.id})" class="text-red-500 hover:underline">Supprimer</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erreur fetchMovies:", error);
    }
}

// --- AJOUT : Fonction pour lire les menus déroulants ---
function applyFilters() {
    const genre = document.getElementById('filter-genre').value;
    const year = document.getElementById('filter-year').value;
    fetchMovies(genre, year);
}

// --- AJOUT : Fonction reset ---
function resetFilters() {
    document.getElementById('filter-genre').value = "";
    document.getElementById('filter-year').value = "";
    fetchMovies();
}

// Ajouter un film 
document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const movieData = {
        title: document.getElementById('title').value,
        release_year: document.getElementById('release_year').value,
        duration: document.getElementById('duration').value,
        genre: document.getElementById('genre').value,
        director: document.getElementById('director').value,
        description: document.getElementById('description').value
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(movieData)
    });

    if (response.ok) {
        toggleModal();
        fetchMovies();
        e.target.reset();
    } else {
        alert("Erreur lors de l'ajout");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
});

async function deleteMovie(id) {
    if (confirm("Es-tu sûr de vouloir supprimer ce film ?")) {
        const response = await fetch(`${API_URL}&id=${id}`, { 
            method: 'DELETE'
        });

        if (response.ok) {
            fetchMovies();
        } else {
            const result = await response.json();
            alert(result.message);
        }
    }
}