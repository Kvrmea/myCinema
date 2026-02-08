const API_URL = "http://localhost:8000/index.php?resource=movies";

// --- GESTION DU MODAL ---
function toggleModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (modal.classList.contains('hidden')) {
            resetForm();
        }
    }
}

// --- CHARGEMENT DES FILMS (GRILLE) ---
async function fetchMovies(genre = "", year = "") {
    let url = API_URL;
    if (genre !== "") url += `&genre=${encodeURIComponent(genre)}`;
    if (year !== "") url += `&year=${encodeURIComponent(year)}`;

    try {
        const response = await fetch(url);
        const movies = await response.json();
        const grid = document.getElementById('movie-grid');
        if (!grid) return;

        grid.innerHTML = "";

        movies.forEach(movie => {
            // IMAGE DE SECOURS : Unsplash par mot-clé (Titre du film)
            const fallback = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500`;             
            // Si l'URL est vide ou trop courte, on génère une image basée sur le titre
            let posterUrl = movie.image_url;
            if (!posterUrl || posterUrl.length < 10) {
                posterUrl = `https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500`;
            }

            grid.innerHTML += `
                <div class="group relative bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800 hover:border-red-600 transition-all duration-500 shadow-2xl aspect-[2/3]">
                    <img src="${posterUrl}" 
                         alt="${movie.title}" 
                         onerror="this.onerror=null; this.src='${fallback}';" 
                         class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <h3 class="text-xl font-black italic uppercase tracking-tighter mb-1 text-white">${movie.title}</h3>
                        <p class="text-red-500 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">${movie.genre || 'Cinéma'} • ${movie.release_year}</p>
                        
                        <div class="flex gap-2">
                            <button onclick="editMovie(${movie.id})" class="flex-1 bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition">Modifier</button>
                            <button onclick="deleteMovie(${movie.id})" class="bg-zinc-800/90 text-white p-3 rounded-xl hover:bg-red-600 transition">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erreur d'affichage :", error);
    }
}

// --- LOGIQUE DU FORMULAIRE (AJOUT & MODIFICATION) ---
let editMode = false;
let currentMovieId = null;

const movieForm = document.getElementById('add-movie-form');
if (movieForm) {
    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const movieData = {
            title: document.getElementById('title').value,
            image_url: document.getElementById('poster_url').value,
            release_year: document.getElementById('release_year').value,
            duration: document.getElementById('duration').value,
            genre: document.getElementById('genre').value,
            director: document.getElementById('director').value,
            description: document.getElementById('description').value
        };

        const method = editMode ? 'PUT' : 'POST';
        if (editMode) movieData.id = currentMovieId;

        try {
            const response = await fetch(API_URL, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });

            if (response.ok) {
                toggleModal();
                fetchMovies();
                movieForm.reset();
            } else {
                alert("Erreur lors de l'enregistrement du film.");
            }
        } catch (error) {
            console.error("Erreur submit:", error);
        }
    });
}

// --- FONCTION ÉDITION ---
async function editMovie(id) {
    try {
        const response = await fetch(API_URL);
        const movies = await response.json();
        const movie = movies.find(m => m.id == id);

        if (movie) {
            editMode = true;
            currentMovieId = id;

            // Remplissage des champs
            document.getElementById('title').value = movie.title;
            document.getElementById('poster_url').value = movie.image_url || '';
            document.getElementById('release_year').value = movie.release_year;
            document.getElementById('duration').value = movie.duration;
            document.getElementById('genre').value = movie.genre || '';
            document.getElementById('director').value = movie.director || '';
            document.getElementById('description').value = movie.description || '';

            // Update UI Modal
            document.getElementById('modal-title').innerText = "Modifier le Film";
            document.getElementById('submit-btn').innerText = "Mettre à jour";
            
            toggleModal();
        }
    } catch (error) {
        console.error("Erreur editMovie:", error);
    }
}

// --- SUPPRESSION ---
async function deleteMovie(id) {
    if (confirm("Es-tu sûr de vouloir supprimer ce film ?")) {
        try {
            const response = await fetch(`${API_URL}&id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchMovies();
            } else {
                const result = await response.json();
                alert(result.message || "Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Erreur delete:", error);
        }
    }
}

// --- RÉINITIALISATION ---
function resetForm() {
    editMode = false;
    currentMovieId = null;
    if (movieForm) movieForm.reset();
    document.getElementById('modal-title').innerText = "Nouveau Film";
    document.getElementById('submit-btn').innerText = "Enregistrer";
}

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    const user = checkPermissions();
    const addBtn = document.getElementById('add-movie-btn');
    
    if (addBtn && (!user || user.role !== 'admin')) {
        addBtn.style.display = 'none';
    }
    
    fetchMovies();
});
// --- FONCTION POUR APPLIQUER LES FILTRES ---
function applyFilters() {
    const genre = document.getElementById('filter-genre').value;
    const year = document.getElementById('filter-year').value;
    
    // On appelle la fonction fetchMovies que tu as déjà, 
    // elle va construire l'URL avec ?genre=...&year=...
    fetchMovies(genre, year);
}

// --- FONCTION POUR RESET ---
function resetFilters() {
    document.getElementById('filter-genre').value = "";
    document.getElementById('filter-year').value = "";
    fetchMovies(); // Recharge tout
}

function checkPermissions() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        // Optionnel : Rediriger vers login si pas connecté
        // window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userData);
}

// Modifie ta boucle forEach dans fetchMovies :
movies.forEach(movie => {
    const user = checkPermissions();
    const isAdmin = user && user.role === 'admin';

    // On ne génère les boutons que si l'utilisateur est admin
    const adminButtons = isAdmin ? `
        <div class="flex gap-2">
            <button onclick="editMovie(${movie.id})" class="flex-1 bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition">Modifier</button>
            <button onclick="deleteMovie(${movie.id})" class="bg-zinc-800/90 text-white p-3 rounded-xl hover:bg-red-600 transition">🗑️</button>
        </div>
    ` : `
        <button class="w-full bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-700 transition">Réserver une place</button>
    `;

    grid.innerHTML += `
        <div class="group relative ...">
            <img src="${posterUrl}" ...>
            <div class="absolute ... p-6">
                <h3 class="..."> ${movie.title} </h3>
                <p class="..."> ${movie.genre} </p>
                ${adminButtons}
            </div>
        </div>
    `;
});