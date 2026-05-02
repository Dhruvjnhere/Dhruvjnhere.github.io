// ── Navigation ──
function navigateTo(page) {
  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Update tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const tabTarget = document.querySelector(`.tab[data-page="${page}"]`);
  if (tabTarget) {
    tabTarget.classList.add('active');
    tabTarget.style.display = 'flex'; // Ensure it's visible if it was closed
  }

  // Update activity bar
  document.querySelectorAll('.ab-icon[data-page]').forEach(i => i.classList.remove('active'));
  document.querySelector(`.ab-icon[data-page="${page}"]`)?.classList.add('active');

  // Update sidebar
  document.querySelectorAll('.file-item').forEach(f => f.classList.remove('active'));
  document.querySelector(`.file-item[data-page="${page}"]`)?.classList.add('active');

  // Update breadcrumb
  const fileNames = { home:'home.jsx', about:'about.html', projects:'projects.json', skills:'skills.ts', experience:'experience.js', contact:'contact.css' };
  document.getElementById('breadcrumb-file').textContent = fileNames[page] || page;

  // Scroll editor to top
  document.querySelector('.editor').scrollTop = 0;

  // Trigger reveal animations
  setTimeout(() => {
    target?.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 100);
    });
  }, 50);

  // Animate skill bars on skills page
  if (page === 'skills') {
    setTimeout(() => {
      document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.w;
      });
    }, 300);
  }

  // Animate stat counters on home page
  if (page === 'home') {
    setTimeout(() => animateCounters(), 300);
  }
}

// ── Counter Animation ──
function animateCounters() {
  document.querySelectorAll('.stat-val[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ── Intersection Observer for Reveals ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.1 });

// ── Click Handlers ──
document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.page));
});

// ── Tab Close Logic ──
document.querySelectorAll('.tab .close').forEach(closeBtn => {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tab = e.target.closest('.tab');
    tab.style.display = 'none';
    
    // Check if this was the active tab
    if (tab.classList.contains('active')) {
      const visibleTabs = Array.from(document.querySelectorAll('.tab')).filter(t => t.style.display !== 'none');
      if (visibleTabs.length > 0) {
        navigateTo(visibleTabs[0].dataset.page);
      } else {
        // No tabs left
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('breadcrumb-file').textContent = '';
      }
    }
  });
});

// ── Contact Form (Web3Forms) ──
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  const originalText = btn.textContent;

  // Show loading state
  btn.textContent = '⏳ Sending...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  try {
    const formData = new FormData(e.target);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    console.log("Web3Forms Response:", result);

    if (result.success) {
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#4ec9b0';
      btn.style.opacity = '1';
      e.target.reset();
    } else {
      btn.textContent = '✗ Failed to send';
      btn.style.background = '#f44747';
      btn.style.opacity = '1';
      console.error("Submission Error:", result.message);
    }
  } catch (err) {
    btn.textContent = '✗ Network error';
    btn.style.background = '#f44747';
    btn.style.opacity = '1';
  }

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.style.opacity = '';
    btn.disabled = false;
  }, 3000);
});

// ── Settings Toggle ──
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');

settingsBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsOverlay.classList.toggle('active');
  scOverlay?.classList.remove('active');
});

// ── Source Control Toggle ──
const scBtn = document.getElementById('ab-source-control');
const scOverlay = document.getElementById('sc-overlay');

scBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  scOverlay.classList.toggle('active');
  settingsOverlay?.classList.remove('active');
});

// Close overlays when clicking outside
document.addEventListener('click', () => {
  settingsOverlay?.classList.remove('active');
  scOverlay?.classList.remove('active');
});
settingsOverlay?.addEventListener('click', (e) => e.stopPropagation());
scOverlay?.addEventListener('click', (e) => e.stopPropagation());

