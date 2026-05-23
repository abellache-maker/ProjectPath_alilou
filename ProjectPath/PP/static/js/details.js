document.addEventListener('DOMContentLoaded', () => {

    // 1. Bouton Retour
    const btnRetour = document.getElementById('btn-retour');
    if (btnRetour) {
        btnRetour.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    // 2. Gestion des onglets
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Retirer 'active' de tous les onglets et contenus
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Ajouter 'active' à l'onglet cliqué
            const target = e.target;
            target.classList.add('active');

            // Afficher le contenu correspondant
            const targetId = target.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 3. Gestion du bouton Envoyer
    const commentInput = document.querySelector('.comment-input');
    const btnEnvoyer = document.querySelector('.btn-envoyer');

    if (commentInput && btnEnvoyer) {
        commentInput.addEventListener('input', () => {
            if (commentInput.value.trim().length > 0) {
                btnEnvoyer.classList.add('ready');
            } else {
                btnEnvoyer.classList.remove('ready');
            }
        });
    }

});
