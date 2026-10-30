/**
 * Agam-DOS Terminal Shell
 * Primary executable: 'agam' command with full manual & real portfolio data.
 * Sourced from: https://portfolio-swart-pi-47.vercel.app/
 */

class TerminalApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.outputEl = this.container.querySelector(".terminal-output");
    this.inputEl = this.container.querySelector(".terminal-input");
    this.promptEl = this.container.querySelector(".terminal-prompt");

    this.history = [];
    this.historyIndex = -1;
    this.isMatrixActive = false;
    this.matrixInterval = null;

    this.init();
  }

  init() {
    if (!this.inputEl) return;

    this.printWelcome();

    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = this.inputEl.value.trim();
        this.inputEl.value = "";
        this.executeCommand(cmd);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.inputEl.value = this.history[this.history.length - 1 - this.historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.inputEl.value = this.history[this.history.length - 1 - this.historyIndex];
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.inputEl.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.autocomplete();
      }
    });

    // Auto-focus input when clicking terminal window
    this.container.addEventListener("click", () => {
      this.inputEl.focus();
    });
  }

  printWelcome() {
    const now = new Date();
    this.printLine(`Last login: ${now.toDateString()} ${now.toLocaleTimeString()} on ttys001`, "dim");
    this.printLine("Darwin MacBook-Pro.local 24.2.0 Darwin Kernel Version 24.2.0: arm64", "dim");
    this.printLine("================================================================", "info");
    this.printLine("  AgamOS Terminal — zsh shell [Developer Edition]", "highlight");
    this.printLine("================================================================", "info");
    this.printAgamBulletNotice();
    this.printLine("Type 'agam man' to read the complete manual for the 'agam' command.", "dim");
    this.printLine("Type 'agam skills' to view & download the Python & AI skills matrix.", "dim");
    this.printLine("Type 'agam portfolio' to launch the Spider-Man portfolio inside AgamOS.\n", "dim");
  }

  printAgamBulletNotice() {
    this.printLine("\n[SYSTEM DIRECTORY & COMMAND INTERFACE]:", "highlight");
    this.printLine("  • IMPORTANT: All commands in this shell must be prefixed with 'agam'.", "warn");
    this.printLine("  • agam skills     - View Python 3 & AI Prompt skills matrix (with download option)", "info");
    this.printLine("  • agam education  - View academic credentials (NST AI/ML & Prodigy School)", "info");
    this.printLine("  • agam portfolio  - Launch & view the Spider-Man portfolio inside AgamOS", "info");
    this.printLine("  • agam contacts   - View contact channels & download digital vCard", "info");
    this.printLine("  • agam about      - View personal background, biography & specializations", "info");
    this.printLine("  • agam man        - Open the official 'agam' command manual", "highlight");
    this.printLine("");
  }

  executeCommand(rawCmd) {
    if (!rawCmd) {
      this.printLine("agam@MacBook-Pro ~ % ");
      this.printLine("  • IMPORTANT: All commands in this shell must be prefixed with 'agam'. Example: 'agam skills' or 'agam man'.", "warn");
      this.scrollToBottom();
      return;
    }

    this.history.push(rawCmd);
    this.historyIndex = -1;

    this.printLine(`agam@MacBook-Pro ~ % ${rawCmd}`, "cmd-echo");

    const parts = rawCmd.split(" ").filter(Boolean);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.isMatrixActive) {
      this.stopMatrix();
    }

    switch (command) {
      // 1. Primary AGAM Command
      case "agam":
        this.cmdAgam(args);
        break;

      // 2. Direct manual alias
      case "man":
        if (args[0] === "agam" || !args[0]) {
          this.cmdAgamManual();
        } else {
          this.printLine(`No manual entry for '${args[0]}'. Try 'man agam'.`, "err");
        }
        break;

      // 3. User typed directory without "agam" -> Helpful redirect with reminder
      case "skills":
      case "education":
      case "portfolio":
      case "contacts":
      case "contact":
      case "about":
      case "manual":
        this.printLine(`  • Notice: Remember to prefix commands with 'agam'. Executing 'agam ${command}' for you...`, "warn");
        this.cmdAgam([command, ...args]);
        break;

      case "resume":
        this.printLine("  • Notice: 'resume' is now 'skills'. Executing 'agam skills' for you...", "warn");
        this.cmdAgam(["skills", ...args]);
        break;

      // 4. Removed projects notice
      case "projects":
      case "project":
        this.printLine("\n[NOTICE] 'projects' has been removed per request. Please use 'agam portfolio' or 'agam skills'.", "warn");
        this.printLine("  • IMPORTANT: All commands must start with 'agam' (e.g. 'agam skills', 'agam portfolio').", "warn");
        break;

      // 5. System / Utilities
      case "help":
        this.cmdHelp();
        break;
      case "dir":
      case "ls":
        this.printAgamBulletNotice();
        break;
      case "cat":
        this.cmdCat(args);
        break;
      case "matrix":
        this.cmdMatrix();
        break;
      case "minecraft":
      case "craft":
      case "craft98":
        if (window.windowManager) window.windowManager.openApp("minecraft");
        this.printLine("Launching Craft98 — Minecraft Alpha 3D...", "highlight");
        break;
      case "neofetch":
        this.cmdNeofetch();
        break;
      case "theme":
        this.cmdTheme(args[0]);
        break;
      case "clear":
      case "cls":
        this.outputEl.innerHTML = "";
        this.printLine("  • IMPORTANT: All commands in this shell must be prefixed with 'agam'. Example: 'agam skills' or 'agam man'.", "warn");
        break;
      case "date":
      case "time":
        this.printLine(`Current System Time: ${new Date().toString()}`);
        break;
      case "whoami":
        this.printLine("guest@agam-workstation (Security Level: Visitor)");
        break;
      case "echo":
        this.printLine(args.join(" "));
        break;
      case "sudo":
        this.printLine("Nice try! User 'guest' is not in the sudoers file. This incident will be reported to Santa Claus.", "warn");
        break;
      case "reboot":
        window.dispatchEvent(new CustomEvent("rebootAgamOS"));
        break;
      case "exit":
        if (window.windowManager) window.windowManager.closeWindow("terminal");
        break;
      default:
        this.printLine(`'${command}' is not recognized as an internal or external command.`, "err");
        this.printLine("  • IMPORTANT: You must type 'agam' before any usage. Example: 'agam skills' or 'agam man'.", "warn");
        break;
    }

    this.scrollToBottom();
  }

  // --- "agam <command>" Handler ---

  cmdAgam(args) {
    if (!args || args.length === 0) {
      this.cmdAgamManual();
      return;
    }

    const sub = args[0].toLowerCase();
    const action = args[1] ? args[1].toLowerCase() : "";

    switch (sub) {
      case "skills":
      case "skill":
        this.cmdAgamSkills(action);
        break;
      case "education":
      case "edu":
        this.cmdAgamEducation(action);
        break;
      case "portfolio":
      case "spiderman":
        this.cmdAgamPortfolio(action);
        break;
      case "contacts":
      case "contact":
        this.cmdAgamContacts(action);
        break;
      case "about":
      case "bio":
        this.cmdAgamAbout(action);
        break;
      case "resume":
        this.printLine("  • Notice: Resume is organized under 'agam skills'. Opening skills...", "warn");
        this.cmdAgamSkills(action);
        break;
      case "man":
      case "manual":
      case "--help":
      case "-h":
      case "help":
        this.cmdAgamManual();
        break;
      case "version":
      case "-v":
        this.printLine("AGAM Utility v3.0 (Python 3 & AI Prompt Specialist Edition)", "highlight");
        this.printLine("Author: Agam Makhija • Newton School of Technology");
        break;
      case "projects":
      case "project":
        this.printLine("\n[NOTICE] 'projects' has been removed per request. Use 'agam portfolio' to see the Spider-Man portfolio.", "warn");
        break;
      default:
        this.printLine(`\nUnknown directory or argument: 'agam ${sub}'`, "err");
        this.printLine("  • IMPORTANT: You must type 'agam' followed by a valid directory (e.g. 'agam skills').", "warn");
        this.printAgamBulletNotice();
        break;
    }
  }

  // --- Manual for "agam" ---

  cmdAgamManual() {
    this.printLine("\n================================================================", "highlight");
    this.printLine("AGAM(1)                   AGAM USER COMMANDS            AGAM(1)", "highlight");
    this.printLine("================================================================\n", "highlight");

    this.printLine("NAME", "info");
    this.printLine("    agam - Primary command-line utility for Agam Makhija's portfolio\n");

    this.printLine("SYNOPSIS", "info");
    this.printLine("    agam <command> [options]\n");

    this.printLine("DESCRIPTION", "info");
    this.printLine("    The 'agam' command is the mandatory primary interface to access all");
    this.printLine("    skills, academic credentials, personal profile data, and downloads.");
    this.printLine("    All queries must be invoked via 'agam <directory>'.\n");

    this.printLine("COMMANDS", "info");
    this.printLine("    skills");
    this.printLine("        Display Agam's official skill breakdown across Python 3 and AI Prompt");
    this.printLine("        Engineering with live level meters, and instant file download option.");
    this.printLine("    education");
    this.printLine("        Display academic credentials from Newton School of Technology");
    this.printLine("        (2026–2030 Ongoing B.Tech CSE AI/ML) and Prodigy Public School (2024–2026).");
    this.printLine("    portfolio");
    this.printLine("        Launch the live Spider-Man interactive portfolio inside AgamOS");
    this.printLine("        (https://portfolio-swart-pi-47.vercel.app/).");
    this.printLine("    contacts");
    this.printLine("        Display verified communication channels (Email, LinkedIn, GitHub)");
    this.printLine("        and render a downloadable digital business card (vCard).");
    this.printLine("    about");
    this.printLine("        Display biographical chronicle, core focus in Python scripting");
    this.printLine("        and AI Prompt Engineering.");
    this.printLine("    man, manual, --help");
    this.printLine("        Display this manual page.\n");

    this.printLine("OPTIONS", "info");
    this.printLine("    download, --download, -d");
    this.printLine("        Directly triggers the download of the corresponding file to");
    this.printLine("        the user's device (e.g., 'agam skills download').\n");

    this.printLine("BULLET POINT DIRECTORY LIST:", "highlight");
    this.printLine("  • IMPORTANT: All commands in this shell must be prefixed with 'agam'.", "warn");
    this.printLine("  • agam skills     - Read or download Python & AI Prompt skills matrix", "info");
    this.printLine("  • agam education  - Read academic credentials (NST & Prodigy School)", "info");
    this.printLine("  • agam portfolio  - Launch Spider-Man portfolio inside workstation", "info");
    this.printLine("  • agam contacts   - Read or download vCard contact card", "info");
    this.printLine("  • agam about      - Read bio & AI / Python specializations\n");

    this.printLine("AUTHOR", "info");
    this.printLine("    Agam Makhija (Newton School of Technology, AI/ML Specialist)");
    this.printLine("    Portfolio: https://portfolio-swart-pi-47.vercel.app/\n");
    this.printLine("================================================================\n", "highlight");
  }

  // Spider-Man Portfolio Handler
  cmdAgamPortfolio(action) {
    const url = window.PORTFOLIO_DATA.profile.spidermanPortfolioUrl || "https://portfolio-swart-pi-47.vercel.app/";
    this.printLine("\n=================== SPIDER-MAN PORTFOLIO ===================", "highlight");
    this.printLine("Title:   Agam Makhija — Spider-Man Interactive Portfolio");
    this.printLine(`URL:     ${url}`);
    this.printLine("Status:  Embedding inside AgamOS Internet Explorer window...");
    this.printLine("==============================================================", "highlight");

    if (window.windowManager) {
      window.windowManager.openApp("portfolio");
    }

    this.printHTML(`
      <div style="margin: 8px 0; display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="term-dl-btn" onclick="if (window.windowManager) window.windowManager.openApp('portfolio')">
          🕷️ [LAUNCH SPIDER-MAN PORTFOLIO WINDOW]
        </button>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="term-dl-btn" style="text-decoration:none; display:inline-block;">
          🌐 [OPEN IN NEW BROWSER TAB]
        </a>
      </div>
    `);
    this.printLine("Tip: You can also click the 🕷️ Portfolio icon on the desktop anytime.\n", "dim");
  }

  // 1. "agam resume"
  cmdAgamResume(action) {
    if (action === "download" || action === "--download" || action === "-d") {
      this.downloadFile("resume");
      return;
    }

    const p = window.PORTFOLIO_DATA.profile;
    const edu = window.PORTFOLIO_DATA.education;

    this.printLine("\n==================== RESUME: AGAM MAKHIJA ====================", "highlight");
    this.printLine(`${p.name} — ${p.title}`);
    this.printLine(`Focus: Python Scripting • Advanced Prompt Engineering • Machine Learning`);
    this.printLine(`Email: ${p.email} | GitHub: ${p.github} | Location: ${p.location}\n`);

    this.printLine("[PROFILE SUMMARY]:", "info");
    p.bio.forEach(b => this.printLine(`  ${b}`));

    this.printLine("\n[SPECIALIZATION & TECHNICAL FOCUS]:", "info");
    this.printLine("• Python Scripting & Automation: Modular code, data pipelines, and clean OOP.");
    this.printLine("• AI & Prompt Engineering: System prompts, Chain-of-Thought (CoT), few-shot patterns.");
    this.printLine("• Machine Learning Foundations: Model evaluation, algorithms, and computational logic.");

    this.printLine("\n[EDUCATION & TRAINING]:", "info");
    edu.forEach(ed => {
      this.printLine(`• ${ed.degree} (${ed.period})`);
      this.printLine(`  ${ed.institution} — ${ed.status}`);
      if (ed.highlights) {
        ed.highlights.forEach(h => this.printLine(`    - ${h}`));
      }
    });

    this.printLine("==============================================================", "highlight");

    // Interactive Download Option
    this.printHTML(`
      <div style="margin: 8px 0;">
        <button class="term-dl-btn" onclick="window.terminalApp.downloadFile('resume')">
          ⬇️ [DOWNLOAD RESUME: Agam_Makhija_Resume.txt]
        </button>
      </div>
    `);
    this.printLine("Tip: You can also type 'agam resume download' to save directly.\n", "dim");
  }

  // 2. "agam contacts"
  cmdAgamContacts(action) {
    if (action === "download" || action === "--download" || action === "-d") {
      this.downloadFile("contacts");
      return;
    }

    const p = window.PORTFOLIO_DATA.profile;

    this.printLine("\n=================== CONTACTS: AGAM MAKHIJA ===================", "highlight");
    this.printLine(`  Name:         ${p.name}`);
    this.printLine(`  Role:         ${p.title}`);
    this.printLine(`  Email:        ${p.email}`);
    this.printLine(`  LinkedIn:     ${p.linkedin}`);
    this.printLine(`  GitHub:       ${p.github}`);
    this.printLine(`  Institute:    Newton School of Technology`);
    this.printLine(`  Availability: ${p.status}`);
    this.printLine("==============================================================", "highlight");

    this.printHTML(`
      <div style="margin: 8px 0;">
        <button class="term-dl-btn" onclick="window.terminalApp.downloadFile('contacts')">
          ⬇️ [DOWNLOAD VCARD CONTACT CARD: Agam_Makhija.vcf]
        </button>
      </div>
    `);
    this.printLine("Tip: You can also type 'agam contacts download' to save directly.\n", "dim");
  }

  // 3. "agam education"
  cmdAgamEducation(action) {
    if (action === "download" || action === "--download" || action === "-d") {
      this.downloadFile("education");
      return;
    }

    const edu = window.PORTFOLIO_DATA.education;

    this.printLine("\n================== EDUCATION: AGAM MAKHIJA ===================", "highlight");
    edu.forEach(ed => {
      this.printLine(`\n• ${ed.degree.toUpperCase()}`, "info");
      this.printLine(`  Specialization: ${ed.specialization}`);
      this.printLine(`  Institution:    ${ed.institution}`);
      this.printLine(`  Period:         ${ed.period} [${ed.status}]`);
      this.printLine(`  Summary:        ${ed.details}`);
      if (ed.highlights) {
        this.printLine("  Key Focus Domains:");
        ed.highlights.forEach(h => this.printLine(`    - ${h}`));
      }
    });
    this.printLine("\n==============================================================", "highlight");

    this.printHTML(`
      <div style="margin: 8px 0;">
        <button class="term-dl-btn" onclick="window.terminalApp.downloadFile('education')">
          ⬇️ [DOWNLOAD EDUCATION FILE: Agam_Makhija_Education.txt]
        </button>
      </div>
    `);
    this.printLine("Tip: You can also type 'agam education download' to save directly.\n", "dim");
  }

  // 4. "agam about"
  cmdAgamAbout(action) {
    if (action === "download" || action === "--download" || action === "-d") {
      this.downloadFile("about");
      return;
    }

    const p = window.PORTFOLIO_DATA.profile;

    this.printLine(`\n==================== ABOUT ${p.name.toUpperCase()} ====================`, "highlight");
    this.printLine(`Role:     ${p.title}`);
    this.printLine(`Focus:    ${p.tagline}`);
    this.printLine(`College:  Newton School of Technology (NST)`);
    this.printLine(`Quote:    "${p.quote}"\n`);

    p.bio.forEach(b => this.printLine(b));

    this.printLine("\n[FOCUS DIRECTORY]:", "info");
    this.printLine("  • Python Scripting: Workflow automation, file pipelines, and data logic.");
    this.printLine("  • AI & Prompt Craft: System instructions, CoT, structured JSON schemas.");
    this.printLine("  • Academic Track: B.Tech in CSE (AI/ML) 2026–2030.");
    this.printLine("==============================================================", "highlight");

    this.printHTML(`
      <div style="margin: 8px 0;">
        <button class="term-dl-btn" onclick="window.terminalApp.downloadFile('about')">
          ⬇️ [DOWNLOAD BIO: Agam_Makhija_Bio.txt]
        </button>
      </div>
    `);
    this.printLine("Tip: You can also type 'agam about download' to save directly.\n", "dim");
  }

  // 5. "agam skills"
  cmdAgamSkills(action) {
    if (action === "download" || action === "--download" || action === "-d") {
      this.downloadFile("skills");
      return;
    }

    const s = window.PORTFOLIO_DATA.skills;

    this.printLine("\n=================== SKILLS & ARSENAL: AGAM ===================", "highlight");
    Object.keys(s).forEach(category => {
      this.printLine(`\n:: ${category.toUpperCase()} ::`, "info");
      s[category].forEach(item => {
        const barLength = Math.round(item.level / 5);
        const bar = "[" + "#".repeat(barLength) + "-".repeat(20 - barLength) + "]";
        const namePad = item.name.padEnd(38, " ");
        this.printLine(`  ${namePad} ${bar} ${item.level}%`);
      });
    });
    this.printLine("\n==============================================================", "highlight");

    this.printHTML(`
      <div style="margin: 8px 0;">
        <button class="term-dl-btn" onclick="window.terminalApp.downloadFile('skills')">
          ⬇️ [DOWNLOAD SKILLS MATRIX: Agam_Makhija_Skills.txt]
        </button>
      </div>
    `);
    this.printLine("Tip: You can also type 'agam skills download' to save directly.\n", "dim");
  }

  // --- Dynamic File Downloader ---

  downloadFile(fileType) {
    let content = "";
    let filename = "";
    let mime = "text/plain;charset=utf-8";
    const p = window.PORTFOLIO_DATA.profile;

    if (fileType === "resume") {
      filename = "Agam_Makhija_Resume.txt";
      content = `================================================================
RESUME: AGAM MAKHIJA
AI & Python Developer | Prompt Engineering Specialist
Email: ${p.email} | GitHub: ${p.github} | LinkedIn: ${p.linkedin}
================================================================

PROFILE SUMMARY:
${p.bio.join("\n\n")}

CORE SPECIALIZATION:
- Python Scripting & Workflow Automation (Core Language)
- AI & LLM Prompt Engineering (System Instructions, CoT, Few-Shot)
- Machine Learning & Algorithmic Logic

EDUCATION:
${window.PORTFOLIO_DATA.education.map(ed => `* ${ed.degree} (${ed.period})
  Institution:    ${ed.institution} [${ed.status}]
  Specialization: ${ed.specialization}
  Summary:        ${ed.details}
  Focus Highlights:
` + (ed.highlights ? ed.highlights.map(h => `    - ${h}`).join("\n") : "")).join("\n\n")}

TECHNICAL ARSENAL:
${Object.keys(window.PORTFOLIO_DATA.skills).map(cat => `${cat.toUpperCase()}:\n` + window.PORTFOLIO_DATA.skills[cat].map(s => `  • ${s.name} (${s.level}%)`).join("\n")).join("\n\n")}

PORTFOLIO & LIVE DISPATCH:
https://portfolio-swart-pi-47.vercel.app/
================================================================`;
    } else if (fileType === "contacts" || fileType === "contact") {
      filename = "Agam_Makhija.vcf";
      mime = "text/vcard;charset=utf-8";
      content = `BEGIN:VCARD
VERSION:3.0
N:Makhija;Agam;;;
FN:Agam Makhija
ORG:Newton School of Technology
TITLE:AI & Python Developer | Prompt Engineering Specialist
EMAIL;TYPE=INTERNET,PREF:${p.email}
URL:${p.github}
X-SOCIALPROFILE;TYPE=linkedin:${p.linkedin}
X-SOCIALPROFILE;TYPE=twitter:${p.twitter}
NOTE:Specializing in Python scripting, prompt engineering & machine learning.
END:VCARD`;
    } else if (fileType === "education") {
      filename = "Agam_Makhija_Education.txt";
      content = `================================================================
ACADEMIC CHRONICLES: AGAM MAKHIJA
================================================================
${window.PORTFOLIO_DATA.education.map(ed => `DEGREE:      ${ed.degree}
INSTITUTION: ${ed.institution} (${ed.period}) [${ed.status}]
STREAM:      ${ed.specialization}
DETAILS:     ${ed.details}
DOMAINS:
${ed.highlights ? ed.highlights.map(h => `  - ${h}`).join("\n") : ""}`).join("\n\n")}
================================================================`;
    } else if (fileType === "about") {
      filename = "Agam_Makhija_Bio.txt";
      content = `================================================================
BIOGRAPHY: AGAM MAKHIJA
Role:    ${p.title}
Focus:   ${p.tagline}
College: Newton School of Technology (NST)
Status:  ${p.status}
Quote:   "${p.quote}"

${p.bio.join("\n\n")}
================================================================`;
    } else if (fileType === "skills") {
      filename = "Agam_Makhija_Skills.txt";
      content = `================================================================
SKILLS & ARSENAL: AGAM MAKHIJA
================================================================
${Object.keys(window.PORTFOLIO_DATA.skills).map(cat => `${cat.toUpperCase()}:\n` + window.PORTFOLIO_DATA.skills[cat].map(s => `  • ${s.name} [${s.level}%]`).join("\n")).join("\n\n")}
================================================================`;
    }

    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.audioEngine) window.audioEngine.playStartupChime();
      this.printLine(`\n[SUCCESS] File '${filename}' downloaded to your device!`, "highlight");
    } catch (err) {
      console.error(err);
      this.printLine(`[ERROR] Download failed: ${err.message}`, "err");
    }
  }

  // --- Help & System Commands ---

  cmdHelp() {
    this.printLine("\n===================== AGAM-DOS COMMAND LIST =====================", "highlight");
    this.printAgamBulletNotice();
    this.printLine("[SYSTEM UTILITIES]:", "highlight");
    this.printLine("  agam man      - Complete manual page for 'agam' command");
    this.printLine("  matrix        - Stream falling digital green code");
    this.printLine("  minecraft     - Launch playable 3D Minecraft Alpha (Craft98)");
    this.printLine("  neofetch      - Render ASCII system overview");
    this.printLine("  theme [color] - Change phosphor tint: 'matrix', 'amber', 'cyan', 'classic'");
    this.printLine("  clear / cls   - Clear the terminal screen");
    this.printLine("  date / time   - Print system timestamp");
    this.printLine("  reboot        - Trigger system restart sequence");
    this.printLine("  exit          - Close this terminal window\n");
    this.printLine("• Notice: Directory 'projects' has been removed from terminal access.", "dim");
    this.printLine("================================================================\n", "highlight");
  }

  cmdCat(args) {
    if (!args[0]) {
      this.printLine("Usage: cat <filename> (e.g. 'cat resume.txt')", "warn");
      return;
    }
    const file = args[0].toLowerCase();
    if (file === "resume.txt" || file === "resume") {
      this.cmdAgamResume();
    } else if (file === "contacts.txt" || file === "contacts" || file === "contacts.vcf") {
      this.cmdAgamContacts();
    } else if (file === "education.txt" || file === "education") {
      this.cmdAgamEducation();
    } else if (file === "about.txt" || file === "bio.txt") {
      this.cmdAgamAbout();
    } else if (file === "skills.txt") {
      this.cmdAgamSkills();
    } else {
      this.printLine(`cat: ${args[0]}: No such file or directory`, "err");
    }
  }

  cmdNeofetch() {
    const ascii = [
      "        /\\         agam@workstation-98",
      "       /  \\        -------------------",
      "      / /\\ \\       OS: AgamOS 98 SE x86",
      "     / /__\\ \\      Host: 3D Retro Workstation (CRT 17\")",
      "    / /____\\ \\     Core: Python 3 & AI Prompt Engineering",
      "   /_/      \\_\\    Uptime: 99.98% (342 days, 4 hours)",
      "                   College: Newton School of Technology (AI/ML)",
      "                   Shell: agamdosh v6.22 (Prefix: 'agam')",
      "                   Resolution: 1024x768 @ 85Hz CRT",
      "                   Command: 'agam <skills|education|portfolio|contacts|about>'"
    ];
    ascii.forEach(line => this.printLine(line, "info"));
  }

  cmdMatrix() {
    this.isMatrixActive = true;
    this.printLine("\n[ENTERING THE MATRIX - Press any key to stop]\n", "info");

    const chars = "0123456789ABCDEF@#$%&*+-<>~";
    this.matrixInterval = setInterval(() => {
      let line = "";
      for (let i = 0; i < 50; i++) {
        line += chars[Math.floor(Math.random() * chars.length)] + " ";
      }
      this.printLine(line, "matrix-stream");
      this.scrollToBottom();
    }, 80);

    const stopHandler = () => {
      this.stopMatrix();
      window.removeEventListener("keydown", stopHandler);
    };
    window.addEventListener("keydown", stopHandler);
  }

  stopMatrix() {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }
    this.isMatrixActive = false;
  }

  cmdTheme(color) {
    const valid = ["matrix", "amber", "cyan", "classic"];
    if (!valid.includes(color)) {
      this.printLine(`Usage: theme [matrix | amber | cyan | classic]`, "warn");
      return;
    }

    this.container.classList.remove("theme-matrix", "theme-amber", "theme-cyan", "theme-classic");
    this.container.classList.add(`theme-${color}`);
    this.printLine(`Terminal phosphor theme set to: ${color}`, "info");
  }

  autocomplete() {
    const val = this.inputEl.value.toLowerCase();
    const commands = [
      "agam",
      "agam skills",
      "agam education",
      "agam portfolio",
      "agam contacts",
      "agam about",
      "agam man",
      "agam manual",
      "agam skills download",
      "agam education download",
      "agam contacts download",
      "man agam",
      "help",
      "matrix",
      "minecraft",
      "neofetch",
      "clear",
      "theme",
      "date",
      "exit"
    ];

    const match = commands.find(c => c.startsWith(val));
    if (match) {
      this.inputEl.value = match + (match.endsWith("download") ? "" : " ");
    }
  }

  printLine(text, type = "normal") {
    const div = document.createElement("div");
    div.className = `term-line ${type}`;
    div.textContent = text;
    this.outputEl.appendChild(div);
  }

  printHTML(html, type = "normal") {
    const div = document.createElement("div");
    div.className = `term-line ${type}`;
    div.innerHTML = html;
    this.outputEl.appendChild(div);
  }

  scrollToBottom() {
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

window.TerminalApp = TerminalApp;
