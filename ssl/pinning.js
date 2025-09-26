// SSL Pinning Animation
class SSLPinningAnimation extends BaseAnimation {
    constructor() {
        super('pin-stage', 'pin-status', 'pin-play', 'pin-step', 'pin-reset');

        this.clientEl = document.getElementById('pin-client');
        this.serverEl = document.getElementById('pin-server');
        this.attackerEl = document.getElementById('pin-attacker');
        this.shieldEl = document.getElementById('pin-shield');
        this.clientPinned = document.getElementById('pin-client-pinned');
        this.attackerKeys = document.getElementById('pin-attacker-keys');
        this.serverKeys = document.getElementById('pin-server-keys');

        this.state = new EnhancedAnimationState();
        this.sequence = new AnimationSequence(this.stage, this.state);
        this.pinPatterns = new PinningAnimationPatterns(this.sequence);
        this.attackPatterns = new AttackAnimationPatterns(this.sequence);
    }

    getTotalSteps() {
        return AnimationConfig.steps.pinning.length;
    }

    getInitialStatusText() {
        return 'Learn how apps protect against MITM by "pinning" the exact certificate';
    }

    async executeStep(stepNumber) {
        const stepMethods = [
            () => this.step0_pinningConcept(),
            () => this.step1_attackerWithCert(),
            () => this.step2_sendFakeCert(),
            () => this.step3_compareFingerprints(),
            () => this.step4_blockConnection(),
            () => this.step5_tryRealCert()
        ];

        if (stepMethods[stepNumber]) {
            // Check shouldStop before starting
            if (this.state.shouldStop) return;

            await stepMethods[stepNumber]();

            // Check shouldStop after completing
            if (this.state.shouldStop) return;
        }
    }

