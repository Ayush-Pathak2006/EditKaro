import { firebaseConfig } from '../Config/config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const googleBtn = document.getElementById('googleBtn');
const btnText = document.getElementById('btnText');
const errorMsg = document.getElementById('error-msg');
const nameInput = document.getElementById('customName');

// Theme Logic
const savedTheme = localStorage.getItem("editkaro_theme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

// ==========================================
// 1. CHECK IF ALREADY LOGGED IN
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User already logged in. Redirecting...");
    btnText.textContent = "Redirecting...";
    // Small delay to ensure DB write has a chance to finish if it was racing
    setTimeout(() => {
        window.location.href = "/index.html";
    }, 500);
  }
});

// ==========================================
// 2. LOGIN BUTTON CLICK (POPUP MODE)
// ==========================================
googleBtn.addEventListener('click', async () => {
  const nameVal = nameInput.value.trim();

  // Validation
  if (!nameVal) {
    errorMsg.textContent = "Please enter your name first.";
    errorMsg.style.display = 'block';
    nameInput.focus();
    nameInput.style.borderColor = "#ff4b4b";
    return;
  }

  setLoading(true);
  errorMsg.style.display = 'none';

  try {
    // A. Open Popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // B. Save to Database
    btnText.textContent = "Setting up account...";
    
    // Use the name they typed, or fallback to Google name
    const finalName = nameVal || user.displayName;

    try {
        await setDoc(doc(db, "users", user.uid), {
            name: finalName,
            email: user.email,
            photo: user.photoURL,
            lastLogin: serverTimestamp(),
            uid: user.uid
        }, { merge: true });
        
        console.log("User data saved.");
    } catch (dbError) {
        console.warn("Database save skipped (Billing/Rules), proceeding to login.");
    }

    // C. Redirect will happen automatically via onAuthStateChanged above
    // But we force it here just in case
    btnText.textContent = "Success!";
    window.location.href = "/index.html";

  } catch (error) {
    console.error("Login Error:", error);
    errorMsg.textContent = "Login Failed: " + error.message;
    errorMsg.style.display = 'block';
    setLoading(false);
  }
});

function setLoading(isLoading) {
  if (isLoading) {
    btnText.style.display = 'none';
    if(document.getElementById('btnLoader')) document.getElementById('btnLoader').style.display = 'inline-block';
    googleBtn.style.opacity = '0.7';
    googleBtn.style.pointerEvents = 'none';
  } else {
    btnText.style.display = 'inline';
    if(document.getElementById('btnLoader')) document.getElementById('btnLoader').style.display = 'none';
    googleBtn.style.opacity = '1';
    googleBtn.style.pointerEvents = 'auto';
  }
}