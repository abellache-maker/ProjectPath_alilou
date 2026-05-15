// Gestion de la navigation
let buttons = document.querySelectorAll("nav .same");
buttons.forEach(btn => {
    btn.addEventListener("click", function() {
        let page = this.getAttribute("data-page");
        if (page) {
            window.location.href = page;
        }
    });
});

// Afficher les noms des fichiers sélectionnés
function showFileNames(input, targetId) {
    const target = document.getElementById(targetId);
    if (input.files.length === 0) {
        target.textContent = '';
    } else if (input.files.length === 1) {
        target.textContent = '✔ ' + input.files[0].name;
    } else {
        target.textContent = '✔ ' + input.files.length + ' fichiers sélectionnés';
    }
    target.style.color = '#10b981';
    target.style.fontWeight = '600';
}

// Ajouter des membres dynamiquement
let memberCount = 0;

function addMember() {
    memberCount++;
    const container = document.getElementById("members-container");
    const div = document.createElement("div");
    div.className = "member-row";
    div.id = `member-${memberCount}`;

    div.innerHTML = `
        <h3>Membre ${memberCount}</h3>
        <button class="btn-remove-member" onclick="removeMember(this)" title="Supprimer">
            <i class="fa-solid fa-trash"></i>
        </button>
        <div class="member-inputs">
            <div class="member-field">
                <label>Nom complet</label>
                <input type="text" placeholder="Ex: Ahmed Benali">
            </div>
            <div class="member-field">
                <label>Rôle</label>
                <input type="text" placeholder="Ex: Chef de projet">
            </div>
            <div class="member-field">
                <label>Email</label>
                <input type="email" placeholder="Ex: a.benali@ecole.dz">
            </div>
        </div>
    `;
    container.appendChild(div);
    updateDeleteButtons();
}

function removeMember(btn) {
    const row = btn.closest('.member-row');
    if (row) {
        row.remove();
        updateMemberNumbers();
    }
}

function updateDeleteButtons() {
    const members = document.querySelectorAll('.member-row');
    members.forEach(member => {
        const btn = member.querySelector('.btn-remove-member');
        if (members.length === 1) {
            // Masquer le bouton supprimer si un seul membre
            if (btn) btn.style.display = 'none';
        } else {
            if (btn) btn.style.display = 'block';
        }
    });
}

function updateMemberNumbers() {
    const members = document.querySelectorAll('.member-row');
    members.forEach((member, index) => {
        member.id = `member-${index + 1}`;
        member.querySelector('h3').innerText = `Membre ${index + 1}`;
    });
    updateDeleteButtons();
    memberCount = members.length;
}

// Initialiser le premier membre
addMember();

//trying to disable button after click:
function handleSubmit(form) {
  const button = form.querySelector('input[type="submit"]');
  button.disabled = true;
  button.value = "Envoi en cours...";
  return true; // allow submission
}