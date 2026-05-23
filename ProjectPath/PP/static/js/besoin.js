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

// Afficher les noms des fichiers sélectionnés (besoin)
function showFileNamesBesoin(input) {
    const target = document.getElementById('file-name-besoin');
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

// === Custom Select : Type de besoin ===
function toggleDropdown(id) {
    const cs = document.getElementById(id);
    cs.classList.toggle('open');
}

// Fermer le dropdown si on clique en dehors
document.addEventListener('click', function(e) {
    const cs = document.getElementById('custom-select-besoin');
    if (cs && !cs.contains(e.target)) {
        cs.classList.remove('open');
    }
});

// Sélectionner une option
document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('#custom-select-besoin .cs-options li');
    items.forEach(item => {
        item.addEventListener('click', function() {
            const val = this.dataset.value;
            const text = this.querySelector('span').innerHTML;

            // Mettre à jour le trigger
            const trigger = document.querySelector('#custom-select-besoin .cs-selected-text');
            trigger.innerHTML = this.innerHTML;
            trigger.classList.add('chosen');

            // Mettre à jour l'input hidden
            document.getElementById('besoin-type-value').value = val;

            // Marquer l'item sélectionné
            items.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');

            // Fermer
            document.getElementById('custom-select-besoin').classList.remove('open');
        });
    });
});


//trying to disable button after click:
function handleSubmit(form) {
  const button = form.querySelector('input[type="submit"]');
  button.disabled = true;
  button.value = "Envoi en cours...";
  return true; // allow submission
}