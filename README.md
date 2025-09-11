# Lynx

### Your personal links hub

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/paoloronco/Lynx)

**Lynx** is an open-source, self-hosted link manager that helps you gather all your digital touchpoints in a single page, with secure authentication and a fully customizable design.

---

# 📑 Table of Contents  

1. [Lynx](#lynx)  
   - [🧪 Demo](#-demo)  
   - [✨ Features](#-features)  
   - [🔒 Security Features](#-security-features)  
   - [🛠 Tech Stack](#-tech-stack)   
   - [🎥 Video](#-video)  
2. [🚀 Quick Start](#-quick-start)  
   - [1. Clone, Install & Run](#1-clone-install--run)  
   - [2. 🚀 Deploy on Render](#2--deploy-on-render)  
   - [3. 🚀 Other alternatives to deploy it](#3--other-alteratives-to-deploy-it)  
3. [📝 Changelog](#-changelog)  
4. [📌 To-Do / Next Steps](#-to-do--next-steps)  
5. [👨‍💻 Developed With](#-developed-with)  
6. [📜 License](#-license)  

---

## 🧪 Demo

- 🌐 [Try Lynx Demo on Render](https://lynx-demo.onrender.com)  
- **Admin Panel**: [https://lynx-demo.onrender.com/admin](https://lynx-demo.onrender.com/admin)  
- **Login**:  
  - User: `admin`  
  - Password: `demo123` (the password can't be changed)

⚠️ This demo runs on a free Render plan.  
It may sleep after inactivity (first load can take ~40s).  
The database resets automatically every 15 minutes.


## ✨ Features

* 📝 **Customizable** → themes, colors, fonts, and layouts
* 🔐 **Secure Authentication** → bcryptjs password hashing + JWT tokens
* 🛠 **Admin Panel** → manage links, themes, profile, and settings
* 🗂 **Standalone** → no Firebase, Supabase, or external DBs
* 🚀 **Deploy Anywhere** → Render, Railway, Docker, Linux Server, Heroku, GCP, DigitalOcean, Fly.io
* 📱 **Mobile Responsive** → optimized for all devices
* 🗄 **SQLite Database** → self-contained, file-based storage

### 🔒 Security Features

* Password Hashing: bcryptjs (12 salt rounds)
* JWT Authentication: signed tokens (7-day expiry)
* Database Safety: parameterized queries against SQLite
* Session Security: cookies set HttpOnly and SameSite

---

## 🛠 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)  
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)  
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)  
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)  

---

## 🎥 Video

#### Lynx Demo
Coming soon...

#### How to deploy Lynx
[![Lynx - Your Personal Links Hub](./docs/screenshots/Lynx-howtodeploy-final.png)](https://vimeo.com/1117386711)


---

## 🚀 Quick Start

### 1. Clone, Install & Run

*(prerequisite: Node.js 18+)*
  ```bash
    git clone https://github.com/paoloronco/Lynx.git
    cd Lynx
    npm install
    npm run build
    cd server
    npm install
    cd ..
    npm run start
  ```

<p> Public → http://localhost:5173
<p> Admin → http://localhost:5173/admin

### 2. 🚀 Deploy on Render

You can deploy **Lynx** on [Render](https://render.com) in a few steps:

0. Fork this repo (recommended)
1. Go to **Render Dashboard → New → Web Service**
2. Connect **GitHub repo (Lynx)**
3. Set the following commands:
   - **Build Command**
     ```bash
     npm install && npm run build && cd server && npm install
     ```
   - **Start Command**
     ```bash
     npm run start
     ```
4. Click **Create Web Service** and wait for the deployment ✨

Your app will be available at a URL like: https://your-app.onrender.com


### 3. 🚀 Other alteratives to deploy it:
- [Railway](https://railway.com)
- Digital Ocean App Platform
- Fly.io (Docker)
- Heroku (Container)
- Google Cloud Run (Container)

---

## 📝 Changelog

### v3.0.0

### 🔧 Admin
- Interface title updated to: **“Lynx - Your personal links hub”**
- **Profile**
  - Added *Show/Hide profile picture* toggle (persisted in DB)
  - Bio now supports **line breaks** (`whitespace-pre-line`)
  - Empty bio is automatically hidden (no blank space left)
  - Social links work properly → hidden if empty
- **Links**
  - Text color is now applied consistently across the entire card (title, description, URL)
  - Support for **emoji** or **PNG images** next to each link
  - Improved **Text Card** rendering: each link is displayed on two lines  
    → Name on top, URL below (indented with horizontal scroll for long URLs)
- **Theme**
  - Removed duplicate *“Content”* tab (was a duplicate of name + bio)
  - **Export/Import** now correctly saves and restores themes
- **UI**
  - Footer updated to:  
    `Powered by Lynx | Lynx - Your personal links hub`

### 🚀 Demo
- Demo is fully functional, but **password change is disabled**


---
## 📌 To-Do / Next Steps

### 🔧 Admin
- **Profile**
  - Option to resize (enlarge/reduce) the profile image
  - Option to choose the placement of profile elements (name, bio, avatar, etc.)
- **Links**
  - Ability to center text and customize its alignment within cards
- **Themes**
  - Further improvements to theme usability and customization
  - Enhanced personalization options for layouts, colors, and styles

---

👨‍💻 Developed With

* ChatGPT
* Claude
* Lovable

---

📜 License

MIT License

Copyright (c) 2025 Paolo Ronco

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

