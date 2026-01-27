const API_URL = "http://localhost:8000";

async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/index.php`);
        const movies = await response.json();

        const grid = document.getElementById('movie-grid');
        grid.innerHTML = ""; // On vide le message de chargement

        movies.forEach(movie => {
            grid.innerHTML += `
                <div class="card bg-zinc-900 rounded-md overflow-hidden shadow-lg cursor-pointer">
                    <div class="h-40 bg-zinc-800 flex items-center justify-center text-zinc-500 italic">
                        No Poster
                    </div>
                    <div class="p-3">
                        <h3 class="font-bold text-sm truncate">${movie.title}</h3>
                        <p class="text-xs text-gray-400">${movie.release_year} • ${movie.duration} min</p>
                        <span class="text-[10px] border border-gray-500 px-1 mt-2 inline-block">${movie.genre}</span>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
        document.getElementById('movie-grid').innerHTML = "<p class='text-red-500'>Impossible de charger les films.</p>";
    }
}

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", loadMovies);