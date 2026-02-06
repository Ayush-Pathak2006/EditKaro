# EditKaro — Your Editing Buddy✂️🎬

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

A simple marketing website for **editing expertise services**, built with **vanilla HTML, CSS, and JavaScript**, and powered by **Firebase** for backend functionality such as **authentication** and **saving user enquiries**.

🔥 **Live Demo:** https://editkaro-studio.vercel.app/  

---

## 🚀 About The Project

EditKaro is a static frontend website that helps editing professionals market their services and manage subscribers. Users can:

- Sign up and log in using Firebase Authentication. 
- Browse services offered.
- Read about the team/brand.
- Contact the brand and have the conversation saved.  
- Subscribe to editing services.

The backend functionality is fully handled by Firebase, acting as a Backend-as-a-Service (BaaS). 

---

## 📁 Project Structure
```text
📦 EditKaro
├── 📂 About
├── 📂 Auth
├── 📂 Config
├── 📂 Contact
├── 📂 Services
├── 📂 resource
├── 📄 index.html
├── 📄 script.js
└── 📄 styles.css
```
---

## 🛠️ Features

✨ **Responsive UI** — Works on desktop & mobile  
🔐 **User Authentication** — Sign up and Login pages using Firebase Auth.  
📬 **Contact Form** — Users can submit queries/messages to the brand  
📄 Pages Included:
- `index.html` — Home
- `about.html` — About Us
- `services.html` — Services Page
- `contact.html` — Contact Form
- `auth.html` — Authentication (Login/Signup)

---

## 💻 Built With

- **HTML5**
- **CSS3**
- **JavaScript**
- **Firebase**
  - Authentication  
  - Firestore / Realtime Database

---

## 📌 Getting Started

To run this project locally, follow these steps:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Ayush-Pathak2006/EditKaro.git
cd EditKaro
```
## 2️⃣ Create a Firebase Project

1. Go to https://firebase.google.com/ and log in.
2. Create a new project.
3. Enable **Email/Password Authentication** in the Authentication section.



## 3️⃣ Add Firebase Config

1. Create a file called `config.js` inside the `Config/` folder.
2. Add your Firebase configuration in that file:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
```
## 4️⃣ Open in Browser

Just open `index.html` in your browser to preview the site locally.

---

## 🧪 Usage

✔️ Sign up or log in to access subscription-based features.  
✔️ Fill out the contact form to send messages to the brand (and store them in your Firebase backend).  
✔️ Customize the HTML/CSS to reflect your branding and services.

---


<p align="center">
  Made with ❤️ by <strong>Ayush Pathak</strong>
</p>