    async step0_pinningConcept() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[0]}</strong> - App stores server's PUBLIC certificate fingerprint`;

        // Show that the client has the pinned cert and server has its keys
        if (this.clientPinned) this.clientPinned.style.display = 'block';
        if (this.serverKeys) this.serverKeys.style.display = 'block';

        await Promise.all([
            this.sequence.showDetailBox(`
                <strong style="color: #00ffff">📌 Certificate Pinning:</strong><br>
                <br>
                <strong>iOS App Code:</strong><br>
                <code style="color: #00ff00; font-family: monospace; font-size: 10px">
                let pinnedCerts = {<br>
                &nbsp;&nbsp;"api.example.com": {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;sha256: "AAAA1234567890..."<br>
                &nbsp;&nbsp;}<br>
                }<br>
                </code>
                <br>
                <span style="color: #00ff88">Hardcoded = Can't be faked!</span>
            `, {
                key: 'pinDetail',
                zone: 'main-left',
                border: '3px solid #00ffff',
                duration: this.state.getDelay('long')
            }),

            this.sequence.showDetailBox(`
                <strong style="color: #00ff00">Server's Certificate:</strong><br>
                <br>
                📜 PUBLIC Certificate<br>
                • Domain: api.example.com<br>
                • Issuer: DigiCert CA<br>
                • SHA256: AAAA1234567890...<br>
                <br>
                ↑ This exact fingerprint<br>
                is hardcoded in the app!
            `, {
                key: 'serverCert',
                zone: 'main-right',
                border: '2px solid #00ff00',
                duration: this.state.getDelay('long')
            })
        ]);
    }

    async step1_attackerWithCert() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[1]}</strong> - Different public cert, different fingerprint`;

        this.sequence.cleanupStep();

        // Show shield starting from step 1
        this.shieldEl.style.display = 'block';
        this.shieldEl.style.animation = '';  // Reset animation in case it was cleared
        this.shieldEl.classList.add('show');

        this.attackerEl.style.opacity = '';  // Reset opacity in case it was set to 0
        this.attackerEl.classList.add('show');

        // Show attacker's fake keys
        if (this.attackerKeys) this.attackerKeys.style.display = 'block';

        await this.sequence.showDetailBox(`
            <strong style="color: #ff0000">Attacker's Cert:</strong><br>
            <br>
            📜 <span style="color: #ff6b6b">Fake PUBLIC Cert</span><br>
            • Domain: api.example.com (fake!)<br>
            • Issuer: BadGuy CA<br>
            • SHA256: XXXX9999888777...<br>
            <br>
            ↑ Different fingerprint!<br>
            Won't match pinned cert!
        `, {
            key: 'attackerCert',
            zone: 'main-center',
            border: '2px solid #ff0000',
            duration: this.state.getDelay('short')
        });
    }

    async step2_sendFakeCert() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[2]}</strong> - App will check the fingerprint`;

        this.sequence.cleanupStep();

        // Hide the pinning concept detail box from step 0
        const pinDetail = this.state.get('pinDetail');
        if (pinDetail) {
            pinDetail.style.opacity = '0';
        }

        const fakePacket = await this.sequence.sendPacket(
            this.attackerEl,
            this.clientEl,
            '← Fake Cert',
            'packet-fake',
            {
                key: 'fakePacket',
                duration: this.state.getDelay('packet'),
                transform: async (packet) => {
                    packet.innerHTML = '📜 FAKE CERT<br><span style="font-size: 0.8em">SHA256: XXXX9999...</span>';
                }
            }
        );

        const checkingBox = await this.sequence.showDetailBox(`
            <strong style="color: #00ffff">📱 App Checking:</strong><br>
            <br>
            Received cert fingerprint:<br>
            <span style="color: #ff0000">XXXX9999888777...</span><br>
            <br>
            Looking up pinned cert...<br>
            <span style="color: #00ff00">AAAA1234567890...</span>
        `, {
            key: 'checkingBox',
            zone: 'main-left',
            border: '2px solid #00ffff',
            duration: this.state.getDelay('animation')
        });

        if (!this.state.isSteppingMode) {
            fakePacket.style.opacity = '0';
            checkingBox.style.opacity = '0';
        }
    }

    async step3_compareFingerprints() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[3]}</strong> - Certificates don't match`;

        this.sequence.cleanupStep();

        const comparison = await this.sequence.showDetailBox(`
            <h3 style="color: #00ffff; margin-bottom: 10px;">Certificate Comparison:</h3>
            <div style="display: flex; gap: 20px;">
                <div>
                    <strong style="color: #ff0000">Received:</strong><br>
                    SHA256: XXXX9999... ❌
                </div>
                <div>
                    <strong style="color: #00ff00">Expected:</strong><br>
                    SHA256: AAAA1234... ✓
                </div>
            </div>
            <div style="font-size: 20px; margin-top: 10px; color: #ff0000; text-align: center;">
                ❌ CERTIFICATES DON'T MATCH!
            </div>
        `, {
            key: 'comparison',
            zone: 'main-center',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '3px solid #ffff00',
            duration: this.state.getDelay('animation')
        });

        await this.sequence.pulseElement(this.shieldEl, {
            animation: 'pulse 1s infinite',
            reset: false
        });
    }

    async step4_blockConnection() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[4]}</strong> - App refuses to connect`;

        this.sequence.cleanupStep();

        const blockSign = document.createElement('div');
        blockSign.className = 'animation-element';
        blockSign.style.cssText = `
            position: absolute;
            font-size: 80px;
            left: 50%;
            top: 100px;
            transform: translateX(-50%);
            z-index: 70;
            animation: pulse 1s infinite;
        `;
        blockSign.textContent = '🚫';
        this.stage.appendChild(blockSign);
        this.state.store('blockSign', blockSign);

        const detail = await this.sequence.showDetailBox(`
            <strong style="color: #ff6666">CONNECTION BLOCKED!</strong><br>
            <br>
            App throws error:<br>
            <code style="color: #ffffff; font-family: monospace; font-size: 11px">
            SSLPinningError:<br>
            Certificate fingerprint<br>
            does not match pinned<br>
            certificate<br>
            </code>
            <br>
            <span style="color: #00ff88">Attack prevented!</span>
        `, {
            key: 'blockDetail',
            zone: 'main-center',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #ff0000',
            duration: this.state.getDelay('animation')
        });

        this.attackerEl.style.opacity = '0.3';

        if (!this.state.isSteppingMode) {
            await sleep(this.state.getDelay('animation'));
            blockSign.style.opacity = '0';
            detail.style.opacity = '0';
        }
    }

    async step5_tryRealCert() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[5]}</strong> - Only the pinned certificate is accepted`;

        // Remove the block sign immediately when attacker disappears
        const blockSign = this.state.get('blockSign');
        if (blockSign && blockSign.parentNode) {
            blockSign.remove();
            delete this.state.elements['blockSign'];  // Clear from state
        }

        this.sequence.cleanupStep();
        this.attackerEl.style.opacity = '0';

        const realPacket = await this.sequence.sendPacket(
            this.serverEl,
            this.clientEl,
            '← Real Cert',
            'packet-cert',
            {
                key: 'realPacket',
                duration: this.state.getDelay('packet'),
                transform: async (packet) => {
                    packet.innerHTML = '📜 SHA256: AAAA1234...';
                }
            }
        );

        await sleep(this.state.getDelay('short'));

        const successDetail = await this.sequence.showDetailBox(`
            <strong style="color: #00ff00">Perfect Match!</strong><br>
            <br>
            Server sends PUBLIC cert<br>
            ↓<br>
            App checks: AAAA1234...<br>
            ↓<br>
            Matches pinned: AAAA1234...<br>
            ↓<br>
            ✅ Connection allowed!<br>
            <br>
            <span style="color: #ffff00">Only the real server<br>
            can connect!</span>
        `, {
            key: 'successDetail',
            zone: 'main-center',
            border: '3px solid #00ff00'
        });

        await this.sequence.drawConnection(
            this.clientEl,
            this.serverEl,
            'secure-line',
            { key: 'line' }
        );

        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[5]}</strong> - 🛡️ Certificate pinning prevents MITM attacks!`;

        if (!this.state.isSteppingMode) {
            await sleep(this.state.getDelay('long'));
            realPacket.style.opacity = '0';
            successDetail.style.opacity = '0';
        }
    }

    reset() {
        super.reset();
        this.attackerEl.classList.remove('show');
        this.attackerEl.style.opacity = '';  // Clear inline style
        this.shieldEl.style.display = 'none';
        this.shieldEl.classList.remove('show');
        this.shieldEl.style.animation = '';

        // Hide all certificate displays
        if (this.clientPinned) this.clientPinned.style.display = 'none';
        if (this.attackerKeys) this.attackerKeys.style.display = 'none';
        if (this.serverKeys) this.serverKeys.style.display = 'none';

        // Remove the block sign if it exists
        const blockSign = this.state.get('blockSign');
        if (blockSign && blockSign.parentNode) {
            blockSign.remove();
            delete this.state.elements['blockSign'];  // Clear from state
        }

        // Don't create new state - reuse existing to maintain reference
        this.sequence = new AnimationSequence(this.stage, this.state);
    }
}