/**
 * Agam-DOS Terminal Shell
 * Authentic CRT terminal emulator with directory commands & file downloads:
 * - 5-Point Directory System: resume, contacts, education, about, skills
 * - "agam <directory>" command syntax with instant download options
 * - "projects" removed per user request
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
    this.printLine("================================================================", "info");
    this.printLine("  AGAM-DOS v6.22 [Phosphor Shell] (C) 1998 Agam Makhija", "highlight");
    this.printLine("================================================================", "info");
    this.printAgamBulletList();
    this.printLine("Type 'agam <directory>' (e.g. 'agam resume') to read or download.", "dim");
    this.printLine("Type 'help' for utility commands.\n", "dim");
  }

  printAgamBulletList() {
    this.printLine("\n[DIRECTORIES IN C:\\AGAM - 5 ACCESS POINTS]:", "highlight");
    this.printLine("  • agam resume     - View and download Agam's official resume", "info");
    this.printLine("  • agam contacts   - View contact channels & download vCard", "info");
    this.printLine("  • agam education  - View educational qualifications & credentials", "info");
    this.printLine("  • agam about      - View personal background, biography & stats", "info");
    this.printLine("  • agam skills     - View technical skill matrix & proficiencies", "info");
    this.printLine("");
  }

  executeCommand(rawCmd) {
    if (!rawCmd) {
      this.printLine("C:\\AGAM> ");
      return;
    }

    this.history.push(rawCmd);
    this.historyIndex = -1;

    this.printLine(`C:\\AGAM> ${rawCmd}`, "cmd-echo");

    const parts = rawCmd.split(" ").filter(Boolean);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.isMatrixActive) {
      this.stopMatrix();
    }

    switch (command) {
      // Primary AGAM Command
      case "agam":
        this.cmdAgam(args);
        break;

      // Direct directory access aliases
      case "resume":
        this.cmdAgam(["resume", ...args]);
        break;
      case "contacts":
      case "contact":
        this.cmdAgam(["contacts", ...args]);
        break;
      case "education":
      case "edu":
        this.cmdAgam(["education", ...args]);
        break;
      case "about":
      case "bio":
        this.cmdAgam(["about", ...args]);
        break;
      case "skills":
      case "skill":
        this.cmdAgam(["skills", ...args]);
        break;

      // Removed projects notice
      case "projects":
      case "project":
        this.printLine("\n[NOTICE] Directory 'projects' has been removed from terminal access.", "warn");
        this.printLine("Please use the desktop 'Projects Explorer' window or check GitHub: https://github.com/agammakhija\n", "dim");
        break;

      // System / Utilities
      case "dir":
      case "ls":
        this.printAgamBulletList();
        break;
      case "help":
        this.cmdHelp();
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
        this.printLine("Type 'agam' to see accessible directories, or 'help' for utility commands.");
        break;
    }

    this.scrollToBottom();
  }

  // --- "agam <directory>" Handler ---

  cmdAgam(args) {
    if (!args || args.length === 0) {
      this.printAgamBulletList();
      this.printLine("Type 'agam <directory>' (e.g. 'agam resume') to read or download.", "dim");
      return;
    }

    const dir = args[0].toLowerCase();
    const action = args[1] ? args[1].toLowerCase() : "";

    switch (dir) {
      case "resume":
        this.cmdAgamResume(action);
        break;
      case "contacts":
      case "contact":
        this.cmdAgamContacts(action);
        break;
      case "education":
      case "edu":
        this.cmdAgamEducation(action);
        break;
      case "about":
      case "bio":
        this.cmdAgamAbout(action);
        break;
      case "skills":
      case "skill":
        this.cmdAgamSkills(action);
        break;
      case "projects":
      case "project":
        this.printLine("\n[NOTICE] Directory 'projects' has been removed from terminal access.", "warn");
        this.printLine("Please use the desktop 'Projects' window or visit: https://github.com/agammakhija\n", "dim");
        break;
      default:
        this.printLine(`\nDirectory or file 'agam ${dir}' not found.`, "err");
        this.printAgamBulletList();
        break;
    }
  }

  // 1. "agam resume"
  cmdAgamResume(action) {
    if (action === "download" || action === "--download" || action === "-d") {
      this.downloadFile("resume");
      return;
    }

    const p = window.PORTFOLIO_DATA.profile;
    const exp = window.PORTFOLIO_DATA.experience;
    const edu = window.PORTFOLIO_DATA.education;

    this.printLine("\n==================== RESUME: AGAM MAKHIJA ====================", "highlight");
    this.printLine(`${p.name} — ${p.title}`);
    this.printLine(`Email: ${p.email} | GitHub: ${p.github} | Location: ${p.location}\n`);

    this.printLine("[EXPERIENCE]:", "info");
    exp.forEach(e => {
      this.printLine(`• ${e.role} @ ${e.company} (${e.period}) - ${e.location}`);
      e.bullets.forEach(b => this.printLine(`    - ${b}`));
    });

    this.printLine("\n[EDUCATION]:", "info");
    edu.forEach(ed => {
      this.printLine(`• ${ed.degree}`);
      this.printLine(`    ${ed.institution} (${ed.period})`);
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
    this.printLine(`  Name:     ${p.name}`);
    this.printLine(`  Email:    ${p.email}`);
    this.printLine(`  GitHub:   ${p.github}`);
    this.printLine(`  LinkedIn: ${p.linkedin}`);
    this.printLine(`  Twitter:  ${p.twitter}`);
    this.printLine(`  Location: ${p.location}`);
    this.printLine(`  Status:   ${p.status}`);
    this.printLine("==============================================================", "highlight");

    this.printHTML(`
      <div style="margin: 8px 0;">
        <button class="term-dl-btn" onclick="window.terminalApp.downloadFile('contacts')">
          ⬇️ [DOWNLOAD CONTACT CARD (vCard): Agam_Makhija.vcf]
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
      this.printLine(`• Degree:      ${ed.degree}`, "info");
      this.printLine(`  Institution: ${ed.institution}`);
      this.printLine(`  Period:      ${ed.period}`);
      this.printLine(`  Details:     ${ed.details}`);
    });
    this.printLine("==============================================================", "highlight");

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
    this.printLine(`Role:    ${p.title}`);
    this.printLine(`Tagline: ${p.tagline}`);
    this.printLine(`Status:  ${p.status}\n`);
    p.bio.forEach(b => this.printLine(b));

    this.printLine("\n[QUICK STATS]:", "info");
    p.stats.forEach(s => this.printLine(`  • ${s.label.padEnd(20, " ")}: ${s.value}`));
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

    this.printLine("\n=================== SKILLS MATRIX: AGAM ===================", "highlight");
    Object.keys(s).forEach(category => {
      this.printLine(`\n:: ${category} ::`, "info");
      s[category].forEach(item => {
        const barLength = Math.round(item.level / 5);
        const bar = "[" + "#".repeat(barLength) + "-".repeat(20 - barLength) + "]";
        const namePad = item.name.padEnd(28, " ");
        this.printLine(`  ${namePad} ${bar} ${item.level}%`);
      });
    });
    this.printLine("============================================================", "highlight");

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
Software Engineer & Creative Developer
Email: ${p.email} | GitHub: ${p.github} | LinkedIn: ${p.linkedin}
================================================================

SUMMARY:
${p.bio.join("\n\n")}

EXPERIENCE:
${window.PORTFOLIO_DATA.experience.map(e => `* ${e.role} @ ${e.company} (${e.period})\n  Location: ${e.location}\n` + e.bullets.map(b => `  - ${b}`).join("\n")).join("\n\n")}

EDUCATION:
${window.PORTFOLIO_DATA.education.map(ed => `* ${ed.degree}\n  ${ed.institution} (${ed.period})\n  ${ed.details}`).join("\n\n")}

SKILLS:
${Object.keys(window.PORTFOLIO_DATA.skills).map(cat => `${cat.toUpperCase()}:\n` + window.PORTFOLIO_DATA.skills[cat].map(s => `  - ${s.name} (${s.level}%)`).join("\n")).join("\n\n")}
================================================================`;
    } else if (fileType === "contacts" || fileType === "contact") {
      filename = "Agam_Makhija.vcf";
      mime = "text/vcard;charset=utf-8";
      content = `BEGIN:VCARD
VERSION:3.0
N:Makhija;Agam;;;
FN:Agam Makhija
TITLE:Software Engineer & Creative Developer
EMAIL;TYPE=INTERNET,PREF:${p.email}
URL:${p.github}
X-SOCIALPROFILE;TYPE=linkedin:${p.linkedin}
X-SOCIALPROFILE;TYPE=twitter:${p.twitter}
NOTE:Software Engineer & Creative Developer. Portfolio: AgamOS 98.
END:VCARD`;
    } else if (fileType === "education") {
      filename = "Agam_Makhija_Education.txt";
      content = `================================================================
EDUCATION CREDENTIALS: AGAM MAKHIJA
================================================================
${window.PORTFOLIO_DATA.education.map(ed => `Degree:      ${ed.degree}\nInstitution: ${ed.institution}\nPeriod:      ${ed.period}\nDetails:     ${ed.details}`).join("\n\n")}
================================================================`;
    } else if (fileType === "about") {
      filename = "Agam_Makhija_Bio.txt";
      content = `================================================================
BIOGRAPHY: AGAM MAKHIJA
================================================================
Role:    ${p.title}
Tagline: ${p.tagline}
Status:  ${p.status}

${p.bio.join("\n\n")}

STATS:
${p.stats.map(s => `• ${s.label}: ${s.value}`).join("\n")}
================================================================`;
    } else if (fileType === "skills") {
      filename = "Agam_Makhija_Skills.txt";
      content = `================================================================
TECHNICAL SKILL MATRIX: AGAM MAKHIJA
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
    this.printAgamBulletList();
    this.printLine("[SYSTEM & UTILITIES]:", "highlight");
    this.printLine("  matrix        - Stream falling digital green code");
    this.printLine("  minecraft     - Launch playable 3D Minecraft Alpha");
    this.printLine("  neofetch      - Render ASCII system overview");
    this.printLine("  theme [color] - Change phosphor tint: 'matrix', 'amber', 'cyan', 'classic'");
    this.printLine("  clear / cls   - Clear the terminal screen");
    this.printLine("  date / time   - Print system timestamp");
    this.printLine("  reboot        - Trigger system restart sequence");
    this.printLine("  exit          - Close this terminal window\n");
    this.printLine("Notice: Directory 'projects' has been removed from terminal access per request.", "dim");
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
      "    / /____\\ \\     Kernel: Three.js WebGL 2.0",
      "   /_/      \\_\\    Uptime: 99.98% (342 days, 4 hours)",
      "                   Shell: agamdosh v6.22",
      "                   Resolution: 1024x768 @ 85Hz CRT",
      "                   Directories: resume, contacts, education, about, skills",
      "                   CPU: Intel Pentium II @ 400MHz",
      "                   Memory: 128MB SDRAM / 10GB HDD"
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
      "agam resume",
      "agam contacts",
      "agam education",
      "agam about",
      "agam skills",
      "agam resume download",
      "agam contacts download",
      "agam education download",
      "resume",
      "contacts",
      "education",
      "about",
      "skills",
      "help",
      "matrix",
      "minecraft",
      "cat",
      "theme",
      "clear",
      "date",
      "whoami",
      "sudo",
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