// ── Theme Switching ──
document.querySelectorAll('[data-theme]').forEach(item => {
  item.addEventListener('click', () => {
    const theme = item.dataset.theme;
    
    // Remove all theme classes
    document.body.className = '';
    if (theme !== 'default') {
      document.body.classList.add('theme-' + theme);
    }

    // Update active state in settings
    document.querySelectorAll('[data-theme]').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Save preference
    localStorage.setItem('portfolio-theme', theme);
  });
});

// ── AI Chat Toggle ──
const chatPanel = document.getElementById('chat-panel');
const aiChatBtn = document.getElementById('ai-chat-btn');
const openChatBtn = document.getElementById('open-chat-btn');
const closeChat = document.getElementById('close-chat');

function toggleChat() {
  chatPanel.classList.toggle('active');
}

aiChatBtn?.addEventListener('click', toggleChat);
document.getElementById('sidebar-copilot-btn')?.addEventListener('click', toggleChat);
openChatBtn?.addEventListener('click', () => {
  toggleChat();
  settingsOverlay.classList.remove('active');
});
closeChat?.addEventListener('click', () => chatPanel.classList.remove('active'));

// ── AI Chat Logic ──
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// ── Dhruv's AI Knowledge Base ──
const dhruvKB = {
  bio: "Dhruv Jain is a Cybersecurity Researcher and B.Tech CSE student at GNA University (graduating 2028). He's passionate about ethical hacking, building secure applications, and exploring blockchain technology.",
  skills: {
    cyber: "Network Security, Ethical Hacking Basics, OSINT, Digital Forensics (Beginner), Vulnerability Assessment",
    programming: "C, C++, C#, JavaScript, Solidity (Smart Contracts)",
    web: "HTML, CSS, Blockchain Development, Cloud Basics, Networking Fundamentals"
  },
  projects: [
    { name: "PhishGuard Pro", desc: "A security awareness platform for phishing simulations" },
    { name: "VS Code Portfolio", desc: "This IDE-themed portfolio website" }
  ],
  certifications: [
    "Introduction to Cybersecurity — Cisco (Jan 2026)",
    "ISO/IEC 27001:2022 Information Security Associate — SkillFront (Dec 2025)",
    "ISC2 Candidate — ISC2 (Nov 2025)",
    "AWS Academy Graduate - Data Center Technician — AWS (Nov 2024)",
    "Diploma in Office Automation & Programming — NICE Computers (Jul 2024)"
  ],
  contact: { email: "dhruvjnhere@gmail.com", github: "github.com/Dhruvjnhere", linkedin: "linkedin.com/in/dhruv-jain-5070b3314" },
  interests: "Cyber Threat Intelligence, Digital Forensics, Blockchain Security, AI in Cybersecurity",
  education: "B.Tech CSE at GNA University (2024 – 2028)"
};

