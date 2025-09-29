# TLS/SSL Security Explained

Interactive step-by-step visualizations explaining TLS/SSL security concepts through animations. Learn how secure connections work, understand MITM attacks, certificate pinning, and the differences between TLS 1.2 and TLS 1.3 protocols.

## 🎯 Live Demo

View the animations at: [https://stefan-nitu.github.io/ssl/](https://stefan-nitu.github.io/ssl/)

## 📚 What You'll Learn

### Core Concepts (Simplified)
1. **How Secure Connections Work** - Basic TLS handshake explained visually
2. **Man-in-the-Middle Attacks** - See how attackers intercept connections
3. **Certificate Pinning** - Learn how apps defend against MITM attacks

### Advanced Protocol Details
4. **TLS 1.3 Handshake** - Modern 1-RTT handshake with forward secrecy
5. **TLS 1.2 Handshake** - Classic 2-RTT handshake process

## 🏗️ Architecture

```
ssl/
├── index.html                      # Main page with all animations
├── styles.css                      # Base visual styles
├── mobile-responsive.css           # Mobile device adaptations
├── preview.png                     # Social media preview image
│
├── shared.js                       # Utility functions & helpers
├── declarative-animation.js        # Core animation framework
│
└── Animation implementations (declarative):
    ├── tls-simplified-declarative.js       # Basic TLS explanation
    ├── mitm-declarative.js                 # MITM attack demo
    ├── pinning-declarative.js              # Certificate pinning
    ├── tls13-handshake-declarative.js      # TLS 1.3 protocol
    └── tls12-handshake-declarative.js      # TLS 1.2 protocol
```

## 🚀 Getting Started

Simply open [index.html](index.html) in a modern web browser. No build process or dependencies required.

**Note:** Designed for desktop viewing. Mobile users will see a recommendation to view on desktop for the best experience.

## 🎨 Animation System

The declarative animation framework (`declarative-animation.js`) provides:

- **Step-by-step control**: Play, pause, step through, and reset animations
- **Visual feedback**: Status indicators, entity states, and message flows
- **Reusable components**: Packets, detail boxes, certificates, and key displays
- **Responsive design**: Adapts to different screen sizes

### Key Components

Each animation extends the base `DeclarativeAnimation` class and defines:
- **Steps**: Discrete animation phases with descriptions
- **Actions**: Visual operations (show/hide elements, move packets, display details)
- **State management**: Clean resets and proper cleanup

## 📱 Responsive Design

- Desktop: Full interactive experience with all animations
- Mobile: Notice recommending desktop viewing (dismissible)
- Adaptive layouts for smaller screens