
// ================= DONNÉES SIMULÉES (MOCK DATA) =================

const mockUser = {
    name: "User_name", // Tel que sur la maquette
    program: "Génie Informatique",
    level: "Master 2"
};

const mockProjects = [
    {
        id: "1",
        name: "EduConnect",
        domain: "EdTech",
        description: "Une plateforme d'apprentissage en ligne qui connecte les étudiants avec des mentors et des ressources éducatives personnalisées.",
        status: "approved", // approved, pending, revision
        documentsCount: 2,
        membersCount: 3,
        comment: {
            author: "Dr. Hicham Tahiri",
            text: "Excellent projet ! Nous approuvons votre demande. Contactez-nous pour discuter des prochaines étapes."
        }
    },
    {
        id: "2",
        name: "GreenCity",
        domain: "Environnement & Tech",
        description: "Application mobile pour promouvoir les pratiques écologiques en ville et récompenser les citoyens éco-responsables.",
        status: "pending",
        documentsCount: 1,
        membersCount: 2,
        comment: null
    }
];

const mockNeeds = [
    {
        id: "1",
        title: "Matériel",
        description: "2 ordinateurs portables pour le développement",
        status: "approved",
        priority: "Haute priorité",
        response: "Approuvé. Matériel disponible au laboratoire informatique."
    },
    {
        id: "2",
        title: "Espace",
        description: "Salle de réunion pour les sessions de mentorat",
        status: "pending",
        priority: "Moyenne priorité",
        response: "Validation en cours..."
    },
    {
        id: "3",
        title: "Budget",
        description: "Budget de 5000 DH pour le marketing initial",
        status: "pending",
        priority: "Haute priorité",
        response: ""
    }
];

// ================= FONCTIONS UTILITAIRES =================

function getStatusBadgeHTML(status) {
    if (status === 'approved') return '<span class="badge badge-green"><i class="fa-regular fa-circle-check"></i> Approuvé</span>';
    if (status === 'pending') return '<span class="badge badge-yellow"><i class="fa-regular fa-clock"></i> En attente</span>';
    if (status === 'revision') return '<span class="badge badge-orange"><i class="fa-solid fa-pen"></i> À corriger</span>';
    return '';
}

// ================= RENDU DES COMPOSANTS =================

function renderProjects(filter = 'all') {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    const filteredProjects = mockProjects.filter(p => filter === 'all' || p.status === filter);

    if (filteredProjects.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Aucun projet trouvé.</p>';
        return;
    }

    filteredProjects.forEach(p => {
        let commentHTML = '';
        if (p.comment) {
            commentHTML = `
                <div class="comment-box">
                    <p class="comment-author">Dernier commentaire de ${p.comment.author}:</p>
                    <p class="comment-text">${p.comment.text}</p>
                </div>
            `;
        }

        const card = `
            <div class="project-card">
                <div class="project-header-row">
                    <h3 class="project-name">${p.name}</h3>
                    ${getStatusBadgeHTML(p.status)}
                    <span class="badge badge-outline">${p.domain}</span>
                </div>
                <p class="project-desc">${p.description}</p>
                <div class="project-footer">
                    <div class="project-meta">
                        <span><i class="fa-regular fa-file-lines"></i> ${p.documentsCount} documents</span>
                        <span><i class="fa-solid fa-user-group"></i> ${p.membersCount} membres</span>
                    </div>
                    <button class="btn btn-outline" onclick="window.location.href='details.html'"><i class="fa-regular fa-eye"></i> Voir détails</button>
                </div>
                ${commentHTML}
            </div>
        `;
        container.innerHTML += card;
    });
}

function renderNeeds() {
    const container = document.getElementById('needs-container');
    container.innerHTML = '';

    mockNeeds.forEach(n => {
        let responseHTML = '';
        if (n.status === 'approved') {
            responseHTML = `<div class="need-response green"><i class="fa-solid fa-check"></i> ${n.response}</div>`;
        } else if (n.status === 'pending' && n.response) {
            responseHTML = `<div class="need-response yellow"><i class="fa-regular fa-clock"></i> ${n.response}</div>`;
        }

        let priorityClass = n.priority.includes('Haute') ? 'badge-priority' : 'badge-priority-medium';

        const card = `
            <div class="need-card">
                <div class="need-title-row">
                    <h3 class="need-name">${n.title}</h3>
                    ${getStatusBadgeHTML(n.status)}
                    <span class="badge ${priorityClass}">${n.priority}</span>
                </div>
                <p class="need-desc">${n.description}</p>
                ${responseHTML}
            </div>
        `;
        container.innerHTML += card;
    });
}

function updateStats() {
    // Projets
    document.getElementById('stat-total-val').textContent = mockProjects.length;
    
    const approvedCount = mockProjects.filter(p => p.status === 'approved').length;
    document.getElementById('stat-approved-val').textContent = approvedCount;
    
    const pendingCount = mockProjects.filter(p => p.status === 'pending').length;
    document.getElementById('stat-pending-val').textContent = pendingCount;

    // Besoins
    document.getElementById('stat-needs-val').textContent = mockNeeds.length;
    const needsApproved = mockNeeds.filter(n => n.status === 'approved').length;
    document.getElementById('stat-needs-approved').textContent = needsApproved;

    // Mise à jour des compteurs dans les onglets
    document.getElementById('tab-all-count').textContent = mockProjects.length;
    document.getElementById('tab-approved-count').textContent = approvedCount;
    document.getElementById('tab-pending-count').textContent = pendingCount;
    document.getElementById('tab-revision-count').textContent = mockProjects.filter(p => p.status === 'revision').length;
}

// ================= INITIALISATION ET ÉVÉNEMENTS =================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialisation des données
    if (document.getElementById("userNameHero")) {
        document.getElementById("userNameHero").textContent = mockUser.name;
    }
    updateStats();
    renderProjects('all');
    renderNeeds();

    // 2. Gestion des onglets Projets
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Retirer la classe active de tous
            tabs.forEach(t => t.classList.remove('active'));
            // Ajouter active au cliqué
            e.target.classList.add('active');
            // Filtrer
            const filter = e.target.getAttribute('data-filter');
            renderProjects(filter);
        });
    });

    // 3. Gestion de la navigation d'origine (Nav bar)
    const navButtons = document.querySelectorAll("nav .same");
    navButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            let page = this.getAttribute("data-page");
            if (page) {
                window.location.href = page;
            }
        });
    });

    // Gestion du bouton actif automatiquement dans la nav
    let currentPage = window.location.pathname.split("/").pop() || 'dashboard.html';
    navButtons.forEach(btn => {
        let page = btn.getAttribute("data-page");
        if (page === currentPage) {
            btn.classList.add("active");
        }
    });

    // 4. RÉPARATION DES BOUTONS QUI NE MARCHAIENT PAS
    // Boutons "Nouveau projet"
    const btnNouveauProjet = document.querySelectorAll('.action-nouveau-projet');
    btnNouveauProjet.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'soumission.html';
        });
    });

    // Boutons "Déclarer un besoin"
    const btnDeclarerBesoin = document.querySelectorAll('.action-declarer-besoin');
    btnDeclarerBesoin.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'besoin.html';
        });
    });
});
