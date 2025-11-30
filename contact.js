import { firebaseConfig } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const planSelect = document.getElementById('planSelect');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const btnLoader = document.getElementById('formLoader');
const btnTextSpan = submitBtn.querySelector('span'); 
const authBtn = document.getElementById("authBtn");

// Visuals
(function backgroundParticles() {
    const root = document.documentElement;
    function cssVar(n) { try { return getComputedStyle(root).getPropertyValue(n).trim() || null; } catch (e) { return null; } }
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
    colorBlobs();
    window.addEventListener('editkaro:theme-changed', colorBlobs);
})();

// AUTH
onAuthStateChanged(auth, async (user) => {
  if (user) {
    submitBtn.disabled = false;
    btnTextSpan.textContent = "Send Request";
    submitBtn.onclick = null; 

    if (authBtn) {
      authBtn.textContent = "Logout";
      authBtn.href = "#";
      authBtn.onclick = (e) => { e.preventDefault(); signOut(auth).then(() => window.location.reload()); };
    }

    if(user.email) {
        userEmailInput.value = user.email;
        userEmailInput.readOnly = true;
        userEmailInput.style.opacity = "0.7";
    }
    
    let finalName = user.displayName;
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists() && docSnap.data().name) finalName = docSnap.data().name;
    } catch (e) {}
    if (finalName) userNameInput.value = finalName;

  } else {
    submitBtn.disabled = false; 
    btnTextSpan.textContent = "Sign In to Send Message";
    submitBtn.style.background = "#444"; 
    contactForm.onsubmit = (e) => { e.preventDefault(); window.location.href = "login.html"; };
    if (authBtn) { authBtn.textContent = "Sign In"; authBtn.href = "login.html"; }
  }
});

contactForm.addEventListener('submit', async (e) => {
  if (!auth.currentUser) return; 
  e.preventDefault();
  
  submitBtn.disabled = true;
  btnTextSpan.textContent = "Sending...";
  btnLoader.style.display = "block";
  formMessage.textContent = "";

  const formData = {
    name: userNameInput.value,
    email: userEmailInput.value,
    plan: planSelect.value,
    subject: document.getElementById('requestSubject').value,
    description: document.getElementById('requestDesc').value,
    timestamp: serverTimestamp(),
    userId: auth.currentUser.uid
  };

  try {
    await addDoc(collection(db, "inquiries"), formData);
    formMessage.textContent = "Request received!";
    formMessage.className = "success-msg";
    contactForm.reset();
    setTimeout(() => {
        formMessage.textContent = "";
        submitBtn.disabled = false;
        btnTextSpan.textContent = "Send Request";
        btnLoader.style.display = "none";
        userNameInput.value = auth.currentUser.displayName || "";
        userEmailInput.value = auth.currentUser.email || "";
    }, 3000);
  } catch (error) {
    formMessage.textContent = "Error: " + error.message;
    formMessage.className = "error-msg";
    submitBtn.disabled = false;
    btnTextSpan.textContent = "Send Request";
    btnLoader.style.display = "none";
  }
});

const themeToggle = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
const savedTheme = localStorage.getItem("editkaro_theme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const newTheme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("editkaro_theme", newTheme);
    window.dispatchEvent(new CustomEvent('editkaro:theme-changed', { detail: { theme: newTheme } }));
  });
}
if (navToggle) { navToggle.addEventListener('click', () => mainNav.classList.toggle('open')); }