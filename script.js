/**
 * ============================================================================
 * AeroDrop - Client-Side P2P File Sharing Engine
 * Authors: Mukul Kumar & Bhawna Sharma
 * Tech: WebRTC Data Channel Simulation, DOM APIs, Web Audio, Defensive Security
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. DOM SELECTORS
// ----------------------------------------------------------------------------
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfoBox = document.getElementById('fileInfoBox');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileTypeBadge = document.getElementById('fileTypeBadge');
const clearFileBtn = document.getElementById('clearFileBtn');
const securityAlertBox = document.getElementById('securityAlertBox');
const securityAlertMsg = document.getElementById('securityAlertMsg');
const closeSecurityAlertBtn = document.getElementById('closeSecurityAlertBtn');

const sendBtn = document.getElementById('sendBtn');
const targetPeerName = document.getElementById('targetPeerName');
const progressContainer = document.getElementById('progressContainer');
const progressBarFill = document.getElementById('progressBarFill');
const progressPercent = document.getElementById('progressPercent');
const transferStatus = document.getElementById('transferStatus');
const streamSpeed = document.getElementById('streamSpeed');
const streamEta = document.getElementById('streamEta');

const scanBtn = document.getElementById('scanBtn');
const radarSweep = document.getElementById('radarSweep');
const scanStatusBadge = document.getElementById('scanStatusBadge');
const peersList = document.getElementById('peersList');

const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyRoomBtn = document.getElementById('copyRoomBtn');
const copyRoomText = document.getElementById('copyRoomText');
const newRoomBtn = document.getElementById('newRoomBtn');

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');

const contactForm = document.getElementById('contactForm');
const submitFormBtn = document.getElementById('submitFormBtn');
const formSuccessMessage = document.getElementById('formSuccessMessage');
const toastContainer = document.getElementById('toastContainer');

// ----------------------------------------------------------------------------
// 2. STATE MANAGEMENT
// ----------------------------------------------------------------------------
let selectedFile = null;
let selectedPeer = null;
let transferInterval = null;
let isTransferring = false;
let isScanning = false;
let soundEnabled = true;
let currentRoomCode = generateRoomCode();
let formCooldownTimer = null;

// Blocked dangerous extensions (Security Guard Protocol)
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi', 
  '.scr', '.pif', '.com', '.jar', '.apk', '.php', '.app'
];

// Mock Peers Mesh Nodes
const MOCK_PEERS = [
  { id: 'peer-1', name: "Mukul's MacBook Pro", type: "laptop", ping: "12ms", net: "Local Wi-Fi 5GHz", icon: "💻", status: "Ready" },
  { id: 'peer-2', name: "Bhawna's iPhone 15", type: "mobile", ping: "22ms", net: "Local Wi-Fi 5GHz", icon: "📱", status: "Online" },
  { id: 'peer-3', name: "College Lab PC #04", type: "desktop", ping: "45ms", net: "Ethernet 1Gbps", icon: "🖥️", status: "Ready" }
];

// ----------------------------------------------------------------------------
// 3. INITIALIZATION & SECURITY SETUP
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initRoom();
  setupGlobalDragProtection();
  setupAudioPreference();
});

// Prevent accidental window drops from opening files and navigating away
function setupGlobalDragProtection() {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    window.addEventListener(eventName, (e) => {
      if (e.target !== fileInput) {
        e.preventDefault();
      }
    }, false);
  });
}

// Room Session Code generator
function generateRoomCode() {
  const hash = Math.floor(1000 + Math.random() * 9000);
  return `#AERO-${hash}`;
}

function initRoom() {
  if (window.location.hash && window.location.hash.startsWith('#room=')) {
    const raw = window.location.hash.replace('#room=', '').trim();
    if (/^[A-Za-z0-9_-]{3,12}$/.test(raw)) {
      currentRoomCode = '#' + raw.toUpperCase();
    }
  }
  roomCodeDisplay.textContent = currentRoomCode;
}

newRoomBtn.addEventListener('click', () => {
  currentRoomCode = generateRoomCode();
  roomCodeDisplay.textContent = currentRoomCode;
  window.location.hash = `room=${currentRoomCode.replace('#', '')}`;
  playAudioCue('click');
  showToast(`Generated new mesh session: ${currentRoomCode}`, 'info');
});

copyRoomBtn.addEventListener('click', async () => {
  const joinUrl = `${window.location.origin}${window.location.pathname}#room=${currentRoomCode.replace('#', '')}`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(joinUrl);
    } else {
      // Fallback for older environments
      const tempInput = document.createElement('input');
      tempInput.value = joinUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }
    copyRoomText.textContent = 'Copied!';
    playAudioCue('click');
    showToast('Room invite link copied to clipboard!', 'success');
    setTimeout(() => {
      copyRoomText.textContent = 'Copy Link';
    }, 2000);
  } catch (err) {
    showToast('Failed to copy room link automatically.', 'danger');
  }
});

// ----------------------------------------------------------------------------
// 4. WEB AUDIO SOUND ENGINE (Zero External Files)
// ----------------------------------------------------------------------------
function setupAudioPreference() {
  const saved = localStorage.getItem('aerodrop_sound');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
  updateSoundUI();
}

soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('aerodrop_sound', soundEnabled);
  updateSoundUI();
  if (soundEnabled) playAudioCue('click');
});

function updateSoundUI() {
  soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  soundToggleBtn.title = soundEnabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)';
}

function playAudioCue(type) {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

// ----------------------------------------------------------------------------
// 5. SECURE FILE VALIDATION & SELECTION
// ----------------------------------------------------------------------------
dropZone.addEventListener('click', () => {
  fileInput.click();
});

dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    validateAndProcessFile(e.target.files[0]);
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    validateAndProcessFile(e.dataTransfer.files[0]);
  }
});

// File Security Inspection & Processing
function validateAndProcessFile(file) {
  hideSecurityAlert();

  // 1. Security Check: Empty Files
  if (file.size === 0) {
    showSecurityAlert('Selected file is empty (0 bytes). Please choose a valid file.');
    playAudioCue('alert');
    resetFileState();
    return;
  }

  // 2. Security Check: Blocked Malicious Executable Extensions
  const lowerName = file.name.toLowerCase();
  const isDangerous = DANGEROUS_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  if (isDangerous) {
    showSecurityAlert(
      `Blocked file "${file.name}". Executable binaries and shell scripts are rejected by AeroDrop sandbox to protect peer nodes from malware.`
    );
    playAudioCue('alert');
    resetFileState();
    return;
  }

  // 3. Security Check: Huge File Warning (Buffer cap simulation)
  if (file.size > 2 * 1024 * 1024 * 1024) {
    showSecurityAlert('File size exceeds simulated buffer threshold (2 GB).');
    playAudioCue('alert');
    resetFileState();
    return;
  }

  // Clean File Accepted
  selectedFile = file;
  playAudioCue('click');

  // Format file size
  const sizeInKB = file.size / 1024;
  if (sizeInKB > 1024) {
    fileSize.textContent = (sizeInKB / 1024).toFixed(2) + ' MB';
  } else {
    fileSize.textContent = sizeInKB.toFixed(1) + ' KB';
  }

  // Display name safely via textContent (Zero DOM XSS)
  fileName.textContent = file.name;

  // Derive human readable file tag
  const ext = file.name.split('.').pop().toUpperCase();
  fileTypeBadge.textContent = ext ? `${ext} File` : 'Binary Stream';

  // UI state transitions
  fileInfoBox.style.display = 'flex';
  updateSendButtonState();

  // Reset progress bar from any prior runs
  progressContainer.style.display = 'none';
  progressBarFill.style.width = '0%';
  progressPercent.textContent = '0%';
}

function showSecurityAlert(msg) {
  securityAlertMsg.textContent = msg;
  securityAlertBox.style.display = 'flex';
}

function hideSecurityAlert() {
  securityAlertBox.style.display = 'none';
}

closeSecurityAlertBtn.addEventListener('click', hideSecurityAlert);

clearFileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  resetFileState();
  playAudioCue('click');
});

function resetFileState() {
  selectedFile = null;
  fileInput.value = '';
  fileInfoBox.style.display = 'none';
  progressContainer.style.display = 'none';
  progressBarFill.style.width = '0%';
  
  if (transferInterval) {
    clearInterval(transferInterval);
    transferInterval = null;
  }
  isTransferring = false;
  updateSendButtonState();
}

function updateSendButtonState() {
  if (isTransferring) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Streaming packets...';
    sendBtn.style.backgroundColor = '';
    return;
  }

  if (!selectedFile) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Select a file first';
    sendBtn.style.backgroundColor = '';
  } else {
    sendBtn.disabled = false;
    const targetLabel = selectedPeer ? selectedPeer.name : 'All Mesh Peers';
    sendBtn.textContent = `🚀 Send to ${targetLabel}`;
    sendBtn.style.backgroundColor = '';
  }
}

// ----------------------------------------------------------------------------
// 6. STREAMING ENGINE SIMULATION (Backpressure & Flow Control)
// ----------------------------------------------------------------------------
sendBtn.addEventListener('click', () => {
  if (!selectedFile || isTransferring) return;

  isTransferring = true;
  updateSendButtonState();
  progressContainer.style.display = 'block';
  playAudioCue('click');

  const targetLabel = selectedPeer ? selectedPeer.name : 'All Mesh Peers';
  transferStatus.textContent = `Piping 64KB chunks to ${targetLabel}...`;

  let currentPercent = 0;
  const chunkSpeedMB = (40 + Math.random() * 25).toFixed(1);
  streamSpeed.textContent = `Speed: ${chunkSpeedMB} MB/s`;

  if (transferInterval) clearInterval(transferInterval);

  transferInterval = setInterval(() => {
    currentPercent += 2;

    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(transferInterval);
      transferInterval = null;
      isTransferring = false;

      progressBarFill.style.width = '100%';
      progressPercent.textContent = '100%';
      streamEta.textContent = 'ETA: 0s';
      transferStatus.textContent = `Transfer Complete! Direct packet handshake acknowledged. 🎉`;

      sendBtn.disabled = false;
      sendBtn.textContent = '✅ Transfer Complete!';
      sendBtn.style.backgroundColor = '#10b981';
      
      playAudioCue('success');
      showToast(`File successfully delivered to ${targetLabel}!`, 'success');

      setTimeout(() => {
        updateSendButtonState();
      }, 3500);

    } else {
      progressBarFill.style.width = `${currentPercent}%`;
      progressPercent.textContent = `${currentPercent}%`;
      const remainingSeconds = Math.max(0, ((100 - currentPercent) * 0.05).toFixed(1));
      streamEta.textContent = `ETA: ${remainingSeconds}s`;
    }
  }, 35);
});

// ----------------------------------------------------------------------------
// 7. RADAR SCANNER & PEER NODE SELECTION
// ----------------------------------------------------------------------------
scanBtn.addEventListener('click', () => {
  if (isScanning) return;
  isScanning = true;

  playAudioCue('click');
  radarSweep.style.display = 'block';
  scanStatusBadge.textContent = '📡 Scanning Mesh...';
  scanBtn.disabled = true;
  scanBtn.textContent = '🔍 Probing Local Subnet...';
  
  // Clear peer list safely
  peersList.innerHTML = '';
  const loadingP = document.createElement('p');
  loadingP.className = 'no-peers';
  loadingP.textContent = 'Querying WebRTC signaling broker...';
  peersList.appendChild(loadingP);

  // Simulated peer discovery network latency
  setTimeout(() => {
    radarSweep.style.display = 'none';
    scanStatusBadge.textContent = `${MOCK_PEERS.length} Nodes Discovered`;
    scanBtn.disabled = false;
    scanBtn.textContent = '🔄 Re-scan Network';
    isScanning = false;

    renderPeerNodes();
    playAudioCue('success');
    showToast(`Found ${MOCK_PEERS.length} active peer nodes on room ${currentRoomCode}`, 'info');
  }, 1400);
});

// Safe DOM element generation (Zero innerHTML vulnerability)
function renderPeerNodes() {
  peersList.innerHTML = '';

  MOCK_PEERS.forEach((peer) => {
    const item = document.createElement('div');
    item.className = 'peer-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Select peer ${peer.name}`);

    if (selectedPeer && selectedPeer.id === peer.id) {
      item.classList.add('selected');
    }

    // Left info block
    const leftDiv = document.createElement('div');
    leftDiv.className = 'peer-left';

    const avatar = document.createElement('span');
    avatar.className = 'peer-avatar';
    avatar.textContent = peer.icon;

    const textGroup = document.createElement('div');
    const nameSpan = document.createElement('div');
    nameSpan.className = 'peer-name-text';
    nameSpan.textContent = peer.name;

    const subInfo = document.createElement('div');
    subInfo.className = 'peer-sub';
    subInfo.textContent = `${peer.ping} • ${peer.net}`;

    textGroup.appendChild(nameSpan);
    textGroup.appendChild(subInfo);
    leftDiv.appendChild(avatar);
    leftDiv.appendChild(textGroup);

    // Right badge block
    const rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.alignItems = 'center';
    rightDiv.style.gap = '8px';

    const badge = document.createElement('span');
    badge.className = 'peer-badge';
    badge.textContent = peer.status;

    const check = document.createElement('span');
    check.className = 'peer-check';
    check.textContent = '✓';

    rightDiv.appendChild(badge);
    rightDiv.appendChild(check);

    item.appendChild(leftDiv);
    item.appendChild(rightDiv);

    // Interaction handler
    const selectHandler = () => {
      if (selectedPeer && selectedPeer.id === peer.id) {
        // Deselect if already selected (switch back to Broadcast)
        selectedPeer = null;
        targetPeerName.textContent = 'Broadcast to Room (All Peers)';
        item.classList.remove('selected');
        showToast('Switched to Room Broadcast mode', 'info');
      } else {
        selectedPeer = peer;
        document.querySelectorAll('.peer-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        targetPeerName.textContent = `Direct to ${peer.name} (${peer.ping})`;
        showToast(`Target recipient set to: ${peer.name}`, 'info');
      }
      playAudioCue('click');
      updateSendButtonState();
    };

    item.addEventListener('click', selectHandler);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectHandler();
      }
    });

    peersList.appendChild(item);
  });
}

// ----------------------------------------------------------------------------
// 8. MOBILE HAMBURGER MENU & KEYBOARD NAVIGATION
// ----------------------------------------------------------------------------
hamburgerBtn.addEventListener('click', () => {
  const isExpanded = hamburgerBtn.classList.toggle('active');
  mobileNav.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', isExpanded);
  mobileNav.setAttribute('aria-hidden', !isExpanded);
  playAudioCue('click');
});

// Close mobile drawer when clicking any mobile link
document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburgerBtn.classList.remove('active');
    mobileNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  });
});

// Global Escape Key to close drawers & alerts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (mobileNav.classList.contains('open')) {
      hamburgerBtn.classList.remove('active');
      mobileNav.classList.remove('open');
    }
    hideSecurityAlert();
  }
});

// ----------------------------------------------------------------------------
// 9. CONTACT FORM VALIDATION & ANTI-SPAM PROTECTION
// ----------------------------------------------------------------------------
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (formCooldownTimer) {
    showToast('Please wait a few seconds before submitting again.', 'danger');
    return;
  }

  const nameInput = document.getElementById('userName');
  const emailInput = document.getElementById('userEmail');
  const msgInput = document.getElementById('userMessage');

  const nameErr = document.getElementById('nameError');
  const emailErr = document.getElementById('emailError');
  const msgErr = document.getElementById('msgError');

  // Clear previous errors
  nameErr.textContent = '';
  emailErr.textContent = '';
  msgErr.textContent = '';
  nameInput.classList.remove('invalid');
  emailInput.classList.remove('invalid');
  msgInput.classList.remove('invalid');

  let isValid = true;
  const nameVal = nameInput.value.trim();
  const emailVal = emailInput.value.trim();
  const msgVal = msgInput.value.trim();

  // Name check
  if (nameVal.length < 2) {
    nameErr.textContent = 'Please enter your full name (at least 2 characters).';
    nameInput.classList.add('invalid');
    isValid = false;
  }

  // Strict email format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailVal)) {
    emailErr.textContent = 'Please provide a valid email address.';
    emailInput.classList.add('invalid');
    isValid = false;
  }

  // Message check
  if (msgVal.length < 10) {
    msgErr.textContent = 'Please enter a message of at least 10 characters.';
    msgInput.classList.add('invalid');
    isValid = false;
  }

  if (!isValid) {
    playAudioCue('alert');
    return;
  }

  // Form passed validation
  formSuccessMessage.style.display = 'block';
  playAudioCue('success');
  contactForm.reset();

  // Enforce 5-second anti-spam rate limit
  submitFormBtn.disabled = true;
  let cooldown = 5;
  submitFormBtn.textContent = `Wait ${cooldown}s`;

  formCooldownTimer = setInterval(() => {
    cooldown--;
    if (cooldown <= 0) {
      clearInterval(formCooldownTimer);
      formCooldownTimer = null;
      submitFormBtn.disabled = false;
      submitFormBtn.textContent = 'Send Message';
    } else {
      submitFormBtn.textContent = `Wait ${cooldown}s`;
    }
  }, 1000);

  setTimeout(() => {
    formSuccessMessage.style.display = 'none';
  }, 4500);
});

// ----------------------------------------------------------------------------
// 10. TOAST NOTIFICATION UTILITY
// ----------------------------------------------------------------------------
function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSpan = document.createElement('span');
  iconSpan.textContent = type === 'success' ? '✅' : type === 'danger' ? '⚠️' : '⚡';

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
