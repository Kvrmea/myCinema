document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch('http://localhost:8000/index.php?resource=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // On stocke le jeton ou l'info utilisateur
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html'; // Redirection après succès
        } else {
            errorMsg.innerText = data.message || "Identifiants incorrects";
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Erreur login:", error);
    }
});