function getAIResponse(query) {
  const q = query.toLowerCase();

  // About / who
  if (/who is|about dhruv|tell me about|introduce|yourself/.test(q)) {
    return dhruvKB.bio;
  }
  // Skills / tech stack
  if (/skills|tech stack|technologies|proficient|know|languages/.test(q)) {
    return `🔐 **Cybersecurity:** ${dhruvKB.skills.cyber}\n\n💻 **Programming:** ${dhruvKB.skills.programming}\n\n🌐 **Web & Tech:** ${dhruvKB.skills.web}`;
  }
  // Projects
  if (/project|built|portfolio|work|made|create/.test(q)) {
    return `📁 Dhruv's key projects:\n\n${dhruvKB.projects.map(p => `• **${p.name}** — ${p.desc}`).join('\n')}\n\nMore at github.com/Dhruvjnhere`;
  }
  // Certifications
  if (/cert|license|credential|qualification|course/.test(q)) {
    return `📜 Certifications:\n\n${dhruvKB.certifications.map(c => `• ${c}`).join('\n')}`;
  }
  // Contact
  if (/contact|email|reach|connect|hire|github|linkedin/.test(q)) {
    return `📧 **Email:** ${dhruvKB.contact.email}\n🐙 **GitHub:** ${dhruvKB.contact.github}\n🔗 **LinkedIn:** ${dhruvKB.contact.linkedin}`;
  }
  // Education
  if (/education|university|college|study|degree|btech|b\.tech/.test(q)) {
    return `🎓 **Education:** ${dhruvKB.education}\nFocusing on cybersecurity, ethical hacking, and blockchain development.`;
  }
  // Experience
  if (/experience|work experience|job|intern|freelance/.test(q)) {
    return `💼 **Freelance Developer** (2024 – Present)\nBuilding web apps and landing pages for clients.\n\n🎓 **B.Tech CSE Student** at GNA University (2024 – 2028)\nActive in security research and coding events.`;
  }
  // Interests / research
  if (/interest|research|focus|passion|into/.test(q)) {
    return `🔬 Research interests: ${dhruvKB.interests}`;
  }
  // Theme
  if (/theme|color|appearance|dark|light/.test(q)) {
    return "🎨 You can change the portfolio theme! Click the ⚙️ settings icon at the bottom-left of the sidebar, or use the terminal command: `theme catppuccin`";
  }
  // Greeting
  if (/^(hi|hello|hey|yo|sup|greetings|good morning|good evening)/.test(q)) {
    const greetings = [
      "Hey there! 👋 Ask me anything about Dhruv — his skills, projects, or certifications!",
      "Hello! I'm Dhruv's AI assistant. What would you like to know?",
      "Hi! Ready to help. Try asking about Dhruv's projects or tech stack!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  // Thanks
  if (/thank|thanks|thx|appreciate/.test(q)) {
    return "You're welcome! 😊 Feel free to ask anything else about Dhruv.";
  }
  // Help
  if (/help|what can you|how to use/.test(q)) {
    return "I can answer questions about:\n• 👤 Who Dhruv is\n• 🛠️ His skills & tech stack\n• 📁 Projects he's built\n• 📜 Certifications\n• 💼 Experience\n• 📧 Contact info\n• 🎓 Education\n• 🎨 Theme settings";
  }
  // Fallback
  return "I'm not sure about that, but I know a lot about Dhruv! Try asking about his skills, projects, certifications, or experience. 😊";
}

function formatBotMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:var(--bg);padding:1px 5px;border-radius:3px;font-size:11px">$1</code>')
    .replace(/\n/g, '<br>');
}

function sendChatMessage(text) {
  if (!text.trim()) return;
  
  // Hide welcome screen
  const welcome = document.getElementById('chat-welcome');
  if (welcome) welcome.style.display = 'none';

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = text;
  chatMessages.appendChild(userMsg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'msg typing';
  typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // AI response after delay
  setTimeout(() => {
    typing.remove();
    const response = getAIResponse(text);
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.innerHTML = formatBotMsg(response);
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 600 + Math.random() * 600);
}

chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim()) {
    sendChatMessage(chatInput.value.trim());
    chatInput.value = '';
  }
});

document.getElementById('chat-send')?.addEventListener('click', () => {
  if (chatInput?.value.trim()) {
    sendChatMessage(chatInput.value.trim());
    chatInput.value = '';
  }
});

// Suggestion chips
document.querySelectorAll('.chat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    sendChatMessage(chip.dataset.q);
  });
});

// Clear chat
document.getElementById('clear-chat')?.addEventListener('click', () => {
  chatMessages.innerHTML = '';
  const welcome = document.getElementById('chat-welcome');
  if (welcome) {
    chatMessages.appendChild(welcome);
    welcome.style.display = '';
  }
});

// ── Window Controls ──
const appGrid = document.getElementById('app-grid');
const closedMsg = document.getElementById('closed-msg');
const msgTitle = closedMsg?.querySelector('h2');
const msgDesc = closedMsg?.querySelector('p');

