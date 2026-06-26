// Load content from content.json
fetch('/content.json')
  .then(r => r.json())
  .then(applyContent)
  .catch(() => console.warn('content.json not found, using defaults'));

function applyContent(d) {
  // Nav & Hero
  setText('site-name', d.name);
  setText('hero-greeting', d.greeting);
  setText('hero-name', d.name);
  setText('hero-title', d.title);
  setText('hero-desc', d.hero_desc);

  // About
  setText('about-heading', d.about_heading);
  setText('about-p1', d.about_p1);
  setText('about-p2', d.about_p2);
  setText('about-name', d.about_heading);
  setText('about-email', d.email);
  setText('about-location', d.location);

  // Skills
  renderList('skills-frontend', d.skills_frontend);
  renderList('skills-backend', d.skills_backend);
  renderList('skills-tools', d.skills_tools);

  // Projects
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = d.projects.map(p => `
    <div class="project-card fade-in">
      <div class="project-img">${p.title}</div>
      <div class="project-info">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="project-tags">
          ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          <a href="${p.github}" class="project-link">GitHub →</a>
          <a href="${p.live}" class="project-link">Live →</a>
        </div>
      </div>
    </div>
  `).join('');

  // Footer
  setText('footer-copy', `© ${new Date().getFullYear()} ${d.name}. All rights reserved.`);
  setAttr('footer-github', 'href', d.github_url);
  setAttr('footer-linkedin', 'href', d.linkedin_url);
  setAttr('footer-email', 'href', `mailto:${d.email}`);

  // Re-observe new elements for animation
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el.setAttribute(attr, value);
}

function renderList(id, items) {
  const el = document.getElementById(id);
  if (!el || !items) return;
  el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

// Nav scroll effect
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Active link highlight
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
  });
});

// Scroll-in animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .about-grid').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Netlify Identity redirect
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}
