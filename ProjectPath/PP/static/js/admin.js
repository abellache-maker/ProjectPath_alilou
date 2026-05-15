let projects = JSON.parse(
  document.getElementById('projects-data').textContent);

// Needs data
let needs = JSON.parse(document.getElementById('besoin-data').textContent);

// Comments storage
let comments = [];

// Current selected project
let currentProject = null;


// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
  renderProjects('pending');
  renderNeeds();
  updateStats();
});

// === PAGE NAVIGATION ===
function showPage(pageName) {
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));

  // Show selected page
  const selectedPage = document.getElementById(pageName + '-page');
  if (selectedPage) {
    selectedPage.classList.add('active');
  }

  // Update nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  event.target.closest('.nav-link').classList.add('active');
}

// === STATISTICS ===
function updateStats() {
  const total = projects.length;
  const pending = projects.filter(p => p.fields.statut=== 'EnAttente').length
                    + projects.filter(p => p.fields.statut=== 'NonVue').length;
  const approved = projects.filter(p => p.fields.statut === 'Accepte').length;
  const pendingNeeds = needs.filter(n => n.fields.statut === 'EnAttente').length 
                        +needs.filter(n => n.fields.statut === 'NonVue').length;

  document.getElementById('total-projects').textContent = total;
  document.getElementById('pending-projects').textContent = pending;
  document.getElementById('approved-projects').textContent = approved;
  document.getElementById('pending-needs').textContent = pendingNeeds;
  
  // Update tab counts
  updateTabCounts();
}

// === UPDATE TAB COUNTS ===
function updateTabCounts() {
  const total = projects.length;
  const pending = projects.filter(p => p.fields.statut === 'EnAttente').length
                  +projects.filter(p => p.fields.statut === 'NonVue').length;
  const approved = projects.filter(p => p.fields.statut === 'Accepte').length;
  
  const tabs = document.querySelectorAll('.filter-tabs .tab-btn');
  tabs.forEach(tab => {
    const text = tab.textContent;
    if (text.includes('En attente')) {
      tab.textContent = `En attente (${pending})`;
    } else if (text.includes('Tous les projets')) {
      tab.textContent = `Tous les projets (${total})`;
    } else if (text.includes('Approuvés')) {
      tab.textContent = `Approuvés (${approved})`;
    }
  });
}

// === PROJECT FILTERING ===
function filterProjects(filter) {
  // Update active tab
  const tabs = document.querySelectorAll('.filter-tabs .tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  // Filter and render
  renderProjects(filter);
}

function renderProjects(filter) {
  let filteredProjects = projects;

  if (filter === 'pending') {
    filteredProject = [projects.filter(p => p.fields.statut === 'EnAttente') , 
                  projects.filter(p => p.fields.statut === 'NonVue')];
    filteredProjects = filteredProject[0].concat(filteredProject[1]);
  } else if (filter === 'approved') {
    filteredProjects = projects.filter(p => p.fields.statut === 'Accepte');
  }

  const container = document.getElementById('projects-list');
  
  if (filteredProjects.length === 0) {
    container.innerHTML = '<div class="empty-state">Aucun projet trouvé</div>';
    return;
  }

  container.innerHTML = filteredProjects.map(project => `
    <div class="project-card">
      <div class="project-card-header">
        <div class="project-title-section">
          <div class="project-title">
            ${project.fields.nom_projet}
            <span class="badge ${project.fields.statut === 'EnAttente' ? 'pending' : project.fields.statut === 'Accepte' ? 'approved' : 'rejected'}">
              ${project.fields.statut}
            </span>
          </div>
          <span class="category-tag">${project.fields.domaine}</span>
        </div>
      </div>
      <p class="project-description">${project.fields.description}</p>
      <div class="project-meta">
        <span>📄 <a href ="/media/${project.fields.file_path}"> Document </a></span>
        <span>📅 Soumis le ${project.fields.created_at} </span>
      </div>
      <div class="project-actions">
        <a class="btn btn-view" href= "/project_details/${project.pk}/${user_id}/1">
        👁️ Voir détail
        </a>
      </div>
    </div>
  `).join('');
}

// === PROJECT STATUS UPDATE ===
function updateProjectStatus(projectId, newStatus) {
  const project = projects.find(p => p.id === projectId);
  if (project) {
    project.status = newStatus;
    
    // Add to history
    const statusText = newStatus === 'Approuvé' ? 'approuvé' : newStatus === 'Rejeté' ? 'rejeté' : 'modification demandée';
    project.history.push({
      event: `Projet ${statusText}`,
      date: new Date().toLocaleDateString('fr-FR')
    });

    // Update display - render all projects instead of just pending
    renderProjects('all');
    updateStats();
    
    // Update active tab to "Tous les projets"
    const tabs = document.querySelectorAll('.filter-tabs .tab-btn');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.textContent.includes('Tous les projets')) {
        tab.classList.add('active');
      }
    });
    
    alert(`Projet "${project.title}" ${statusText} avec succès!`);
  }
}

