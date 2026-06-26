// ===== Content Loading =====
let currentData = {};

fetch('/content.json')
  .then(r => r.json())
  .then(data => {
    currentData = data;
    applyContent(data);
  })
  .catch(() => console.warn('content.json을 불러올 수 없습니다.'));

function applyContent(d) {
  setText('site-name', d.name);
  setText('hero-greeting', d.greeting);
  setText('hero-name', d.name);
  setText('hero-title', d.title);
  setText('hero-desc', d.hero_desc);

  setText('about-heading', d.name);
  setText('about-p1', d.about_p1);
  setText('about-p2', d.about_p2);
  setText('about-name', d.name);
  setText('about-email', d.email);
  setText('about-location', d.location);

  renderSkillList('skills-list', d.skills);
  renderSkillList('skills-tools', d.skills_tools);

  const grid = document.getElementById('projects-grid');
  grid.innerHTML = (d.projects || []).map(p => `
    <div class="project-card fade-in">
      <div class="project-img">${p.title}</div>
      <div class="project-info">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="project-tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          <a href="${p.github}" class="project-link">GitHub →</a>
          <a href="${p.live}" class="project-link">Live →</a>
        </div>
      </div>
    </div>
  `).join('');

  setText('footer-copy', `© ${new Date().getFullYear()} ${d.name}. All rights reserved.`);
  setAttr('footer-github', 'href', d.github_url);
  setAttr('footer-linkedin', 'href', d.linkedin_url);
  setAttr('footer-email', 'href', `mailto:${d.email}`);

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el.setAttribute(attr, value);
}

function renderSkillList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = (items || []).map(item => `<li>${item}</li>`).join('');
}

// ===== Nav & Scroll =====
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);

  let current = '';
  document.querySelectorAll('section[id]').forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
  });
});

// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .about-grid').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== Netlify Identity =====
window.addEventListener('load', () => {
  if (!window.netlifyIdentity) return;

  netlifyIdentity.on('init', user => setEditMode(!!user));
  netlifyIdentity.on('login', () => {
    setEditMode(true);
    netlifyIdentity.close();
  });
  netlifyIdentity.on('logout', () => {
    setEditMode(false);
    closePanel();
  });
});

function setEditMode(loggedIn) {
  const fab = document.getElementById('editFab');
  fab.style.display = loggedIn ? 'flex' : 'none';
}

document.getElementById('adminLoginBtn').addEventListener('click', () => {
  window.netlifyIdentity && netlifyIdentity.open('login');
});

// ===== Edit Panel =====
const editPanel = document.getElementById('editPanel');
const editOverlay = document.getElementById('editOverlay');

document.getElementById('editFab').addEventListener('click', openPanel);
document.getElementById('editPanelClose').addEventListener('click', closePanel);
editOverlay.addEventListener('click', closePanel);
document.getElementById('logoutBtn').addEventListener('click', () => {
  window.netlifyIdentity && netlifyIdentity.logout();
});

function openPanel() {
  populatePanel(currentData);
  editPanel.classList.add('open');
  editOverlay.classList.add('open');
}

function closePanel() {
  editPanel.classList.remove('open');
  editOverlay.classList.remove('open');
}

function populatePanel(d) {
  const simpleFields = ['name', 'greeting', 'title', 'hero_desc', 'about_p1', 'about_p2', 'email', 'location', 'github_url', 'linkedin_url'];
  simpleFields.forEach(key => {
    const el = document.getElementById(`e-${key}`);
    if (el) el.value = d[key] || '';
  });

  renderEditList('e-skills-container', d.skills, 'skills');
  renderEditList('e-tools-container', d.skills_tools, 'skills_tools');
  renderEditProjects(d.projects || []);
}

function renderEditList(containerId, items, dataKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = (items || []).map((item, i) => `
    <div class="edit-list-item">
      <input type="text" value="${escHtml(item)}" data-key="${dataKey}" data-index="${i}" />
      <button class="edit-list-remove" onclick="removeListItem('${dataKey}', ${i})">×</button>
    </div>
  `).join('');
}

