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

// ── Contact Form ──
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = '✓ Message Sent!';
  btn.style.background = '#4ec9b0';
  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    e.target.reset();
  }, 2500);
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

chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim()) {
    const text = chatInput.value.trim();
    addMessage(text, 'user');
    chatInput.value = '';

    // Simulated Bot Response
    setTimeout(() => {
      let response = "That's interesting! I'm here to help you showcase your skills and projects. 🚀";
      if (text.toLowerCase().includes('projects')) response = "Dhruv has some great projects like PhishGuard Pro and CyberShield IQ! You can check them out in the Projects tab.";
      if (text.toLowerCase().includes('skills')) response = "He is proficient in React, Node.js, and Java. Check the Skills tab for the full list!";
      if (text.toLowerCase().includes('theme')) response = "You can change the look of the portfolio using the settings icon in the bottom left corner!";
      
      addMessage(response, 'bot');
    }, 800);
  }
});

function addMessage(text, side) {
  const msg = document.createElement('div');
  msg.className = `msg ${side}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Fullscreen Toggle ──
document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
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
      alert("Resume download triggered (placeholder)");
    } else if (item.dataset.action === 'readme') {
      navigateTo('about'); // Just navigate to about as placeholder
    }
  });
});

document.getElementById('ab-download')?.addEventListener('click', () => {
  alert("Resume download triggered (placeholder)");
});

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

  // Observe all reveals
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
