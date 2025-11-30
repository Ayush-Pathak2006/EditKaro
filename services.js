import { firebaseConfig } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

(() => {
  // =========================
  // 1. VISUALS ENGINE (Blobs & Particles)
  // =========================
  (function backgroundParticles() {
    const canvas = document.getElementById('bgParticles');
    const root = document.documentElement;
    
    function cssVar(n) { try { return getComputedStyle(root).getPropertyValue(n).trim() || null; } catch (e) { return null; } }
    
    // Blob Coloring
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
    
    // Canvas Particles
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true });
        let w = 0, h = 0, particles = [], last = performance.now();
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        function resize() {
            const DPR = Math.max(window.devicePixelRatio || 1, 1);
            w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            canvas.width = Math.round(w * DPR);
            canvas.height = Math.round(h * DPR);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            
            const count = Math.max(6, Math.round(22 * Math.max(0.6, Math.min(2.2, (w * h) / (1366 * 768)))));
            if (particles.length < count) for (let i = particles.length; i < count; i++) particles.push(new Particle(true));
            else if (particles.length > count) particles = particles.slice(0, count);
        }

        function Particle(init) {
            this.x = Math.random() * w; this.y = init ? Math.random() * h : h + 10;
            this.vy = (Math.random() * 0.5 + 0.2) * (h / 900); 
            this.vx = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 4 + 2; 
            this.alpha = Math.random() * 0.5 + 0.1;
        }

        Particle.prototype.step = function(dt, pal) {
            this.y -= this.vy * 60 * dt; 
            this.x += this.vx * 60 * dt;
            if (this.y < -50) { this.y = h + 10; this.x = Math.random() * w; }
            ctx.globalAlpha = this.alpha; 
            ctx.fillStyle = pal.main; 
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); 
            ctx.fill();
        };

        function frame(now) {
            const dt = Math.min(0.06, (now - last) / 1000); last = now; ctx.clearRect(0, 0, w, h);
            const pal = { main: cssVar('--particle-main-color') || '#c94bff', alt: cssVar('--particle-alt-color') || '#ff7a3d' };
            for (let i = 0; i < particles.length; i++) particles[i].step(dt, pal);
            if (!reducedMotion) requestAnimationFrame(frame);
        }
        
        window.addEventListener('resize', resize); resize(); 
        if (!reducedMotion) requestAnimationFrame(frame);
    }
    
    colorBlobs();
    window.addEventListener('editkaro:theme-changed', colorBlobs);
  })();

  // =========================
  // 2. VIDEO POPUP LOGIC (LOCAL FILES FIXED)
  // =========================
  const cards = document.querySelectorAll('.portfolio-card');
  const modal = document.getElementById('videoModal');
  const videoPlayer = document.getElementById('modalVideoPlayer');
  const closeBtn = document.getElementById('closeVideoModal');

  cards.forEach(card => {
    // B. Handle Click -> Open Local Video
    card.addEventListener('click', () => {
        const videoSrc = card.getAttribute('data-video-src');
        const customThumb = card.getAttribute('data-custom-thumb'); // Get thumb for poster

        if (videoSrc && modal && videoPlayer) {
            // 1. Set Source
            videoPlayer.src = videoSrc;
            
            // 2. Set Poster (So it doesn't look broken while loading)
            if (customThumb) {
                videoPlayer.poster = customThumb;
            }

            // 3. Force Load (CRITICAL FIX: Tells browser to fetch new file)
            videoPlayer.load();

            // 4. Show Modal
            modal.classList.add('open');

            // 5. Attempt Autoplay
            videoPlayer.play().catch(e => console.log("Autoplay blocked (user gesture needed):", e));
        }
    });
  });

  // C. Close Modal Logic
  function closeModal() {
    if (modal) {
        modal.classList.remove('open');
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            // Clear source to stop download/buffering in background
            setTimeout(() => { 
                videoPlayer.src = ""; 
                videoPlayer.removeAttribute('poster'); 
            }, 300);
        }
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
      modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal();
      });
  }

  // =========================
  // 3. FILTERING LOGIC
  // =========================
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');
      
      cards.forEach(card => {
        const categories = card.getAttribute('data-category');
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('hidden');
          // Simple fade in reset
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
             card.style.opacity = '1';
             card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // =========================
  // 4. AUTH & NAV LOGIC
  // =========================
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const navList = mainNav ? mainNav.querySelector("ul") : null;
  const authBtn = document.getElementById("authBtn");

  onAuthStateChanged(auth, async (user) => {
    const existingItem = document.getElementById("mobileUserItem");
    if (existingItem) existingItem.remove();

    if (user) {
      let displayName = user.displayName;
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists() && docSnap.data().name) displayName = docSnap.data().name;
      } catch (e) {}

      if (authBtn) {
        authBtn.textContent = "Logout";
        authBtn.href = "#";
        authBtn.onclick = (e) => {
          e.preventDefault();
          signOut(auth).then(() => window.location.reload());
        };
      }

      if (navList) {
        const li = document.createElement("li");
        li.id = "mobileUserItem";
        li.innerHTML = `<span style="display:block; padding:10px; color:var(--accent1); font-weight:700;">Hi, ${displayName ? displayName.split(' ')[0] : 'User'}</span>`;
        navList.appendChild(li);
      }
    } else {
      if (authBtn) { authBtn.textContent = "Sign In"; authBtn.href = "login.html"; authBtn.onclick = null; }
    }
  });

  const savedTheme = localStorage.getItem("editkaro_theme");
  const root = document.documentElement;
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const newTheme = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", newTheme);
      localStorage.setItem("editkaro_theme", newTheme);
      if(themeIcon) themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
      window.dispatchEvent(new CustomEvent('editkaro:theme-changed', { detail: { theme: newTheme } }));
    });
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  }
})();