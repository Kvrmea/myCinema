const API_URL = "http://localhost:8000/index.php";

function toggleModal() {
    document.getElementById('modal').classList.toggle('hidden');
}

async function fetchMovies() {
    const response = await fetch(API_URL);
    const movies = await response.json();
    const tbody = document.getElementById('movie-table-body');
    tbody.innerHTML = "";

    movies.forEach(movie => {
        tbody.innerHTML += `
            <tr class="border-t border-zinc-800 hover:bg-zinc-800 transition">
                <td class="p-4 font-semibold">${movie.title}</td>
                <td class="p-4 text-gray-400">${movie.genre}</td>
                <td class="p-4 text-gray-400">${movie.release_year}</td>
                <td class="p-4 text-gray-400">${movie.duration} min</td>
                <td class="p-4">
                    <button class="text-blue-400 hover:underline mr-3">Modifier</button>
                    <button class="text-red-500 hover:underline">Supprimer</button>
                </td>
            </tr>
        `;
    });
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

document.addEventListener('DOMContentLoaded', fetchMovies);