document.getElementById('mac-close')?.addEventListener('click', () => {
  if(!appGrid || !closedMsg) return;
  appGrid.style.display = 'none';
  if(msgTitle) msgTitle.textContent = 'Window Closed';
  if(msgDesc) msgDesc.textContent = 'The portfolio session was terminated.';
  closedMsg.style.display = 'block';
});

window.reopenWindow = function() {
  if(!appGrid || !closedMsg) return;
  closedMsg.style.display = 'none';
  appGrid.style.display = ''; // restores grid
  setTimeout(() => {
    appGrid.classList.remove('minimized');
  }, 10);
};

document.getElementById('mac-min')?.addEventListener('click', () => {
  if(!appGrid || !closedMsg) return;
  appGrid.classList.add('minimized');
  setTimeout(() => {
    appGrid.style.display = 'none';
    if(msgTitle) msgTitle.textContent = 'Window Minimized';
    if(msgDesc) msgDesc.textContent = 'The portfolio session is running in the background.';
    closedMsg.style.display = 'block';
  }, 400);
});

document.getElementById('mac-max')?.addEventListener('click', toggleFullscreen);
document.getElementById('fullscreen-btn')?.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ── Terminal ──
const termPanel = document.getElementById('terminal-panel');
const termOutput = document.getElementById('terminal-output');
const termInput = document.getElementById('terminal-input');
const termBody = document.getElementById('terminal-body');

function toggleTerminal(forceOpen) {
  if (!termPanel) return;
  const isOpen = termPanel.classList.contains('active');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;

  if (shouldOpen) {
    termPanel.classList.add('active');
    appGrid.classList.add('terminal-open');
    setTimeout(() => termInput?.focus(), 100);
  } else {
    termPanel.classList.remove('active');
    appGrid.classList.remove('terminal-open');
  }
}

function clearTerminal() {
  if (!termOutput) return;
  termOutput.innerHTML = '';
}

function termPrint(text, cls = '') {
  const line = document.createElement('div');
  line.className = 'term-line' + (cls ? ' ' + cls : '');
  line.innerHTML = text;
  termOutput.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
}

function termPrintPrompt(cmd) {
  termPrint(`<span style="color:var(--green)">dhruv</span> <span style="color:var(--dim)">@portfolio</span> <span style="color:var(--blue)">: ~</span> <span style="color:var(--bright)">$</span> <span style="color:var(--text)">${cmd}</span>`, 'term-cmd');
}

