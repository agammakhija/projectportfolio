/**
 * Portfolio Data Configuration for Agam Makhija
 * Easy to customize and updates all apps across AgamOS!
 */

window.PORTFOLIO_DATA = {
  profile: {
    name: "Agam Makhija",
    handle: "agammakhija",
    title: "Software Engineer & Creative Developer",
    tagline: "Crafting immersive digital experiences, robust systems & intelligent web platforms.",
    status: "Available for interesting engineering roles & collaborations",
    location: "Global / Remote",
    email: "agam.makhija07@gmail.com",
    github: "https://github.com/agammakhija",
    linkedin: "https://linkedin.com/in/agammakhija",
    twitter: "https://x.com/agammakhija",
    avatar: "assets/icons/avatar.png",
    bio: [
      "Hello, traveler! I'm Agam Makhija, a software engineer obsessed with the intersection of creative graphics, high-performance web systems, and retro computing.",
      "Inspired by the tactile joy of early 90s computing and the limitless frontiers of modern WebGL, I design and build full-stack web applications, real-time distributed backends, and interactive 3D simulations.",
      "When I'm not writing code, you'll find me tweaking synthesizers, exploring vintage hardware architectures, or prototyping procedural animations."
    ],
    stats: [
      { label: "Lines of Code", value: "350,000+" },
      { label: "Cups of Coffee", value: "∞" },
      { label: "Favorite Stack", value: "TypeScript + Three.js + Python" },
      { label: "System Uptime", value: "99.98%" }
    ]
  },

  skills: {
    "Frontend & 3D": [
      { name: "TypeScript / JavaScript", level: 95 },
      { name: "Three.js / WebGL / GLSL", level: 90 },
      { name: "React / Next.js", level: 92 },
      { name: "HTML5 / Canvas / CSS3", level: 96 },
      { name: "Tailwind CSS / UI Systems", level: 90 }
    ],
    "Backend & Systems": [
      { name: "Node.js / Express", level: 92 },
      { name: "Python / FastAPI", level: 90 },
      { name: "PostgreSQL / Redis", level: 86 },
      { name: "WebSockets / WebRTC", level: 88 },
      { name: "REST & GraphQL APIs", level: 94 }
    ],
    "DevOps & Tools": [
      { name: "Docker & Containers", level: 88 },
      { name: "Linux / Shell Scripting", level: 92 },
      { name: "Git / GitHub Actions", level: 95 },
      { name: "AWS Cloud / Vercel", level: 85 },
      { name: "Vite / Webpack / Tooling", level: 90 }
    ]
  },

  projects: [
    {
      id: "omni-agent",
      title: "OmniAgent AI Platform",
      category: "Full-Stack",
      tag: "Featured",
      period: "2024",
      description: "An autonomous agent orchestration framework featuring tool-calling pipelines, streaming memory buffers, and multi-agent collaborative task execution.",
      tech: ["TypeScript", "Python", "FastAPI", "WebSockets", "Docker"],
      metrics: "50k+ requests/day, 99.9% uptime",
      demoUrl: "https://github.com/agammakhija",
      githubUrl: "https://github.com/agammakhija",
      accent: "#4fc3f7"
    },
    {
      id: "retroverse-3d",
      title: "RetroVerse 3D Desktop",
      category: "3D & WebGL",
      tag: "Interactive",
      period: "2024",
      description: "A full 3D interactive virtual workstation experience inspired by late 90s computing. Built with Three.js procedural modeling, custom CRT shaders, and an integrated desktop operating system.",
      tech: ["Three.js", "WebGL", "JavaScript", "Web Audio API", "CSS3D"],
      metrics: "60 FPS rendering, 0 external 3D asset dependencies",
      demoUrl: "#",
      githubUrl: "https://github.com/agammakhija",
      accent: "#a78bfa"
    },
    {
      id: "hypermesh-cloud",
      title: "HyperMesh Distributed Queue",
      category: "Systems",
      tag: "High-Perf",
      period: "2023 - 2024",
      description: "High-throughput distributed message queue and event-streaming broker supporting horizontal partition clustering and zero-copy binary serialization.",
      tech: ["Go", "Distributed Systems", "Raft", "gRPC", "Docker"],
      metrics: "Over 120,000 msgs/sec with sub-millisecond p99 latency",
      demoUrl: "https://github.com/agammakhija",
      githubUrl: "https://github.com/agammakhija",
      accent: "#34d399"
    },
    {
      id: "canvascraft-studio",
      title: "CanvasCraft Pixel Studio",
      category: "Creative",
      tag: "Tool",
      period: "2023",
      description: "Browser-based collaborative sprite and pixel art creation suite featuring layered onion-skinning, palette quantization, and instant GIF/spritesheet export.",
      tech: ["React", "HTML5 Canvas", "WebAssembly", "IndexedDB"],
      metrics: "Thousands of retro game sprites generated",
      demoUrl: "https://github.com/agammakhija",
      githubUrl: "https://github.com/agammakhija",
      accent: "#f472b6"
    },
    {
      id: "pixelbeats-synth",
      title: "PixelBeats Modular Synthesizer",
      category: "Audio",
      tag: "Sound",
      period: "2023",
      description: "A software modular synthesizer built atop the Web Audio API with customizable oscillator waveforms, low-pass ladder filters, step sequencer, and audio visualizer.",
      tech: ["Web Audio API", "Canvas 2D", "JavaScript"],
      metrics: "Zero latency sound synthesis in-browser",
      demoUrl: "#",
      githubUrl: "https://github.com/agammakhija",
      accent: "#fbbf24"
    },
    {
      id: "agam-terminal-cli",
      title: "Agam-DOS Terminal Shell",
      category: "Tools",
      tag: "CLI",
      period: "2022 - 2023",
      description: "An authentic phosphor-screen terminal environment featuring command parsing, tab autocompletion, real-time matrix rain, and extensible command plugins.",
      tech: ["JavaScript", "CSS3", "Regular Expressions"],
      metrics: "Full ANSI escape code compatibility",
      demoUrl: "#",
      githubUrl: "https://github.com/agammakhija",
      accent: "#4ade80"
    }
  ],

  experience: [
    {
      role: "Senior Software Engineer",
      company: "Modern Systems & Cloud Technologies",
      period: "2024 - Present",
      location: "Remote",
      bullets: [
        "Architecting scalable cloud microservices and high-throughput real-time APIs handling millions of daily events.",
        "Engineered interactive web interfaces, cutting client-side load latency by 45% using optimized code splitting and dynamic asset pipelining.",
        "Spearheaded technical designs for distributed caching and resilient failover systems."
      ]
    },
    {
      role: "Full-Stack Software Engineer",
      company: "Interactive Web Studio",
      period: "2022 - 2024",
      location: "Remote / Hybrid",
      bullets: [
        "Developed full-stack web applications combining React, Node.js, and WebSockets for real-time collaboration.",
        "Built custom 3D web visualizations using Three.js and GLSL shaders for interactive product showcases.",
        "Authored comprehensive automated test suites achieving 94% test coverage across core modules."
      ]
    },
    {
      role: "Frontend Developer & Creative Technologist",
      company: "Digital Innovations Lab",
      period: "2020 - 2022",
      location: "On-site",
      bullets: [
        "Constructed pixel-perfect, responsive client experiences with micro-interactions and smooth animations.",
        "Engineered internal design system components adopted by 12+ product engineering teams.",
        "Collaborated with design and product leads to prototype innovative experimental web interfaces."
      ]
    }
  ],

  education: [
    {
      degree: "Bachelor of Technology in Computer Science & Engineering",
      institution: "Institute of Technology",
      period: "2018 - 2022",
      details: "Focus on Data Structures, Algorithms, Distributed Systems, Computer Graphics & Operating Systems."
    }
  ],

  musicTracks: [
    { id: 1, title: "Midnight Coder (Synthwave)", tempo: 110, mood: "synth" },
    { id: 2, title: "8-Bit Nostalgia (Chiptune)", tempo: 130, mood: "chip" },
    { id: 3, title: "Cyber Sunset (Lo-Fi)", tempo: 85, mood: "lofi" }
  ],

  easterEggs: {
    trashFiles: [
      { name: "internet_explorer_shortcuts.lnk", info: "A relic from an ancient epoch. It takes 10 minutes to open." },
      { name: "bugs_to_fix_tomorrow.txt", info: "\"There are 99 bugs in the code, fix one down, 127 bugs in the code.\"" },
      { name: "secret_recipe.doc", info: "Ingredients: 70% Caffeine, 20% StackOverflow, 10% Pure Willpower." },
      { name: "world_domination_plan.bat", info: "Access Denied: Requires root/sudo privileges and a slice of pizza." }
    ],
    quotes: [
      "Talk is cheap. Show me the code. — Linus Torvalds",
      "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
      "The best way to predict the future is to implement it. — Alan Kay",
      "There's no place like 127.0.0.1",
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler"
    ]
  }
};

