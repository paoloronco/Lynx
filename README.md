# Lynx

### Your personal links hub

[![Version](https://img.shields.io/badge/version-3.4.0-blue.svg)](https://github.com/paoloronco/Lynx)

**Lynx** is an open-source, self-hosted link manager that helps you gather all your digital touchpoints in a single page, with secure authentication and a fully customizable design.

---

# 📑 Table of Contents  

1. [Lynx](#lynx)  
   - [🎥 Video](#-video)  
   - [🧪 Demo](#-demo) 
   - [✨ Features](#-features)  
   - [🔒 Security Features](#-security-features)  
   - [🛠 Tech Stack](#-tech-stack)   
2. [🚀 Quick Start](#-quick-start)  
   - [1. Clone, Install & Run](#1-clone-install--run)  
   - [2. 🚀 Deploy with Docker](#2--deploy-with-docker)  
   - [3. 🚀 Deploy on Railway](#2--deploy-on-railway)  
   - [4. 🚀 Other alternatives to deploy it](#3--other-alteratives-to-deploy-it)  
3. [📝 Changelog](#-changelog)  
4. [📌 To-Do / Next Steps](#-to-do--next-steps)  
5. [👨‍💻 Developed With](#-developed-with)  
6. [📜 License](#-license)  

---
## 🎥 Video

#### Lynx Demo
[![Watch the demo](./docs/demo.gif)](https://app.storylane.io/share/tjpm3tey6ven)

---

## 🧪 Demo

- 🌐 [Try Lynx Demo on Railway] [https://lynx-demo.paoloronco.it](https://lynx-demo.paoloronco.it/)]
- **Admin Panel**: [[https://lynx-demo.paoloronco.it/admin](https://lynx-demo.paoloronco.it/admin)]
- **Login**:  
  - User: `admin`  
  - Password: `demo123` (the password can't be changed)

⚠️ The database resets automatically every 15 minutes.

---

## ✨ Features

* 🎨 Full Customization → personalize colors, themes, fonts, text alignment, and layouts.
* 📇 Flexible Link Management → create classic links, bulleted lists, or text cards (full-card clickable).
* 🖼 Rich Media Support → add icons, emojis, or images to your links.
* 🛠 Admin Dashboard → manage profile, links, and themes in a clean UI.
* 📦 Import/Export → backup and restore links & themes in JSON with one click.
* 🌍 Deploy Anywhere → easy setup on Railway, Render, Docker, GCP, DigitalOcean, Fly.io, and more.
* 📱 Mobile-First → responsive design that looks great on any device.
* 🗄 Standalone by Design → lightweight, no Firebase/Supabase required.
* ⚡ Fast & Modern → built with Vite, React, and Tailwind CSS.

### 🔒 Security Features

* 🔑 Password Security → bcryptjs hashing (12 salt rounds).
* 🛡 Token-Based Auth → JWT with signed tokens (7-day expiry).
* 💾 Database Protection → parameterized queries for SQLite, preventing SQL injection.
* 🍪 Safe Sessions → HttpOnly + SameSite cookies to mitigate XSS/CSRF risks.
* 🔍 Code Transparency → fully open-source for audits and improvements.

---

## 🛠 Tech Stack

<p align="center"> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" /> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" /> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" /> </p>

---

## 🚀 Quick Start

Credentials:
  User: `admin`
  Password: `ChangeMe123!`

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

> Public → http://localhost:3001

> Admin → http://localhost:3001/admin

### 2. 🚀 Deploy with Docker

You can run **Lynx** directly using the pre-built image from [Docker Hub](https://hub.docker.com/r/paueron/lynx).

1. Pull the image
    ```bash
    docker pull paueron/lynx:latest
    ```
2. Start the container
    ```bash
    docker run -d --name lynx \
      -p 8080:8080 \
      -e NODE_ENV=production \
      -e PORT=8080 \
      paueron/lynx:latest
    ```
    Once started, the app will be available at:
    > 👉 http://localhost:8080

    > 👉 http://localhost:8080/admin

3. Optional environment variables
    - JWT_SECRET – secret key used to sign JWT tokens. If not set, a random key will be generated at runtime (⚠️ highly recommended to set this in production).

    - PORT – the internal server port (default: 8080).

    - NODE_ENV – Node.js environment (default: production).

4. Data persistence (recommended)
    ```bash
    docker run -d --name lynx \
      -p 8080:8080 \
      -e NODE_ENV=production \
      -e PORT=8080 \
      -e JWT_SECRET="your-very-secret-key" \
      -v lynx_data:/app/server \
      paueron/lynx:latest
    ```

### 3. 🚀 Deploy on Railway

You can deploy **Lynx** on [Railway](https://railway.com) in a few steps:
1. Go to **Railway Dashboard** → New → **GitHub Repo**
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
4. Click **Create** and wait for the deployment ✨
5. Add a public domain in the settings 

### 4. 🚀 Other alternatives to deploy it:

- [Render](https://render.com/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)  
- [Fly.io (Docker)](https://fly.io/docs/)  
- [Heroku (Container)](https://devcenter.heroku.com/articles/container-registry-and-runtime)  
- [Google Cloud Run (Container)](https://cloud.google.com/run/docs/deploying)  
- [Vercel (Node.js / Static)](https://vercel.com/docs)  
- [Netlify (Static + Functions)](https://docs.netlify.com/)  
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)  
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)  
- [Koyeb (Serverless Containers)](https://www.koyeb.com/docs)  
- [CapRover (Self-hosted PaaS)](https://caprover.com/docs/)  
- [Dokku (Self-hosted PaaS)](https://dokku.com/docs/getting-started/)  
- [Coolify (Self-hosted PaaS)](https://coolify.io/docs)  
- [Northflank](https://northflank.com/docs)  
- [Qovery](https://hub.qovery.com/)  
- [Cyclic.sh](https://docs.cyclic.sh/)  
- [Glitch](https://glitch.com/)  
- [Replit](https://docs.replit.com/)  
- [Stormkit](https://stormkit.io/docs)  
- [Appwrite (Functions/Containers)](https://appwrite.io/docs)  
- [Supabase (Edge Functions)](https://supabase.com/docs/guides/functions)  

---

## 📝 Changelog

### v4.0.0

### 🔧 Admin
* Updated title to: “Lynx – Your personal links hub”
* **Profile**
  - Bio now supports **line breaks** (`whitespace-pre-line`)
  - Empty bio is automatically hidden (no blank space left)
  - Social links are hidden when empty
  - Profile picture now displays correctly
* **Links**
  - Consistent text color applied across title, description, and URL
  - Improved Text Card rendering: Link name on the first line, URL on the second line (with horizontal scroll for long URLs)
  - Added support for image/emoji next to links
  - Added ability to insert either: 
    * Text Card → full card with only text, entire card clickable via a single link
    * Bulleted List → list with a title and multiple links underneath
  - Option to export/import links as JSON
  - Bug fixes in rendering icons, removing cards, and updating links
  - Fixed bugs with icons, card removal, and link updates
  - Extended customization: choose font, size, and alignment for links
* **Theme**
  - Removed duplicate “Content” tab (was redundant with name + bio)
  - Partially removed Typography tab → now integrated into Links and Profile sections for better UX
  - Export/Import now properly saves and restores themes
* **UI**
  - Updated footer to:
    `Powered by Lynx | Lynx - Your personal links hub`
  - Possibility to change the `title` and `meta description`

---
## 📌 To-Do / Next Steps

### 🔧 Admin
- **Code**
  - Code cleaning & refactoring: removing unnecessary parts, obsolete code, and unused dependencies (e.g., leftover Supabase or Firebase integrations).

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