const termCommands = {
  help: () => {
    termPrint('Available commands:', 'term-info');
    termPrint('  <span style="color:var(--yellow)">help</span>        — Show this help message');
    termPrint('  <span style="color:var(--yellow)">about</span>       — About Dhruv');
    termPrint('  <span style="color:var(--yellow)">skills</span>      — List skills');
    termPrint('  <span style="color:var(--yellow)">projects</span>    — List projects');
    termPrint('  <span style="color:var(--yellow)">contact</span>     — Contact information');
    termPrint('  <span style="color:var(--yellow)">whoami</span>      — Who am I?');
    termPrint('  <span style="color:var(--yellow)">date</span>        — Current date & time');
    termPrint('  <span style="color:var(--yellow)">neofetch</span>    — System information');
    termPrint('  <span style="color:var(--yellow)">echo</span> [msg]  — Print a message');
    termPrint('  <span style="color:var(--yellow)">goto</span> [page] — Navigate to a page');
    termPrint('  <span style="color:var(--yellow)">theme</span> [name]— Change theme');
    termPrint('  <span style="color:var(--yellow)">clear</span>       — Clear the terminal');
    termPrint('  <span style="color:var(--yellow)">exit</span>        — Close terminal');
  },
  about: () => {
    termPrint('╔═══════════════════════════════════════╗', 'term-info');
    termPrint('║  <span style="color:var(--bright)">Dhruv Jain</span>                          ║', 'term-info');
    termPrint('║  Cybersecurity Researcher             ║', 'term-info');
    termPrint('║  B.Tech CSE @ GNA University (2028)   ║', 'term-info');
    termPrint('║  Ethical Hacking | Blockchain Dev     ║', 'term-info');
    termPrint('╚═══════════════════════════════════════╝', 'term-info');
  },
  skills: () => {
    termPrint('<span style="color:var(--pink)">🔐 Cybersecurity:</span>');
    termPrint('   Network Security, Ethical Hacking, OSINT, Digital Forensics, Vuln Assessment');
    termPrint('<span style="color:var(--pink)">💻 Programming:</span>');
    termPrint('   C, C++, C#, JavaScript, Solidity');
    termPrint('<span style="color:var(--pink)">🌐 Web & Tech:</span>');
    termPrint('   HTML, CSS, Blockchain, Cloud Basics, Networking Fundamentals');
  },
  projects: () => {
    termPrint('<span style="color:var(--bright)">📁 Projects:</span>');
    termPrint('   → PhishGuard Pro — Security awareness platform');
    termPrint('   → Portfolio — This VS Code themed portfolio');
    termPrint('   → More on <span style="color:var(--blue)">github.com/Dhruvjnhere</span>');
  },
  contact: () => {
    termPrint('<span style="color:var(--bright)">📧 Contact:</span>');
    termPrint('   Email    : dhruvjnhere@gmail.com');
    termPrint('   GitHub   : github.com/Dhruvjnhere');
    termPrint('   LinkedIn : linkedin.com/in/dhruv-jain-5070b3314');
  },
  whoami: () => {
    termPrint('dhruv@portfolio', 'term-system');
  },
  date: () => {
    termPrint(new Date().toString(), 'term-info');
  },
  neofetch: () => {
    termPrint('<span style="color:var(--blue)">        ████████</span>       <span style="color:var(--bright)">dhruv</span>@<span style="color:var(--bright)">portfolio</span>');
    termPrint('<span style="color:var(--blue)">      ██        ██</span>     ─────────────────');
    termPrint('<span style="color:var(--blue)">    ██            ██</span>   <span style="color:var(--yellow)">OS:</span> Portfolio OS v1.0');
    termPrint('<span style="color:var(--blue)">   ██    ██  ██    ██</span>  <span style="color:var(--yellow)">Host:</span> VS Code Theme');
    termPrint('<span style="color:var(--blue)">   ██              ██</span>  <span style="color:var(--yellow)">Kernel:</span> HTML/CSS/JS');
    termPrint('<span style="color:var(--blue)">    ██   ██████   ██</span>  <span style="color:var(--yellow)">Shell:</span> portfolio-bash');
    termPrint('<span style="color:var(--blue)">      ██        ██</span>    <span style="color:var(--yellow)">Terminal:</span> web-terminal');
    termPrint('<span style="color:var(--blue)">        ████████</span>      <span style="color:var(--yellow)">CPU:</span> Brain v2.0');
    termPrint('');
    termPrint('  <span style="color:#ff5f56">██</span><span style="color:#ffbd2e">██</span><span style="color:#27c93f">██</span><span style="color:var(--blue)">██</span><span style="color:var(--purple)">██</span><span style="color:var(--pink)">██</span><span style="color:var(--yellow)">██</span><span style="color:var(--bright)">██</span>');
  },
  clear: () => {
    clearTerminal();
  },
  exit: () => {
    toggleTerminal(false);
  },
};

