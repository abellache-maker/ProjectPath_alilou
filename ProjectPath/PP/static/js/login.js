const cnxBtns = document.querySelectorAll(".cnx");
const inscBtns = document.querySelectorAll(".insc");

const connexion = document.getElementById("connexion");
const inscription = document.getElementById("inscription");

// Connexion
cnxBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    connexion.classList.add("active");
    inscription.classList.remove("active");

    cnxBtns.forEach(b => b.classList.add("active"));
    inscBtns.forEach(b => b.classList.remove("active"));
  });
});

// Inscription
inscBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    inscription.classList.add("active");
    connexion.classList.remove("active");

    inscBtns.forEach(b => b.classList.add("active"));
    cnxBtns.forEach(b => b.classList.remove("active"));
  });
});

// Alert Notification Close Button
const closeButtons = document.querySelectorAll(".close-btn");
closeButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    const alert = this.closest(".alert");
    if (alert) {
      alert.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        alert.remove();
      }, 300);
    }
  });
});

// Auto-close alerts after 8 seconds (optional)
setTimeout(() => {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach(alert => {
    setTimeout(() => {
      if (alert.parentElement) {
        alert.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => {
          alert.remove();
        }, 300);
      }
    }, 8000);
  });
}, 100);

// Client-side empty field validation
document.addEventListener("DOMContentLoaded", function() {
  const forms = document.querySelectorAll("form");
  
  forms.forEach(form => {
    form.addEventListener("submit", function(event) {
      const requiredInputs = form.querySelectorAll("[required]");
      let hasEmpty = false;
      let emptyFields = [];
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          hasEmpty = true;
          // Get the label text for a better error message
          const label = form.querySelector(`label[for="${input.id}"]`);
          const fieldName = label ? label.textContent.replace(':', '') : input.name;
          emptyFields.push(fieldName);
        }
      });
      
      if (hasEmpty) {
        // Stop form from submitting natively
        event.preventDefault();
        
        // Remove existing client-side error if present
        const existingAlert = form.previousElementSibling?.classList.contains('alert-client-side') 
          ? form.previousElementSibling : null;
        if (existingAlert) existingAlert.remove();
        
        // Create custom alert
        const alertHtml = `
          <div class="alert alert-danger alert-dismissible alert-client-side">
            <span class="close-btn" onclick="this.parentElement.remove()">&times;</span>
            <strong>Erreur:</strong>
            <div>Veuillez remplir tous les champs obligatoires:</div>
            <ul>
              ${emptyFields.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        `;
        
        // Insert right before the form
        form.insertAdjacentHTML('beforebegin', alertHtml);
        
        // Let browser still show the first native tooltip for accessibility
        const firstEmpty = form.querySelector("[required]:invalid");
        if (firstEmpty) firstEmpty.reportValidity();
      }
    });
  });
});