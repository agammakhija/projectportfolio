# 🖥️ Agam Makhija — 3D Retro Workstation & AgamOS 98

Built with **Three.js**, **WebGL**, **HTML5 Canvas**, **CSS3**, and the **Web Audio API**, this portfolio takes visitors back to the golden era of late 90s computing.

---

## ✨ Features & Architecture

### 1. 🪑 The 3D Retro Room (Three.js WebGL)
- **Procedural 3D Environment**: Zero heavy 100MB 3D model downloads. Instant sub-second loading time.
- **Classic CRT Monitor**: Beige cathode-ray tube monitor with rounded casing, curved glass screen, power button, and glowing green LED.
- **Interactive Architect Desk Lamp**: Heavy brass articulated lamp with warm spotlight and realistic real-time shadows. Click the lamp or switch to toggle the light and shift the room ambiance between warm study light and cool neon night glow!
- **Mid-Tower PC**: Classic beige PC tower with 3.5" floppy drive, 52x CD-ROM, power switch, and blinking amber HDD activity LED.
- **Interactive Clutter**: Ceramic coffee mug, stacked floppy disks, retro stereo speakers, and neon synthwave wall posters.
- **Smooth Camera Choreography**: Seamless cinematic camera glide between the **3D Desk Overview** and the **Focused CRT Screen (AgamOS)**.

### 2. 🪟 AgamOS 98 Operating System
- **Authentic Windows 95/98 Aesthetic**: Classic beveled chrome, gradient titlebars, system tray, real-time clock, desktop icon grid, and customizable wallpapers.
- **Window Management System**: Smooth window dragging with boundary clamping, minimize/maximize/restore, z-index elevation, and taskbar synchronization.
- **Start Menu**: Classic popup menu with AgamOS branding, program shortcuts, and system restart.
- **CRT Glass & Scanline Shaders**: Authentic scanlines, subtle vignette, phosphor glow, curvature warp, and toggleable monochrome green/amber CRT modes.

### 3. 💾 Built-In Retro Applications
1. **👤 About Me**: Developer bio, academic background, Python 3 and AI Prompt Engineering skill bars, and live statistics.
2. **🕷️ Portfolio (Internet Explorer)**: Live embedded Spider-Man interactive portfolio (`https://portfolio-swart-pi-47.vercel.app/`) running directly inside the retro CRT monitor with address bar, reload, and new tab controls.
3. **🐍 Skills Matrix**: Dedicated technical mastery showcase strictly focused on Python 3 Programming and AI Prompt Engineering (System Prompts, CoT Reasoning, Few-Shot, Schema Enforcement).
4. **🎓 Academic Education**: Complete academic credentials highlighting Newton School of Technology (2026–2030, Ongoing B.Tech CSE AI/ML) and Prodigy Public School (2024–2026).
5. **💻 Agam-DOS Terminal**: Real interactive command prompt powered by the `agam` executable. Features a complete manual (`agam man`), required `agam` prefix command handling, the 5-point directory system (`agam skills`, `agam education`, `agam portfolio`, `agam contacts`, `agam about`), one-click file downloads, matrix digital rain, and custom themes.
6. **🎵 Winamp Media Player**: Retro audio player with green LCD marquee, animated 16-band audio spectrum visualizer, and real-time synthesized **Spider-Man theme soundtracks** (1967 Classic Theme, 2002 Danny Elfman Theme, and 1994 Animated Series Theme)!
7. **💣 Minesweeper**: Fully playable 9x9 retro game with 7-segment digital displays and smiley face reactions.
8. **⛏️ Craft98 — Minecraft Alpha 3D**: Enhanced 3D voxel sandbox! Explore procedural rolling voxel terrain, chop oak trees, mine blocks with debris particle physics, place structures, switch blocks with hotbar 1-9 or scroll wheel, see your 3D in-hand held block with swing animations, walk with WASD, jump with Space, and press `F` for Creative Flight mode!
9. **🎨 MS Paint**: Interactive canvas drawing app with a 16-color retro palette, brush sizes, and PNG export.
10. **✉️ Contact Me (Outlook Express)**: Email composition window with direct links to GitHub, LinkedIn, and X/Twitter.
11. **⚙️ Display Settings**: Switch between RGB full-color, green phosphor, and amber monochrome modes; change desktop wallpapers; toggle CRT scanlines.
12. **🗑️ Recycle Bin**: Easter eggs, jokes, and funny developer relics.

### 4. 🔊 Web Audio API Synthesizer (Zero External Audio Dependencies)
- Real-time synthesis of iconic Spider-Man soundtracks ('67 Theme, '02 Elfman Theme, '94 Animated Series).
- Authentic Windows 98 polyphonic startup chime.
- Tactile mechanical switch and button click sounds.
- Window swooshes and retro error alerts.

---

## 🚀 Quick Start

### Option 1: Instant Python Local Server (No installation required!)
```bash
python3 -m http.server 3000
```
Then open your browser at:
```
http://localhost:3000
```

### Option 2: Open Directly in Any Web Browser
Simply double-click or open `index.html` in Chrome, Safari, Firefox, or Edge.

---

## 🛠️ Customization Guide

All personal information, skills, education, and links are neatly consolidated in **`js/data.js`**.

To customize for your own profile:
1. Open `js/data.js`.
2. Edit:
   - `profile.name`, `title`, `tagline`, `bio`, `email`, `github`, `linkedin`, `spidermanPortfolioUrl`.
   - `skills` strictly covering your core technologies (Python 3 & AI Prompt Engineering).
   - `education` with your academic credentials.
3. Refresh your browser — every window, terminal command, and document across AgamOS updates automatically!

---

## 🌐 Deployment

### GitHub Pages (1-Click)
1. Push this repository to GitHub.
2. Navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` (root) and click **Save**.
4. Your retro 3D portfolio is live!

### Vercel / Netlify
- Drag-and-drop the project folder directly onto [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for zero-config instant deployment.

---

## 📜 Credits, Attribution & Legal Disclaimers

### Original Design & Inspiration
- **Original Concept & Work**: Created by [Henry Heffernan](https://henryheffernan.com) ([@henryjeff](https://github.com/henryjeff)).
- **Original Open-Source Repository**: [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website) (Licensed under the MIT License).
- **Adapted & Enhanced by**: [Agam Makhija](https://github.com/agammakhija) (Specialized in Python 3 programming, AI Prompt Engineering, and custom 3D web features).

### Open-Source Licenses
- **Portfolio Codebase**: Licensed under the [MIT License](LICENSE) &copy; 2021–2026 Henry Heffernan.
- **Three.js Engine**: Licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/dev/LICENSE) &copy; 2010–2026 Three.js Authors.
- For complete legal notices, third-party library attributions, and fair use disclosures, please refer to [ATTRIBUTION.md](ATTRIBUTION.md).

### Fair Use & Non-Commercial Notice
All pop-culture homages (including Spider-Man themes, Minecraft voxel sandbox tribute, and classic retro Windows 98 operating system aesthetics) are included solely for non-commercial educational demonstration and personal portfolio presentation. All respective trademarks and copyrights remain the property of their rightful owners.