function handleTerminalCommand(input) {
  const raw = input.trim();
  if (!raw) return;

  termPrintPrompt(raw.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  const parts = raw.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  if (cmd === 'echo') {
    termPrint(args || '');
  } else if (cmd === 'goto') {
    const page = args.toLowerCase();
    const pages = ['home', 'about', 'projects', 'skills', 'experience', 'contact'];
    if (pages.includes(page)) {
      navigateTo(page);
      termPrint(`Navigated to ${page}`, 'term-system');
    } else {
      termPrint(`Unknown page: ${page}. Available: ${pages.join(', ')}`, 'term-error');
    }
  } else if (cmd === 'theme') {
    const themeItem = document.querySelector(`[data-theme="${args}"]`);
    if (themeItem) {
      themeItem.click();
      termPrint(`Theme changed to ${args}`, 'term-system');
    } else {
      termPrint(`Unknown theme. Available: default, rose-pine, tokyo-night, catppuccin, nord, gruvbox`, 'term-error');
    }
  } else if (termCommands[cmd]) {
    termCommands[cmd]();
  } else {
    termPrint(`command not found: ${cmd}. Type <span style="color:var(--yellow)">help</span> for available commands.`, 'term-error');
  }

  termPrint('');
}

termInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleTerminalCommand(termInput.value);
    termInput.value = '';
  }
});

// Ctrl+` keyboard shortcut for terminal
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === '`') {
    e.preventDefault();
    toggleTerminal();
  }
  // F11 for fullscreen
  if (e.key === 'F11') {
    e.preventDefault();
    toggleFullscreen();
  }
});

// Terminal resize drag
const termResize = document.getElementById('terminal-resize');
if (termResize) {
  let isResizing = false;
  let startY, startHeight;

  termResize.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = termPanel.getBoundingClientRect().height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const delta = startY - e.clientY;
    const newHeight = Math.max(100, Math.min(startHeight + delta, window.innerHeight * 0.6));
    appGrid.style.gridTemplateRows = `30px 28px 36px 1fr ${newHeight}px 22px`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// Click terminal body to focus input
termBody?.addEventListener('click', () => {
  termInput?.focus();
});

// ── Glow Cursor ──
const glowCursor = document.getElementById('glow-cursor');
document.addEventListener('mousemove', (e) => {
  if (glowCursor) {
    glowCursor.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
  }
});

// ── Command Palette Logic ──
const cmdPalette = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdList = document.getElementById('cmd-list');
const titlebarSearch = document.getElementById('titlebar-search');

function toggleCommandPalette(forceState) {
  const isActive = cmdPalette.classList.contains('active');
  const newState = forceState !== undefined ? forceState : !isActive;
  
  if (newState) {
    cmdPalette.classList.add('active');
    cmdInput.value = '';
    filterCommands('');
    cmdInput.focus();
    settingsOverlay.classList.remove('active');
  } else {
    cmdPalette.classList.remove('active');
  }
}

titlebarSearch?.addEventListener('click', () => toggleCommandPalette(true));
document.getElementById('settings-cmd-palette')?.addEventListener('click', () => toggleCommandPalette(true));
document.getElementById('ab-search')?.addEventListener('click', () => toggleCommandPalette(true));

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    toggleCommandPalette(true);
  }
  if (e.key === 'Escape' && cmdPalette.classList.contains('active')) {
    toggleCommandPalette(false);
  }
});

cmdPalette?.addEventListener('click', (e) => {
  if (e.target === cmdPalette) toggleCommandPalette(false);
});

let cmdSelectedIndex = 0;
cmdInput?.addEventListener('keydown', (e) => {
  // Get all visible items that are selectable (.cmd-item)
  const items = Array.from(cmdList.querySelectorAll('.cmd-item')).filter(item => item.style.display !== 'none');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    cmdSelectedIndex = (cmdSelectedIndex + 1) % items.length;
    updateCmdSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    cmdSelectedIndex = (cmdSelectedIndex - 1 + items.length) % items.length;
    updateCmdSelection(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (items[cmdSelectedIndex]) items[cmdSelectedIndex].click();
  }
});

