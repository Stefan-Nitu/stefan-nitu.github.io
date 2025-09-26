// SSL Handshake Animation
class SSLHandshakeAnimation extends BaseAnimation {
    constructor() {
        super('ssl-stage', 'ssl-status', 'ssl-play', 'ssl-step', 'ssl-reset');

        this.clientEl = this.stage.querySelector('.client');
        this.serverEl = this.stage.querySelector('.server');
        this.caEl = this.stage.querySelector('.ca');
        this.serverKeys = document.getElementById('server-keys');
        this.clientCertDisplay = document.getElementById('client-cert');

        this.state = new EnhancedAnimationState();
        this.sequence = new AnimationSequence(this.stage, this.state);
        this.certPatterns = new CertificateAnimationPatterns(this.sequence);
    }

    getTotalSteps() {
        return AnimationConfig.steps.ssl.length;
    }

    getInitialStatusText() {
        return 'Click Play to watch the SSL handshake process';
    }

    async executeStep(stepNumber) {
        const stepMethods = [
            () => this.step0_certificatePairConcept(),
            () => this.step1_clientHello(),
            () => this.step2_serverCertificate(),
            () => this.step3_iosValidation(),
            () => this.step4_keyExchange(),
            () => this.step5_sessionKeys()
        ];

        if (stepMethods[stepNumber]) {
            // Check shouldStop before starting
            if (this.state.shouldStop) return;

            await stepMethods[stepNumber]();

            // Check shouldStop after completing
            if (this.state.shouldStop) return;
        }
    }

    async step0_certificatePairConcept() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.ssl[0]}</strong> - Server has a PUBLIC certificate + PRIVATE key pair`;
        this.serverKeys.style.display = 'block';

        const pairExplain = await this.sequence.showDetailBox(`
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
            zone: 'main-right',
            border: '2px solid #ffff00',
            duration: this.state.getDelay('long')
        });
    }

    async step1_clientHello() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.ssl[1]}</strong> - Client lists which encryption algorithms it supports`;

        this.sequence.cleanupStep();

        const helloDetail = await this.sequence.showDetailBox(`
            <strong>Client Hello Contains:</strong><br>
            • TLS Version: 1.3<br>
            • Random: 7B3F2A9E... (32 bytes)<br>
            • Cipher Suites:<br>
            &nbsp;&nbsp;- TLS_AES_256_GCM_SHA384<br>
            &nbsp;&nbsp;- TLS_AES_128_GCM_SHA256<br>
            &nbsp;&nbsp;- TLS_CHACHA20_POLY1305<br>
            • Server Name: example.com
        `, {
            key: 'helloDetail',
            zone: 'main-left',
            duration: this.state.getDelay('animation')
        });

        const hello = await this.sequence.sendPacket(
            this.clientEl,
            this.serverEl,
            'CLIENT HELLO →',
            'packet-plain',
            {
                key: 'hello',
                transform: async (packet) => {
                    packet.innerHTML = 'CLIENT HELLO → <span style="font-size: 0.8em">📥</span>';
                    packet.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
                },
                autoHide: true,
                hideDelay: this.state.getDelay('short')
            }
        );
    }

    async step2_serverCertificate() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.ssl[2]}</strong> - Keeps private key SECRET!`;

        this.sequence.cleanupStep();

        const certDetail = await this.sequence.showDetailBox(`
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
            zone: 'main-right',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #00ff00',
            duration: this.state.getDelay('animation')
        });

        await this.sequence.sendPacket(
            this.serverEl,
            this.clientEl,
            '← PUBLIC CERT',
            'packet-cert',
            {
                key: 'cert',
                autoHide: true,
                hideDelay: this.state.getDelay('animation')
            }
        );

        // Show public cert on client after receiving it
        if (this.clientCertDisplay) {
            this.clientCertDisplay.style.display = 'block';
            this.clientCertDisplay.innerHTML = '<span class="cert-tag">📜 PUBLIC</span>';
        }
    }

    async step3_iosValidation() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.ssl[3]}</strong> - iOS checks certificate against built-in trusted CAs`;

        this.sequence.cleanupStep();

        const validation = await this.sequence.showDetailBox(`
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
            zone: 'main-left',
            border: '2px solid #00ffff',
            duration: this.state.getDelay('animation')
        });

        await this.sequence.pulseElement(this.clientEl, {
            boxShadow: '0 0 40px rgba(0,255,255,0.8)',
            duration: this.state.getDelay('animation')
        });

        const internalLine = await this.sequence.drawConnection(
            this.clientEl,
            this.caEl,
            'secure-line',
            {
                style: { borderStyle: 'dashed', opacity: '0.5' },
                key: 'internalLine',
                autoHide: true
            }
        );

        const checkmark = document.createElement('div');
        checkmark.className = 'animation-element';
        checkmark.style.cssText = `
            position: absolute;
            font-size: 48px;
            left: 100px;
            top: 180px;
            z-index: 100;
        `;
        checkmark.textContent = '✅';
        this.stage.appendChild(checkmark);
        this.state.store('checkmark', checkmark);

        await sleep(this.state.getDelay('animation'));

        if (!this.state.isSteppingMode) {
            checkmark.style.opacity = '0';
        }
    }

    async step4_keyExchange() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.ssl[4]}</strong> - Use public key FROM the certificate`;

        this.sequence.cleanupStep();

        const keyDetail = await this.sequence.showDetailBox(`
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
            zone: 'main-center',
            duration: this.state.getDelay('animation')
        });

        const secret = await this.sequence.sendPacket(
            this.clientEl,
            this.serverEl,
            '🔐 Encrypted →',
            'packet-encrypted',
            { key: 'secret' }
        );

        secret.style.opacity = '0';

        const decrypted = await this.sequence.showTransformation(
            this.serverEl,
            '🔓 Decrypted (w/ PRIVATE)',
            'packet-plain',
            'left',
            {
                key: 'decrypted',
                style: { maxWidth: '200px' },
                autoHide: true,
                hideDelay: this.state.getDelay('short')
            }
        );
    }

    async step5_sessionKeys() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.ssl[5]}</strong> - Both calculate same key from shared secrets`;

        this.sequence.cleanupStep();

        const sessionDetail = await this.sequence.showDetailBox(`
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
            zone: 'main-center',
            duration: this.state.getDelay('animation')
        });

        await this.sequence.drawConnection(
            this.clientEl,
            this.serverEl,
            'secure-line',
            { key: 'connectionLine' }
        );

        if (!this.state.isSteppingMode) {
            await sleep(this.state.getDelay('animation'));
            sessionDetail.style.opacity = '0';
        }

        this.status.innerHTML = '✅ SECURE! Both parties now use symmetric AES-256 with session key';
    }

    reset() {
        super.reset();
        this.serverKeys.style.display = 'none';
        if (this.clientCertDisplay) {
            this.clientCertDisplay.style.display = 'none';
        }
        this.clientEl.style.animation = '';
        this.clientEl.style.boxShadow = '';
        // Don't create new state - reuse existing to maintain reference
        this.sequence = new AnimationSequence(this.stage, this.state);
    }
}