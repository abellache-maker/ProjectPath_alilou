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


// === MESSAGE TABS ===
function switchMessageTab(tabName) {
  const tabs = document.querySelectorAll('.message-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  if (tabName === 'received') {
    renderList(recus);
  } else if (tabName === 'sent') {
    renderList(envoyes);
  }
}

// === Données messages (simulation) ===
let messages = JSON.parse(document.getElementById('message-data').textContent);

let selectedId = null;

const recus = messages.filter(m =>
    m.fields.receveur === null
);

const envoyes = messages.filter(m =>
    m.fields.emetteur === username
);

//Format dates
function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// === Render message list ===
function renderList(list,filter = "") {
    const panel = document.getElementById("messages-list");
    panel.innerHTML = "";

    const filtered = list.filter(m =>
        m.fields.emetteur.toLowerCase().includes(filter.toLowerCase()) ||
        m.fields.contenu.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        panel.innerHTML = `<div class="empty-state">
            <i class="fa-regular fa-comments fa-3x"></i>
            <p>Aucun message trouvé</p>
        </div>`;
        return;
    }

    filtered.forEach(msg => {
        const div = document.createElement("div");
        div.className = "msg-item" + (selectedId === msg.pk ? " selected" : "");
        div.dataset.id = msg.pk;

        div.innerHTML = `
        <div class="message-card">
            <div class="msg-info">
                <p class="msg-name">${msg.fields.emetteur}</p>
                <p class="msg-preview">Du projet: ${msg.fields.projet}</p>
                <p class="msg-date">${formatDate(msg.fields.created_at)}</p>
            </div>
        </div>
        `;

        div.addEventListener("click", () => selectMessage(msg.pk));
        panel.appendChild(div);
    });
}

// === Select & display message ===
function selectMessage(id) {
    selectedId = id;
    const msg = messages.find(m => m.pk === id);
    msg.unread = false;

    // Mark selected in list
    document.querySelectorAll(".msg-item").forEach(el => {
        el.classList.toggle("selected", parseInt(el.dataset.id) === id);
        if (parseInt(el.dataset.id) === id) {
            const dot = el.querySelector(".msg-unread-dot");
            if (dot) dot.remove();
        }
    });

    // Render detail panel
    const detail = document.getElementById("message-detail");
    detail.innerHTML = `
        <div class="detail-header">
            <div class="detail-meta">
                <h3>${msg.fields.emetteur} <span class="detail-badge"></span></h3>
                <p class="detail-date">${formatDate(msg.fields.created_at)}</p>
                <p>Rataché au projet ${msg.fields.projet}</p>
            </div>
        

        <div class="detail-body">
            <p>${msg.fields.contenu}</p>
        </div>
        </div>
    `;

    // Envoyer button dynamic style
    const input = detail.querySelector(".comment-input");
    const btn = detail.querySelector("#btn-envoyer");

    input.addEventListener("input", () => {
        if (input.value.trim().length > 0) {
            btn.classList.add("ready");
        } else {
            btn.classList.remove("ready");
        }
    });

    btn.addEventListener("click", () => {
        if (input.value.trim().length > 0) {
            alert("Message envoyé : " + input.value);
            input.value = "";
            btn.classList.remove("ready");
        }
    });
}

// === Tabs ===
document.querySelectorAll(".msg-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".msg-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        if (tab.dataset.tab === "recus") {
            renderListFrom(recus);
        } else {
            renderListFrom(envoyes);
        }
            //document.getElementById("message-list").innerHTML =
            //    `<div class="empty-state"><i class="fa-regular fa-comments fa-3x"></i><p>Aucun message envoyé</p></div>`;
            //document.getElementById("message-detail").innerHTML =
            //    `<div class="empty-detail-state"><i class="fa-regular fa-comments fa-3x"></i><p>Sélectionnez un message pour le lire</p></div>`;
        
    });
});

console.log(recus)
console.log(envoyes)
// === Init ===
renderList(recus);