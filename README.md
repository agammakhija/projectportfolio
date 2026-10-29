# 🖥️ Agam Makhija — 3D Retro Workstation & AgamOS 98

An interactive, immersive 3D developer portfolio and retro desktop operating system inspired by [Henry Heffernan's portfolio](https://github.com/henryjeff/portfolio-website) (`henryheffernan.com`).

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
1. **👤 About Me**: Developer bio, career summary, technical skill bars, and live statistics.
2. **🚀 Projects Explorer**: Filterable project gallery with live demos, GitHub links, and architectural notes.
3. **📄 Resume (WordPad)**: Printable work experience, career milestones, and educational background.
4. **💻 Agam-DOS Terminal**: Real interactive command prompt with the 5-point directory system (`agam resume`, `agam contacts`, `agam education`, `agam about`, `agam skills`) with one-click direct file downloads, matrix digital rain, theme switcher, and ASCII neofetch specs.
5. **🎵 Winamp Media Player**: Retro audio player with green LCD marquee, animated 16-band audio spectrum visualizer, and real-time synthesized chiptune & synthwave tracks!
6. **💣 Minesweeper**: Fully playable 9x9 retro game with 7-segment digital displays and smiley face reactions.
7. **⛏️ Craft98 — Minecraft Alpha 3D**: Fully playable 3D voxel sandbox! Explore procedural rolling voxel terrain, chop oak trees, mine blocks (left-click), build structures (right-click), switch blocks with hotbar numbers 1-9, walk with WASD, and jump with Space!
8. **🎨 MS Paint**: Interactive canvas drawing app with a 16-color retro palette, brush sizes, and PNG export.
9. **✉️ Contact Me (Outlook Express)**: Email composition window with direct links to GitHub, LinkedIn, and X/Twitter.
10. **⚙️ Display Settings**: Switch between RGB full-color, green phosphor, and amber monochrome modes; change desktop wallpapers; toggle CRT scanlines.
11. **🗑️ Recycle Bin**: Easter eggs, jokes, and funny developer relics.

### 4. 🔊 Web Audio API Synthesizer (Zero External Audio Dependencies)
- Algorithmic chiptune and synthwave music generation (kick, snare, bassline, arpeggiated lead).
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

All personal information, projects, skills, and links are neatly consolidated in **`js/data.js`**.

To customize for your own profile:
1. Open `js/data.js`.
2. Edit:
   - `profile.name`, `title`, `tagline`, `bio`, `email`, `github`, `linkedin`, `twitter`.
   - `skills` to match your core technologies.
   - `projects` with your own project titles, summaries, tags, and URLs.
   - `experience` and `education` with your career timeline.
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

## 📜 Credits & Inspiration
- Inspired by [Henry Heffernan's portfolio](https://henryheffernan.com) and the iconic aesthetic of 90s computing.
- Designed & Developed by [Agam Makhija](https://github.com/agammakhija).

