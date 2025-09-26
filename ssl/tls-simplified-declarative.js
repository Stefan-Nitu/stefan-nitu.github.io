class TLSSimplifiedAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('tls-simple-stage');
        const status = document.getElementById('tls-simple-status');
        super(stage, status);

        this.clientEl = stage.querySelector('.client');
        this.serverEl = stage.querySelector('.server');
        this.caEl = stage.querySelector('.ca');
        this.serverKeys = document.getElementById('simple-server-keys');
        this.clientCertDisplay = document.getElementById('simple-client-cert');

        this.setupButtons();
        this.defineAnimationSteps();
    }

    setupButtons() {
        this.playBtn = document.getElementById('tls-simple-play');
        this.stepBtn = document.getElementById('tls-simple-step');
        this.resetBtn = document.getElementById('tls-simple-reset');

        if (this.playBtn) this.playBtn.addEventListener('click', () => this.handlePlay());
        if (this.stepBtn) this.stepBtn.addEventListener('click', () => this.handleStep());
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.handleReset());
    }

    async handlePlay() {
        this.playBtn.disabled = true;
        this.stepBtn.disabled = true;
        await this.play();
        // Only re-enable buttons if not stopped by reset
        if (!this.shouldStop) {
            this.playBtn.disabled = false;
            this.stepBtn.disabled = false;
        }
    }

    async handleStep() {
        this.stepBtn.disabled = true;
        await this.step();

        if (this.currentStep >= this.steps.length) {
            this.stepBtn.textContent = '✅ Complete';
        } else {
            this.stepBtn.disabled = false;
            this.stepBtn.textContent = '⏭️ Next Step';
        }
    }

    handleReset() {
        // Clear any active timeouts
        if (this.activeTimeouts) {
            this.activeTimeouts.forEach(id => clearTimeout(id));
            this.activeTimeouts = [];
        }

        // Clear any client animations immediately
        if (this.clientEl) {
            this.clientEl.style.animation = '';
            this.clientEl.style.boxShadow = '';
        }

        this.reset();
        if (this.serverKeys) this.serverKeys.style.display = 'none';
        if (this.clientCertDisplay) this.clientCertDisplay.style.display = 'none';

        this.playBtn.disabled = false;
        this.stepBtn.disabled = false;
        this.stepBtn.textContent = '⏭️ Next Step';
        this.statusEl.textContent = 'Click Play to watch the SSL handshake process';
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>SETUP: CERTIFICATE PAIRS</strong> - Server has a PUBLIC certificate + PRIVATE key pair',
                create: async (anim) => {
                    if (this.serverKeys) this.serverKeys.style.display = 'block';

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">🔑 Key Pair Concept:</strong><br>
                        <br>
                        <span style="color: #00ff00">PUBLIC Certificate:</span><br>
                        • Can be shared with everyone<br>
                        • Contains public key<br>
                        • Used to encrypt TO server<br>
                        <br>
                        <span style="color: #ff00ff">PRIVATE Key:</span><br>
                        • NEVER shared, kept secret!<br>
                        • Used to decrypt messages<br>
                        • Only server has this
                    `, {
                        key: 'pairExplain',
                        style: {
                            border: '2px solid #00ff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '50px', top: '420px' }
                    });
                },
                show: ['pairExplain'],
                persist: []
            },
            {
                status: '<strong>CLIENT HELLO</strong> - Client lists which encryption algorithms it supports',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">📱 Client Hello Contains:</strong><br>
                        • TLS Version: 1.3<br>
                        • Random: 7B3F2A9E... (32 bytes)<br>
                        • Cipher Suites:<br>
                        &nbsp;&nbsp;- TLS_AES_256_GCM_SHA384<br>
                        &nbsp;&nbsp;- TLS_AES_128_GCM_SHA256<br>
                        &nbsp;&nbsp;- TLS_CHACHA20_POLY1305<br>
                        • Server Name: example.com
                    `, {
                        key: 'clientHello',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50px', top: '420px' }
                    });

                    const packet = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'CLIENT HELLO →',
                        'packet-plain',
                        { key: 'helloPacket', duration: 1500 }
                    );
                    packet.innerHTML = 'CLIENT HELLO → <span style="font-size: 0.8em">📥</span>';
                    packet.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
                },
                show: ['clientHello', 'helloPacket'],
                hide: ['pairExplain'],
                persist: []
            },
            {
                status: '<strong>SERVER SENDS PUBLIC CERTIFICATE</strong> - Keeps private key SECRET!',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff00">📜 PUBLIC Certificate:</strong><br>
                        • Domain: example.com<br>
                        • Issuer: DigiCert CA<br>
                        • Valid: 2024-2026<br>
                        • Contains PUBLIC KEY: RSA-2048<br>
                        • Fingerprint: SHA256:AAAA1234...<br>
                        <br>
                        <strong style="color: #ff00ff">🔒 Private Key:</strong><br>
                        STAYS ON SERVER - Never sent!
                    `, {
                        key: 'certDetail',
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '2px solid #00ff00'
                        },
                        position: { right: '50px', top: '420px' }
                    });

                    await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← PUBLIC CERT',
                        'packet-cert',
                        { key: 'certPacket', duration: 1500 }
                    );

                    if (this.clientCertDisplay) {
                        this.clientCertDisplay.style.display = 'block';
                    }
                },
                show: ['certDetail', 'certPacket'],
                hide: ['clientHello', 'helloPacket'],
                persist: []
            },
            {
                status: '<strong>iOS VALIDATES CERTIFICATE INTERNALLY</strong> - iOS checks certificate against built-in trusted CAs',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">📱 iOS Internal Validation:</strong><br>
                        <br>
                        1. iOS receives PUBLIC certificate<br>
                        2. Checks signature with built-in CAs<br>
                        3. iOS has trusted root CAs installed<br>
                        4. Validates: DigiCert → Trusted ✓<br>
                        <br>
                        <span style="color: #00ff88">All happens INSIDE the device!</span>
                    `, {
                        key: 'iosValidation',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50px', top: '420px' }
                    });

                    const line = await this.drawConnection(
                        this.clientEl,
                        this.caEl,
                        'secure-line',
                        { style: { borderStyle: 'dashed', opacity: '0.5' } }
                    );
                    anim.registerElement('internalLine', line);

                    // Position checkmark between client and CA
                    const clientRect = this.clientEl.getBoundingClientRect();
                    const caRect = this.caEl.getBoundingClientRect();
                    const stageRect = this.stage.getBoundingClientRect();

                    const checkmark = document.createElement('div');
                    checkmark.className = 'animation-element';
                    checkmark.style.cssText = `
                        position: absolute;
                        font-size: 48px;
                        left: ${(clientRect.left - stageRect.left + clientRect.width/2 - 24)}px;
                        top: ${(clientRect.top - stageRect.top - 60)}px;
                        z-index: 100;
                        animation: fadeIn 0.5s ease-in;
                    `;
                    checkmark.textContent = '✅';
                    this.stage.appendChild(checkmark);
                    anim.registerElement('checkmark', checkmark);

                    this.clientEl.style.animation = 'pulse 1s';
                    this.clientEl.style.boxShadow = '0 0 40px rgba(0,255,255,0.8)';

                    // Store timeout so it can be cleared on reset
                    const timeoutId = setTimeout(() => {
                        if (this.clientEl) {
                            this.clientEl.style.animation = '';
                            this.clientEl.style.boxShadow = '';
                        }
                    }, 1000);

                    // Store timeout ID for cleanup
                    this.activeTimeouts = this.activeTimeouts || [];
                    this.activeTimeouts.push(timeoutId);
                },
                show: ['iosValidation', 'internalLine', 'checkmark'],
                hide: ['certDetail', 'certPacket'],
                persist: []
            },
            {
                status: '<strong>ENCRYPT WITH PUBLIC KEY</strong> - Use public key FROM the certificate',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong>Client uses PUBLIC KEY from cert:</strong><br>
                        Pre-Master Secret: ABC123XYZ<br>
                        <br>
                        <strong>Encrypt with server's PUBLIC key:</strong><br>
                        RSA_Encrypt(ABC123XYZ, PublicKey)<br>
                        ↓<br>
                        Result: x9Y#mK@pL3$...<br>
                        <br>
                        <span style="color: #00ff88">Only server's PRIVATE key can decrypt!</span>
                    `, {
                        key: 'keyDetail',
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '2px solid #00ff88'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    const secret = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        '🔐 Encrypted →',
                        'packet-encrypted',
                        { key: 'secret', duration: 1500 }
                    );

                    await this.sleep(500);

                    // Transform the packet in place
                    secret.style.transition = 'all 0.5s ease';
                    secret.innerHTML = '🔓 Decrypted w/ PRIVATE';
                    secret.className = 'packet packet-plain show';
                    secret.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
                    secret.style.border = '2px solid #00ff88';
                    secret.style.color = '#000';
                    secret.style.transform = 'scale(1.1)';
                    secret.style.minWidth = '180px';

                    const transformTimeout = setTimeout(() => {
                        if (secret) secret.style.transform = 'scale(1)';
                    }, 500);

                    this.activeTimeouts = this.activeTimeouts || [];
                    this.activeTimeouts.push(transformTimeout);

                    await this.sleep(1500);

                    // Fade out after showing transformation
                    secret.style.opacity = '0';
                },
                show: ['keyDetail', 'secret'],
                hide: ['checkmark', 'internalLine', 'iosValidation'],
                persist: []
            },
            {
                status: '✅ SECURE! Both parties now use symmetric AES-256 with session key',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong>Both sides calculate:</strong><br>
                        Pre-Master: ABC123XYZ<br>
                        Client Random: 7B3F2A9E...<br>
                        Server Random: 9E4A1B8C...<br>
                        ↓<br>
                        <strong>Session Key: K7@mX9#...</strong><br>
                        <br>
                        Now using AES-256 (symmetric)
                    `, {
                        key: 'sessionDetail',
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '2px solid #00ff88'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    const line = await this.drawConnection(
                        this.clientEl,
                        this.serverEl,
                        'secure-line'
                    );
                    anim.registerElement('connectionLine', line);
                },
                show: ['sessionDetail', 'connectionLine'],
                hide: ['keyDetail', 'secret'],
                persist: []
            }
        ]);
    }

    async drawConnection(from, to, className, options = {}) {
        const line = createConnectionLine(this.stage, from, to, className);
        if (options.style) Object.assign(line.style, options.style);
        // Line visibility is managed by the declarative system
        line.style.opacity = '1';
        return line;
    }

}