// === PROJECT DETAIL VIEW ===
//function viewProjectDetail(projectId) {
  //currentProject = projects.find(p => p.pk === projectId);
  //if (!currentProject) 
 //   return;

  // Render project header
 // const header = document.getElementById('project-header');
 // header.innerHTML = `
  //  <div class="project-title">
    //  ${currentProject.title}
      //<span class="badge ${currentProject.status === 'EnAttente' ? 'pending' : currentProject.status === 'Accepte' ? 'approved' : 'rejected'}">
        //${currentProject.status}
      //</span>
    //</div>
    //<span class="category-tag">${currentProject.category}</span>
    //<p class="project-description" style="margin-top: 16px;">${currentProject.description}</p>
    //<div class="project-meta" style="margin-top: 16px;">
    //  <span>📅 Soumis le ${currentProject.date}</span>
     // <span>👥 ${currentProject.members} membres</span>
      //<span>📄 ${currentProject.documents} documents</span>
    //</div>
  //`;

  // Render overview tab content
  //document.getElementById('project-problem').textContent = currentProject.problem;
  //document.getElementById('project-objectives').textContent = currentProject.objectives;
  
  //const teamContainer = document.getElementById('project-team');

  //teamContainer.innerHTML = `
  //<div class="team-member">👤 ${currentProject.participants}</div>
//`;

  // Render status badge
  //const statusBadge = document.getElementById('project-status-badge');
  //statusBadge.innerHTML = `
   // <span class="badge ${currentProject.fields.statut === 'EnAttente' ? 'pending' : currentProject.fields.statut === 'Accepte' ? 'approved' : 'rejected'}">
    //  ${currentProject.status}
   // </span>
  //`;


  // Render project needs
  //renderProjectNeeds('all');
  
  // Update detail tab counts
  //updateDetailTabCounts();

  // Render documents
  //const docsContainer = document.getElementById('documents-list');
  //docsContainer.innerHTML = `
    //<div class="document-item">
      //<div class="document-info">
       // <div class="document-icon">📄</div>
       // <div>
       //   <div class="document-name">Présentation_${currentProject.title}.pdf</div>
      //    <div class="document-type">PDF Document</div>
     //   </div>
    //  </div>
   //   <button class="btn-download">⬇️ Télécharger</button>
  //  </div>
  //`;

  // Show project detail page
  //showPageDirect('project-detail');
//}

function showPageDirect(pageName) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(pageName + '-page').classList.add('active');
}

