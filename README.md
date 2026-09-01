# My_PixelGame_Portfolio

<div align="center">

# ⚔️ Rahin's Portfolio — Pixel Portfolio Adventure

### *A Minecraft-Inspired Interactive Portfolio Game built with React*

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Play%20Now-4ade80?style=for-the-badge&labelColor=0f172a)](https://my-pixel-game-portfolio.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite&logoColor=white&labelColor=0f172a)](https://vitejs.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0f172a)](https://vercel.com/)

---

[https://github.com/user-attachments/assets/REPLACE_THIS_WITH_YOUR_ASSET_ID](https://github.com/user-attachments/assets/24b1a97a-aed5-4d51-9dcd-bf086d8fa5eb)

---

**[🕹️ Play it Live →](https://my-pixel-game-portfolio.vercel.app/)**

</div>

---

## 📖 About This Project

> **Why make a boring static portfolio when you can make it an adventure?**

**Rahin's World** is a fully interactive, browser-based portfolio game where visitors walk a Minecraft-style pixel character through a side-scrolling world and **hit blocks to discover** my projects, skills, publications, and more.

Instead of scrolling through a plain webpage, you **play through my portfolio** — collecting coins, double-jumping, dashing, and unlocking achievement toasts along the way.

---

## 🎮 How to Play

| Key | Action |
|-----|--------|
| `← →` or `A D` | Move the character left and right |
| `SPACE` | Jump / Hit nearby block to open section |
| `SPACE` × 2 | Double jump with a flip animation |
| `SHIFT` | Dash forward with speed blur ⚡ |
| `ESC` | Close any open panel |
| Walk to the **green portal** at the far right | Finish the adventure 🏆 |

> 📱 **Mobile friendly** — on-screen ◀ ⚒ ▶ buttons available at the bottom

---

## ✨ Features

### 🌍 World & Gameplay
- **Minecraft-style pixel art** world with hand-crafted CSS blocks
- **6 interactive section blocks** — hit them to explore portfolio sections
- **Collectible coins** scattered across the world (+50 score each)
- **Parallax scrolling** — mountains and clouds move at different speeds
- **Finish portal** at the right edge — triggers the "Thanks for Playing" screen

### 🎭 Character
- **Minecraft character** with animated walk cycle (8 frames)
- **Hammer swing** animation on block hit
- **Double jump** with 360° flip animation
- **Dash move** with speed blur trail
- **Idle easter egg** — stand still for 5 seconds and the character sits down with a laptop 💻
- **Floating name tag** — "Rahin ⚔" bobs above the character
- **Speech bubble** with rotating gameplay tips

### 🎵 Sound & Music
- **Web Audio API** sound effects — block hit, footsteps, coin collect, jump, dash
- **8-bit background music** toggle (square wave melody loop)

### 🌦️ World Customization
- **☀️ / 🌙 Day & Night** mode toggle with full sky transition
- **🌧️ Rain / ❄️ Snow / 🌤️ Clear** weather cycle
- Animated stars, aurora, moon with craters, pixel sun with rays

### 🏆 Achievements System
- `🏅 First Step!` — Open your first section
- `⚡ Half Way There!` — Explore 3 sections
- `🏆 Portfolio Master!` — Explore all 6 sections
- `🪙 Coin Collector!` — Collect 5 coins

### 📊 HUD & Navigation
- **Score tracker** — sections opened + coins collected
- **Mini-map** (top right) — shows all blocks and your position
- **Progress bar** — tracks sections explored (0/6 → 6/6)
- **Confetti burst** on first-time section discovery
- **Screen shake** on block hit

### 📂 Portfolio Sections
| Block | Content |
|-------|---------|
| 🔵 **About Me** | Bio, research focus, personal details |
| 🟡 **Skills** | Languages, frameworks, tools & technologies |
| 🟣 **Projects** | 4 featured GitHub projects with links |
| 🟢 **Papers** | Academic publications on arXiv & ResearchGate |
| 🟠 **Awards** | Certificates & competition achievements |
| 🩷 **Contact** | LinkedIn, GitHub, Twitter, Email, CV download |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework & component architecture |
| **Vite 5** | Lightning-fast build tool & dev server |
| **Pure CSS** | All pixel art, animations, game world — zero image files |
| **Web Audio API** | Sound effects & 8-bit music (no libraries) |
| **requestAnimationFrame** | Game loop with delta-time physics |
| **CSS Keyframe Animations** | Character walk, block shake, confetti, weather |
| **Google Fonts** | Press Start 2P, VT323, Outfit |
| **Vercel** | Deployment & hosting |

> ⚡ **Zero game engine used** — built entirely from scratch with React + CSS

---

## 🚀 Run Locally

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/backlashblitz/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

### Build for Production

```bash
# Build
npm run build

# Preview the production build locally
npm run preview
```

### Project Structure

```
minecraft-portfolio/
├── public/
│   └── assets/
│       ├── rahin_cv_job.pdf       ← CV download
│       ├── nasa_cert.pdf          ← Certificate
│       ├── cert2.pdf
│       ├── cert3.pdf
│       └── cert4.png
├── src/
│   ├── data/
│   │   └── portfolioData.js       ← All personal data (edit this!)
│   ├── App.jsx                    ← Game engine + all components
│   ├── App.css                    ← All styles & animations
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 🎨 Architecture Overview

```
App.jsx
├── LoadingScreen          — Pixel progress bar before game loads
├── Sky                    — Day/night, stars, moon, sun, aurora, parallax clouds
├── Weather                — Rain / Snow particle system
├── Ground                 — Grass, dirt, torches, flowers
├── SectionCol × 6         — Interactive Minecraft blocks
├── Coin × 13              — Collectible coins with physics
├── Character              — Player with walk/jump/dash/idle animations
├── Portal                 — Finish trigger at right edge
├── MiniMap                — Top-right world overview
├── ProgressBar            — Under title, tracks 0/6 → 6/6
├── Confetti               — Burst on first section open
├── AchievementToast       — Popup notifications
├── FinishPanel            — End screen with socials + restart
└── Modals × 6             — About / Skills / Projects / Papers / Awards / Contact
```

**Game Loop:** `requestAnimationFrame` with delta-time — physics, collision, coin pickup, portal detection all run at 60fps inside a single loop.

**Audio Engine:** Custom Web Audio API wrapper — creates oscillator nodes on-the-fly for every sound effect. No audio files needed.

---

## 📬 Connect with Me

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rahin%20Arefin%20Ahmed-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rahin-arefin-ahmed-164468316)
[![GitHub](https://img.shields.io/badge/GitHub-backlashblitz-e2e8f0?style=for-the-badge&logo=github&logoColor=black)](https://github.com/backlashblitz)
[![Twitter](https://img.shields.io/badge/Twitter-@rahinahmed263-1da1f2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/rahinahmed263?s=11)
[![Email](https://img.shields.io/badge/Email-rahin520@gmail.com-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:rahin520@gmail.com)

</div>

---

## 📄 License

This project is open source under the [MIT License](LICENSE).  
Feel free to fork it and make your own portfolio adventure! ⚔️

---

<div align="center">

*Made with ❤️ and way too many `requestAnimationFrame` calls*

**[🕹️ Play it Live → my-pixel-game-portfolio.vercel.app](https://my-pixel-game-portfolio.vercel.app/)**

</div>