function renderEditProjects(projects) {
  const container = document.getElementById('e-projects-container');
  container.innerHTML = projects.map((p, i) => `
    <div class="edit-project-item">
      <div class="edit-project-header">
        <span>프로젝트 ${i + 1}</span>
        <button class="edit-project-remove" onclick="removeProject(${i})">× 삭제</button>
      </div>
      <div class="edit-project-field">
        <label>제목</label>
        <input type="text" id="ep-title-${i}" value="${escHtml(p.title)}" />
      </div>
      <div class="edit-project-field">
        <label>설명</label>
        <textarea id="ep-desc-${i}">${escHtml(p.description)}</textarea>
      </div>
      <div class="edit-project-field">
        <label>태그 (쉼표로 구분)</label>
        <input type="text" id="ep-tags-${i}" value="${escHtml((p.tags || []).join(', '))}" />
      </div>
      <div class="edit-project-field">
        <label>GitHub 링크</label>
        <input type="text" id="ep-github-${i}" value="${escHtml(p.github)}" />
      </div>
      <div class="edit-project-field">
        <label>라이브 링크</label>
        <input type="text" id="ep-live-${i}" value="${escHtml(p.live)}" />
      </div>
    </div>
  `).join('');
}

function removeListItem(dataKey, index) {
  collectData();
  currentData[dataKey].splice(index, 1);
  populatePanel(currentData);
}

function removeProject(index) {
  collectData();
  currentData.projects.splice(index, 1);
  populatePanel(currentData);
}

document.getElementById('e-add-skill').addEventListener('click', () => {
  collectData();
  if (!currentData.skills) currentData.skills = [];
  currentData.skills.push('');
  populatePanel(currentData);
  const inputs = document.querySelectorAll('[data-key="skills"]');
  inputs[inputs.length - 1]?.focus();
});

document.getElementById('e-add-tool').addEventListener('click', () => {
  collectData();
  if (!currentData.skills_tools) currentData.skills_tools = [];
  currentData.skills_tools.push('');
  populatePanel(currentData);
  const inputs = document.querySelectorAll('[data-key="skills_tools"]');
  inputs[inputs.length - 1]?.focus();
});

document.getElementById('e-add-project').addEventListener('click', () => {
  collectData();
  if (!currentData.projects) currentData.projects = [];
  currentData.projects.push({ title: '', description: '', tags: [], github: '#', live: '#' });
  populatePanel(currentData);
});

function collectData() {
  const data = { ...currentData };

  const simpleFields = ['name', 'greeting', 'title', 'hero_desc', 'about_p1', 'about_p2', 'email', 'location', 'github_url', 'linkedin_url'];
  simpleFields.forEach(key => {
    const el = document.getElementById(`e-${key}`);
    if (el) data[key] = el.value;
  });

  data.skills = Array.from(document.querySelectorAll('[data-key="skills"]')).map(el => el.value).filter(Boolean);
  data.skills_tools = Array.from(document.querySelectorAll('[data-key="skills_tools"]')).map(el => el.value).filter(Boolean);

  data.projects = (currentData.projects || []).map((_, i) => ({
    title: document.getElementById(`ep-title-${i}`)?.value || '',
    description: document.getElementById(`ep-desc-${i}`)?.value || '',
    tags: (document.getElementById(`ep-tags-${i}`)?.value || '').split(',').map(t => t.trim()).filter(Boolean),
    github: document.getElementById(`ep-github-${i}`)?.value || '#',
    live: document.getElementById(`ep-live-${i}`)?.value || '#'
  }));

  currentData = data;
  return data;
}

// ===== Save to GitHub via Git Gateway =====
document.getElementById('saveBtn').addEventListener('click', async () => {
  const data = collectData();
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.textContent = '저장 중...';
  saveBtn.disabled = true;

  try {
    const user = window.netlifyIdentity?.currentUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const token = user.token.access_token;

    const fileRes = await fetch('/.netlify/git/github/contents/content.json', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fileData = await fileRes.json();

    const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2));
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    const encoded = btoa(binary);

    const saveRes = await fetch('/.netlify/git/github/contents/content.json', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update portfolio content',
        content: encoded,
        sha: fileData.sha
      })
    });

    if (!saveRes.ok) throw new Error('저장 실패');

    applyContent(data);
    saveBtn.textContent = '저장 완료 ✓';
    setTimeout(() => {
      saveBtn.textContent = '저장하기';
      saveBtn.disabled = false;
    }, 2500);
  } catch (err) {
    console.error(err);
    saveBtn.textContent = '저장 실패';
    saveBtn.disabled = false;
    setTimeout(() => { saveBtn.textContent = '저장하기'; }, 2000);
  }
});

// ===== Netlify Identity redirect =====
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/';
      });
    }
  });
}

function escHtml(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