function updateCmdSelection(items) {
  cmdList.querySelectorAll('.cmd-item').forEach(item => item.classList.remove('active'));
  if (items[cmdSelectedIndex]) {
    items[cmdSelectedIndex].classList.add('active');
    items[cmdSelectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

cmdInput?.addEventListener('input', (e) => {
  filterCommands(e.target.value.toLowerCase());
});

function filterCommands(query) {
  const items = cmdList.querySelectorAll('.cmd-item');
  let firstVisible = -1;
  let count = 0;

  items.forEach(item => {
    const label = item.querySelector('.cmd-label').textContent.toLowerCase();
    if (label.includes(query) || query === '') {
      item.style.display = 'flex';
      if (firstVisible === -1) firstVisible = count;
      count++;
    } else {
      item.style.display = 'none';
    }
  });

  // Also toggle category headers visibility if all items below it are hidden
  const allNodes = Array.from(cmdList.children);
  for (let i = 0; i < allNodes.length; i++) {
    if (allNodes[i].classList.contains('cmd-category')) {
      let hasVisibleItem = false;
      for (let j = i + 1; j < allNodes.length; j++) {
        if (allNodes[j].classList.contains('cmd-category')) break;
        if (allNodes[j].style.display !== 'none') {
          hasVisibleItem = true; break;
        }
      }
      allNodes[i].style.display = hasVisibleItem ? 'block' : 'none';
    }
  }

  cmdSelectedIndex = 0;
  const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
  updateCmdSelection(visibleItems);
}

cmdList?.querySelectorAll('.cmd-item').forEach(item => {
  item.addEventListener('click', () => {
    toggleCommandPalette(false);
    if (item.dataset.page) {
      navigateTo(item.dataset.page);
    } else if (item.dataset.action === 'chat') {
      toggleChat();
    } else if (item.dataset.action === 'resume') {
      window.open('Dhruv_Jain_Resume.html', '_blank');
    } else if (item.dataset.action === 'readme') {
      navigateTo('about'); // Just navigate to about as placeholder
    }
  });
});

document.getElementById('ab-download')?.addEventListener('click', () => {
  window.open('Dhruv_Jain_Resume.html', '_blank');
});

document.getElementById('settings-download-resume')?.addEventListener('click', () => {
  window.open('Dhruv_Jain_Resume.html', '_blank');
});

// ── Typing Effect ──
const typingText = document.getElementById('typing-text');
const roles = ["Cybersecurity Researcher", "Ethical Hacking Enthusiast", "Digital Forensic Investigator"];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!typingText) return;
  const currentRole = roles[roleIndex];
  
  if (isDeleting) {
    typingText.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingText.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentRole.length) {
    typeSpeed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    typeSpeed = 500; // Pause before new word
  }

  setTimeout(typeEffect, typeSpeed);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  // Load saved theme
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme && savedTheme !== 'default') {
    document.body.classList.add('theme-' + savedTheme);
    document.querySelectorAll('[data-theme]').forEach(i => {
      i.classList.toggle('active', i.dataset.theme === savedTheme);
    });
  }

  // Trigger home page reveals
  setTimeout(() => {
    document.querySelectorAll('#page-home .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 120);
    });
  }, 100);

  // Animate home counters
  setTimeout(() => animateCounters(), 500);

  // Start typing effect
  setTimeout(typeEffect, 500);

  // Observe all reveals
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

// ── Mobile Sidebar Drawer ──
const mobileHamburger = document.getElementById('mobile-hamburger');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

function openMobileSidebar() {
  sidebar?.classList.add('mobile-open');
  mobileOverlay?.classList.add('active');
}

function closeMobileSidebar() {
  sidebar?.classList.remove('mobile-open');
  mobileOverlay?.classList.remove('active');
}

mobileHamburger?.addEventListener('click', openMobileSidebar);
mobileOverlay?.addEventListener('click', closeMobileSidebar);

// Close sidebar when a file is clicked on mobile
document.querySelectorAll('.sidebar .file-item').forEach(item => {
  item.addEventListener('click', () => {
    closeMobileSidebar();
  });
});
