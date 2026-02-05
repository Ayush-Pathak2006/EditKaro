import { firebaseConfig } from './Config/config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2. Main Logic Wrapper
(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const heroImg = document.getElementById("heroImg");
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  
  // Auth Elements
  const authBtn = document.getElementById("authBtn");
  const navList = mainNav ? mainNav.querySelector("ul") : null;

  // --- Theme Functions ---
  function setHeroImageForTheme(theme) {
    if (!heroImg) return;
    const lightSrc = heroImg.dataset.lightSrc;
    const darkSrc = heroImg.dataset.darkSrc;
    heroImg.src = theme === "dark" ? (darkSrc || lightSrc) : (lightSrc || darkSrc);
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("editkaro_theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    setHeroImageForTheme(theme);
    // Tell particles to update colors
    window.dispatchEvent(new CustomEvent('editkaro:theme-changed', { detail: { theme } }));
  }

  // Init Theme on Load
  const saved = localStorage.getItem("editkaro_theme");
  if (saved === "dark" || saved === "light") { setTheme(saved); }
  else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  // Toggle Click Event
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Mobile Nav Toggle
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", mainNav.classList.contains("open") ? "true" : "false");
    });
  }

  onAuthStateChanged(auth, async (user) => {
    // Remove old mobile name if it exists (prevents duplicates)
    const existingUserItem = document.getElementById("mobileUserItem");
    if (existingUserItem) existingUserItem.remove();

    if (user) {
      // --- USER LOGGED IN ---
      
      // 1. Get Name (Optimistic from Google first, then DB)
      let displayName = user.displayName;
      
      // Fetch DB name in background
      getDoc(doc(db, "users", user.uid)).then(docSnap => {
        if (docSnap.exists() && docSnap.data().name) {
          // If DB has a different name, update the UI
          const mobileItem = document.getElementById("mobileUserItem");
          if(mobileItem) mobileItem.innerHTML = `<span style="display:block; padding:8px 6px; color:var(--accent1); font-weight:700;">Hi, ${docSnap.data().name.split(' ')[0]}</span>`;
        }
      }).catch(e => console.log(e));

      // 2. Change Button to LOGOUT
      if (authBtn) {
        authBtn.textContent = "Logout";
        authBtn.href = "#";
        authBtn.onclick = (e) => {
          e.preventDefault();
          signOut(auth).then(() => window.location.reload());
        };
      }

      // 3. Add "Hi Name" to Mobile Menu
      if (navList) {
        const li = document.createElement("li");
        li.id = "mobileUserItem";
        li.innerHTML = `<span style="display:block; padding:8px 6px; color:var(--accent1); font-weight:700;">Hi, ${displayName ? displayName.split(' ')[0] : 'User'}</span>`;
        navList.appendChild(li);
      }

    } else {
      // --- USER LOGGED OUT ---
      if (authBtn) {
        authBtn.textContent = "Sign In";
        authBtn.href = "/Auth/login.html";
        authBtn.onclick = null;
      }
    }
  });

  // =========================================
  // POP-UP PREVIEW CARD LOGIC
  // =========================================
  const previewOverlay = document.getElementById('planPreviewOverlay');
  const closePreviewBtn = document.getElementById('closePreview');
  const pBadge = document.getElementById('previewBadge');
  const pTitle = document.getElementById('previewTitle');
  const pDesc = document.getElementById('previewDesc');
  const pList = document.getElementById('previewFeatures');

  const planData = {
    '0': {
      badge: 'Starter',
      title: 'Starter Plan',
      desc: 'Perfect for new creators. We handle the basic cuts, captions, and pacing so you can stay consistent.',
      features: ['Basic Cuts & Trimming', 'Standard Captions', '1 Revision Round', '72hr Delivery', 'Background Music']
    },
    '1': {
      badge: 'Pro',
      title: 'Pro Creator',
      desc: 'For channels that want to grow. Includes advanced sound design, motion graphics, and engaging pacing.',
      features: ['Advanced Color Grading', 'Sound Design & SFX', 'Motion Graphics', '2 Revision Rounds', '48hr Delivery']
    },
    '2': {
      badge: 'Premium',
      title: 'Agency Elite',
      desc: 'Your dedicated post-production team. Includes thumbnail design, SEO optimization, and unlimited revisions.',
      features: ['Dedicated Editor', 'Thumbnail Design', 'SEO Optimization', 'Unlimited Revisions', '24hr Priority Delivery']
    }
  };

  // 1. Handle Clicks on Plan Cards
  document.querySelectorAll('.plan-card .preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.plan-card');
      const index = card.getAttribute('data-index');
      openPreview(index);
    });
  });

  // 2. NEW: Handle Click on Trending Card (Opens 'Pro' Plan by default)
  const trendingCard = document.querySelector('.trending-card');
  if (trendingCard) {
    trendingCard.style.cursor = "pointer"; // Visual cue
    trendingCard.addEventListener('click', () => {
      openPreview('1'); // '1' is the index for Pro Creator
    });
  }

  // Helper to open modal
  function openPreview(index) {
    const data = planData[index];
    if (data && previewOverlay) {
        pBadge.textContent = data.badge;
        pTitle.textContent = data.title;
        pDesc.textContent = data.desc;
        pList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
        previewOverlay.classList.add('open');
    }
  }

  // Close logic
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => previewOverlay.classList.remove('open'));
  }
  if (previewOverlay) {
    previewOverlay.addEventListener('click', (e) => {
      if (e.target === previewOverlay) previewOverlay.classList.remove('open');
    });
  }

  // =========================================
  // MARQUEE (Your Original Logic)
  // =========================================
  (function marqueeSetup() {
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach((m) => {
      const track = m.querySelector('.marquee-track');
      if (!track) return;
      m.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
      m.addEventListener('mouseleave', () => track.style.animationPlayState = '');
      m.addEventListener('touchstart', () => track.style.animationPlayState = 'paused', { passive: true });
      m.addEventListener('touchend', () => setTimeout(() => track.style.animationPlayState = '', 350));
    });
  })();

  // =========================================
  // PARTICLES (Your Original Logic)
  // =========================================
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  (function backgroundParticles() {
    const canvas = document.getElementById('bgParticles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let DPR = Math.max(window.devicePixelRatio || 1, 1);
    let w = 0, h = 0;
    let particles = [];
    const BASE = 22;

    function cssVar(name) {
      try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || null; }
      catch (e) { return null; }
    }
    
    function resize() {
      DPR = Math.max(window.devicePixelRatio || 1, 1);
      w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const area = (w * h) / (1366 * 768);
      const count = Math.max(6, Math.round(BASE * Math.max(0.6, Math.min(2.2, area))));
      if (particles.length < count) {
        for (let i = particles.length; i < count; i++) particles.push(new Particle(true));
      } else if (particles.length > count) particles = particles.slice(0, count);
    }

    const rnd = (a,b) => a + Math.random()*(b-a);
    function Particle(init) {
      this.x = rnd(-w*0.1, w*1.1);
      this.y = init ? rnd(0, h) : h + rnd(6, 120);
      this.vy = rnd(12, 48) * (h / 900);
      this.vx = rnd(-10, 10) * (w / 1400);
      this.size = rnd(2, 10) * (Math.min(w,h)/900);
      this.alpha = rnd(0.06, 0.26);
      this.type = Math.random() < 0.14 ? 'ring' : 'dot';
    }
    Particle.prototype.step = function(dt, pal) {
      this.x += this.vx * dt;
      this.y -= this.vy * dt;
      if (this.y < -50 || this.x < -w*0.25 || this.x > w*1.25) {
        this.x = rnd(-w*0.1, w*1.1);
        this.y = h + this.size + rnd(6, 120);
      }
      ctx.save();
      ctx.globalAlpha = this.alpha;
      if (this.type === 'ring') {
        ctx.beginPath();
        ctx.strokeStyle = pal.main;
        ctx.lineWidth = Math.max(1, Math.round(this.size*0.6));
        ctx.arc(this.x, this.y, this.size*1.6, 0, Math.PI*2);
        ctx.stroke();
      } else {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size*2.4);
        g.addColorStop(0, pal.main);
        g.addColorStop(0.5, pal.alt);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size*1.6, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    };

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      ctx.clearRect(0,0,w,h);
      const pal = { 
        main: cssVar('--particle-main-color') || '#c94bff', 
        alt: cssVar('--particle-alt-color') || '#ff7a3d' 
      };
      ctx.globalAlpha = 1;
      for (let i=0;i<particles.length;i++) particles[i].step(dt, pal);
      if (!reducedMotion) requestAnimationFrame(frame);
    }

    function colorBlobs() {
      const b1 = cssVar('--bg-blob-1-color');
      const b2 = cssVar('--bg-blob-2-color');
      document.querySelectorAll('.bg-blob circle, .bg-blob ellipse').forEach(el => {
        if(b1) el.setAttribute('fill', b1);
        el.style.opacity = (root.getAttribute('data-theme') === 'dark') ? 0.18 : 0.09;
      });
      document.querySelectorAll('.bg-blob-2 circle, .bg-blob-2 ellipse').forEach(el => {
        if(b2) el.setAttribute('fill', b2);
        el.style.opacity = (root.getAttribute('data-theme') === 'dark') ? 0.14 : 0.06;
      });
    }

    function init() {
      resize();
      particles = [];
      const count = Math.max(6, Math.round(BASE * Math.max(0.6, Math.min(2.2, (w*h)/(1366*768)))));
      for (let i=0;i<count;i++) particles.push(new Particle(true));
      colorBlobs();
      if (!reducedMotion) { last = performance.now(); requestAnimationFrame(frame); }
      window.addEventListener('resize', resize);
      window.addEventListener('editkaro:theme-changed', colorBlobs);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 20);
  })();

})();

// =========================================
// CAROUSEL LOGIC (Fixed for Vertical Mobile)
// =========================================
(() => {
  const carousel = document.querySelector('.plans-carousel');
  const dotsContainer = document.querySelector('.plans-dots');

  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll('.plan-card'));
  const count = cards.length;

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.index = i;
      btn.setAttribute('aria-label', `Go to plan ${i+1}`);
      if (i === 0) btn.classList.add('active');
      btn.addEventListener('click', () => {
        const card = cards[i];
        if(card) {
            // Smooth scroll
            card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      });
      dotsContainer.appendChild(btn);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const carouselCenter = carousel.getBoundingClientRect().top + carousel.offsetHeight / 2;
    let closestIdx = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.getBoundingClientRect().top + card.offsetHeight / 2;
      const distance = Math.abs(carouselCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = index;
      }
    });

    Array.from(dotsContainer.children).forEach((btn, i) => {
      btn.classList.toggle('active', i === closestIdx);
    });
  }

  let scrollTimeout;
  carousel.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateDots, 50);
  });

  buildDots();
})();