/* ====================================================
   script.js — Portfolio Interactions
   ==================================================== */

// ── 1. Year ──────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── 2. Animated Particle Background ──────────────────
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const COLORS = ['#00d4ff', '#7c3aed', '#0ea5e9', '#6366f1'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = rand(0, W);
      this.y = rand(0, H);
      this.vx = rand(-0.3, 0.3);
      this.vy = rand(-0.3, 0.3);
      this.radius = rand(1, 2.5);
      this.alpha = rand(0.2, 0.7);
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initParticles() {
    const count = Math.min(120, Math.floor(W * H / 9000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Draw subtle grid
  function drawGrid() {
    ctx.strokeStyle = 'rgba(0,212,255,0.03)';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // Radial glow blobs
  let t = 0;
  function drawGlows() {
    const blobs = [
      { x: W * 0.15, y: H * 0.25, r: 350, color: '0,212,255' },
      { x: W * 0.85, y: H * 0.7, r: 300, color: '124,58,237' },
      { x: W * 0.5, y: H * 0.5, r: 250, color: '0,212,255' },
    ];
    blobs.forEach((b, i) => {
      const pulse = Math.sin(t * 0.4 + i * 1.2) * 30;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r + pulse);
      g.addColorStop(0, `rgba(${b.color},0.06)`);
      g.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + pulse, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 0.02;
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    // Background base
    ctx.fillStyle = '#050a12';
    ctx.fillRect(0, 0, W, H);
    drawGrid();
    drawGlows();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
})();

// ── 3. Navbar scroll effect ───────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

// ── 4. Mobile nav toggle ─────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  navLinks.classList.contains('open')
    ? (spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)',
      spans[1].style.opacity = '0',
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)')
    : (spans[0].style.transform = '',
      spans[1].style.opacity = '',
      spans[2].style.transform = '');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = spans[1].style.opacity =
      spans[1].style.transform = spans[2].style.transform = '';
  });
});

// ── 5. Active nav link on scroll ─────────────────────
const sections = document.querySelectorAll('.section');
const navLinkEls = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = '#' + sec.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === current);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// ── 6. Intersection Observer (section fade-in) ────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Stagger children
        const children = entry.target.querySelectorAll(
          '.project-card, .cert-card, .achievement-card, .skill-category, .timeline-item, .info-card, .contact-item'
        );
        children.forEach((el, i) => {
          el.style.transitionDelay = `${i * 0.07}s`;
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    });
  },
  { threshold: 0.08 }
);

// Hero is always visible
document.getElementById('hero').classList.add('in-view');

sections.forEach(sec => {
  if (sec.id !== 'hero') {
    observer.observe(sec);
    // Set initial hidden state for child cards
    const children = sec.querySelectorAll(
      '.project-card, .cert-card, .achievement-card, .skill-category, .timeline-item, .info-card, .contact-item'
    );
    children.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
  }
});

// ── 7. Typed text effect ─────────────────────────────
const typedEl = document.getElementById('typed-text');
const phrases = [
  'Cybersecurity Enthusiast.',
  'CTF Player.',
  'Web Developer.',
  'Ethical Hacker (in training).',
  'Problem Solver.'
];

let phraseIdx = 0, charIdx = 0, deleting = false;

function typeWriter() {
  const current = phrases[phraseIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      setTimeout(() => { deleting = true; typeWriter(); }, 2200);
      return;
    }
    setTimeout(typeWriter, 65);
  } else {
    typedEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
    setTimeout(typeWriter, 38);
  }
}

typeWriter();

// ── 8. Parallax on hero visual ───────────────────────
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  window.addEventListener('mousemove', e => {
    const xPct = (e.clientX / window.innerWidth - 0.5) * 12;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 12;
    heroVisual.style.transform = `translate(${xPct}px, ${yPct}px)`;
  }, { passive: true });
}

// ── 9. Contact form → mailto ──────────────────────────
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('sender-name').value.trim();
  const email = document.getElementById('sender-email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) return;

  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}`
  );
  const mailto = `mailto:biprantkasyapbarman@gmail.com?subject=${subject}&body=${body}`;

  const btn = document.getElementById('send-btn');
  btn.innerHTML = '<i class="fas fa-check"></i> Opening Email Client…';
  btn.disabled = true;

  window.open(mailto, '_blank');

  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    btn.disabled = false;
    this.reset();
  }, 3000);
});

// ── 10. Smooth section transition glow on scroll ──────
(function () {
  const transitionEl = document.createElement('div');
  transitionEl.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 500;
    background: radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.5s ease;
  `;
  document.body.appendChild(transitionEl);

  let flashTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(flashTimer);
    transitionEl.style.opacity = '1';
    flashTimer = setTimeout(() => { transitionEl.style.opacity = '0'; }, 500);
  }, { passive: true });
})();

// ── 11. Skill pill glow on hover ─────────────────────
document.querySelectorAll('.skill-pill').forEach(pill => {
  pill.addEventListener('mouseenter', () => {
    pill.style.boxShadow = '0 0 18px rgba(0,212,255,0.3)';
  });
  pill.addEventListener('mouseleave', () => {
    pill.style.boxShadow = '';
  });
});

// ── 12. Cursor trail ─────────────────────────────────
(function () {
  const trail = [];
  const MAX = 10;

  for (let i = 0; i < MAX; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed; width: ${6 - i * 0.3}px; height: ${6 - i * 0.3}px;
      border-radius: 50%; background: rgba(0,212,255,${0.5 - i * 0.04});
      pointer-events: none; z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.2s;
    `;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function animateTrail() {
    trail[0].x = mouseX; trail[0].y = mouseY;
    for (let i = 1; i < MAX; i++) {
      trail[i].x += (trail[i - 1].x - trail[i].x) * 0.3;
      trail[i].y += (trail[i - 1].y - trail[i].y) * 0.3;
    }
    trail.forEach(t => {
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
    });
    requestAnimationFrame(animateTrail);
  }
  animateTrail();
})();
