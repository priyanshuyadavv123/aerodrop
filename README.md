# ⚡ AeroDrop - Serverless P2P Web File Sharing

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/Vanilla_JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebRTC](https://img.shields.io/badge/WebRTC-Architecture-333333?style=flat&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **AeroDrop** is a client-side peer-to-peer (P2P) file sharing interface designed to transfer documents, media, and folders directly browser-to-browser without intermediate cloud storage.

---

## 👥 Project Team
* **Mukul Kumar**
* **Bhawna Sharma**
* **Institution:** B.Tech Computer Science & Engineering | Web Development Academic Project

---

## 🌟 Key Features

1. **⚡ Line-Rate Direct Speed**  
   Files transfer directly across local Wi-Fi / LAN data channels via WebRTC data channel flow control principles.
2. **🛡️ Client-Side Security Guard**  
   Intercepts and blocks dangerous executable binaries (`.exe`, `.bat`, `.cmd`, `.sh`, `.vbs`, `.msi`) before they enter browser buffers.
3. **📡 Radar Peer Discovery Visualizer**  
   Pure CSS concentric circles with dynamic rotating radial sweep discovering active local network nodes.
4. **🎯 Interactive Peer Selection**  
   Click on any discovered device to establish point-to-point addressing instead of broadcasting to everyone.
5. **🔗 Swarm Room Codes**  
   Shareable session links (`#AERO-XXXX`) with native Clipboard API integration.
6. **🔊 Native Web Audio FX**  
   Microsecond-precise UI audio feedback using the browser's native `AudioContext` with zero external audio assets.
7. **📱 100% Responsive Architecture**  
   Includes a mobile hamburger menu drawer, responsive CSS Grid cards, and touch swipe gesture support.

---

## 📂 Project Structure

```text
├── index.html            # Main semantic HTML5 interface
├── style.css             # Modular CSS3 styling, design tokens & animations
├── script.js             # Event listeners, File API, AudioContext & DOM security
├── presentation.html     # Interactive 16:9 full-screen slide deck
├── Rehearsal_Player.html # Audio teleprompter rehearsal console
├── netlify.toml          # Netlify security headers and deployment configuration
└── README_VIVA_GUIDE.md  # Viva defense preparation guide
```

---

## 🚀 Quick Start / Local Setup

Clone the repository and open in any modern browser:

```bash
# Clone repository
git clone https://github.com/priyanshuyadavv123/aerodrop.git

# Navigate into project directory
cd aerodrop

# Open in browser directly or with any local server
npx serve .
# or
python3 -m http.server 8080
```

---

## 🔒 Security Hardening

* **Content Security Policy (CSP):** Restricts script execution to local origins and whitelisted Google Font CDNs.
* **Zero DOM XSS:** Avoids `innerHTML` string interpolation; uses strictly typed `textContent` node bindings.
* **Window Drag Trapping:** Global event suppression prevents accidental browser navigations on missed drops.
* **Anti-Spam Rate Limiting:** 5-second submission cooldown with regex-validated inputs.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