// === DETAIL TABS ===
function switchDetailTab(tabName) {
  // Update tab buttons
  const tabs = document.querySelectorAll('.detail-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  // Update tab content
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
}

// === PROJECT NEEDS ===
function filterProjectNeeds(filter) {
  // Update active tab
  const tabs = document.querySelectorAll('#tab-needs .tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  renderProjectNeeds(filter);
}

function renderProjectNeeds(filter) {
  if (!currentProject) return;

  let projectNeeds = needs.filter(n => n.projectId === currentProject.id);

  if (filter === 'approved') {
    projectNeeds = projectNeeds.filter(n => n.status === 'Accepte');
  } else if (filter === 'rejected') {
    projectNeeds = projectNeeds.filter(n => n.status === 'Refuse');
  } else if (filter === 'pending') {
    projectNeeds = projectNeeds.filter(n => n.status === 'EnAttente');
  }

  const container = document.getElementById('project-needs-list');
  
  if (projectNeeds.length === 0) {
    container.innerHTML = '<div class="empty-state">Aucun besoin trouvé</div>';
    return;
  }

  container.innerHTML = projectNeeds.map(need => `
    <div class="need-card">
      <div class="need-header">
        <div>
          <div class="need-type">${need.fields.typeDeBesoin}</div>
          <div class="need-badges">
            <span class="badge ${need.fields.statut === 'EnAttente' ? 'pending' : need.statut === 'Accepte' ? 'approved' : 'rejected'}">
              ${need.fields.statut}
            </span>
            <span class="priority-badge ${need.fields.priority.includes('Elevee') ? 'high' : need.fields.priority.includes('Moyenne') ? 'medium' : 'low'}">
              ${need.fields.priority}
            </span>
          </div>
        </div>
      </div>
      <p class="need-description"><strong>${need.fields.description}</strong></p>
      <p class="need-description"><strong>Justification:</strong> ${need.fields.justification}</p>
      <div class="need-actions">
        <button class="btn btn-approve" onclick="updateNeedStatus(${need.pk}, 'Approuvé')" ${need.fields.statut === 'Approuvé' ? 'disabled' : ''}>
          ✅ Approuver
        </button>
        <button class="btn btn-reject" onclick="updateNeedStatus(${need.pk}, 'Rejeté')" ${need.fields.statut === 'Rejeté' ? 'disabled' : ''}>
          ❌ Refuser
        </button>
      </div>
    </div>
  `).join('');
  
  // Update need tab counts
  updateNeedTabCounts();
}

// === NEEDS MANAGEMENT ===
function renderNeeds() {
  const container = document.getElementById('needs-list');
  
  if (needs.length === 0) {
    container.innerHTML = '<div class="empty-state">Aucun besoin trouvé</div>';
    return;
  }

  container.innerHTML = needs.map(need => `
    <div class="need-card">
      <div class="need-header">
        <div>
          <div class="need-type">${need.fields.typeDeBesoin}</div>
          <div class="need-badges">
            <span class="badge ${need.fields.statut === 'EnAttente' ? 'pending' : need.fields.statut === 'Accepte' ? 'approved' : 'rejected'}">
              ${need.fields.statut}
            </span>
            <span class="priority-badge ${need.fields.priority.includes('Elevee') ? 'high' : need.fields.priority.includes('Moyenne') ? 'medium' : 'low'}">
              ${need.fields.priority}
            </span>
          </div>
        </div>
      </div>
      <p class="need-project"><strong>Projet:</strong> ${need.fields.projet_concerne}</p>
      <p class="need-description">${need.fields.description}</p>
      <p class="need-description"><strong>Justification:</strong> ${need.fields.justification}</p>
      ${need.fields.statut === 'EnAttente' ? `
        <div class="need-actions">
          <button class="btn btn-approve" onclick="updateNeedStatus(${need.pk}, 'Accepte')">
            ✅ Approuver
          </button>
          <button class="btn btn-reject" onclick="updateNeedStatus(${need.pk}, 'Refuse')">
            ❌ Refuser
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function updateNeedStatus(needId, newStatus) {
  const need = needs.find(n => n.id === needId);
  if (need) {
    need.status = newStatus;
    renderNeeds();
    updateStats();
    
    if (currentProject) {
      renderProjectNeeds('all');
      updateDetailTabCounts();
    }
    
    alert(`Besoin "${need.type}" ${newStatus === 'Approuvé' ? 'approuvé' : 'rejeté'} avec succès!`);
  }
}

// === UPDATE NEED TAB COUNTS ===
function updateNeedTabCounts() {
  if (!currentProject) return;
  
  const projectNeeds = needs.filter(n => n.projectId === currentProject.id);
  const total = projectNeeds.length;
  const unseen = projectNeeds.filter(n => n.status === 'NonVu').length;;
  const pending = projectNeeds.filter(n => n.status === 'EnAttente').length;
  const approved = projectNeeds.filter(n => n.status === 'Accepte').length;
  const rejected = projectNeeds.filter(n => n.status === 'Refuse').length;
  
  const tabs = document.querySelectorAll('#tab-needs .tab-btn');
  tabs.forEach(tab => {
    const text = tab.textContent;
    if (text.includes('Tous')) {
      tab.textContent = `Tous (${total})`;
    } else if (text.includes('Approuvés')) {
      tab.textContent = `Approuvés (${approved})`;
    } else if (text.includes('Rejetés')) {
      tab.textContent = `Rejetés (${rejected})`;
    } else if (text.includes('En attente')) {
      tab.textContent = `En attente (${pending} + ${unseen})`;
    }
  });
}

// === UPDATE DETAIL TAB COUNTS ===
function updateDetailTabCounts() {
  if (!currentProject) return;
  
  const projectNeeds = needs.filter(n => n.projectId === currentProject.id);
  const needsCount = projectNeeds.length;
  const docsCount = currentProject.documents;
  
  const tabs = document.querySelectorAll('.detail-tab');
  tabs.forEach(tab => {
    const text = tab.textContent;
    if (text.includes('Besoins')) {
      tab.textContent = `Besoins (${needsCount})`;
    } else if (text.includes('Documents')) {
      tab.textContent = `Documents (${docsCount})`;
    }
  });
}

// === COMMENTS ===
function addComment() {
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  
  if (!text) {
    alert('Veuillez entrer un commentaire');
    return;
  }

  const comment = {
    author: 'Administrateur',
    text: text,
    date: new Date().toLocaleString('fr-FR')
  };

  comments.push(comment);
  
  // Render comments
  const container = document.getElementById('comments-list');
  container.innerHTML = comments.map(c => `
    <div class="comment">
      <div class="comment-author">${c.author}</div>
      <div class="comment-text">${c.text}</div>
      <div class="comment-date">${c.date}</div>
    </div>
  `).join('');

  // Clear input
  input.value = '';
}

