// SSL Pinning Animation with Step Management
class SSLPinningManagedAnimation extends ManagedAnimation {
    constructor() {
        super('pin-stage', 'pin-status', 'pin-play', 'pin-step', 'pin-reset');

        this.clientEl = document.getElementById('pin-client');
        this.serverEl = this.stage.querySelector('.server');
        this.attackerEl = document.getElementById('pin-attacker');
        this.shieldEl = document.getElementById('pin-shield');

        this.state = new EnhancedAnimationState();
        this.sequence = new AnimationSequence(this.stage, this.state);
    }

    getTotalSteps() {
        return AnimationConfig.steps.pinning.length;
    }

    getInitialStatusText() {
        return 'Learn how apps protect against MITM by "pinning" the exact certificate';
    }

    getStepMethods() {
        return [
            () => this.step0_pinningConcept(),
            () => this.step1_attackerWithCert(),
            () => this.step2_sendFakeCert(),
            () => this.step3_compareFingerprints(),
            () => this.step4_blockConnection(),
            () => this.step5_tryRealCert()
        ];
    }

    async step0_pinningConcept() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[0]}</strong> - App stores server's PUBLIC certificate fingerprint`;

        this.shieldEl.classList.add('show');
        this.stepManager.markPersistent(this.shieldEl);

        // Create pinning detail box
        await this.stepManager.createDetailBox(`
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
            <span style="color: #ffff00">Hardcoded = Can't be faked!</span>
        `, {
            key: 'pinDetail',
            zone: 'main-left',
            border: '3px solid #00ffff'
        });

        // Create server cert detail box
        await this.stepManager.createDetailBox(`
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
            border: '2px solid #00ff00'
        });
    }

    async step1_attackerWithCert() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[1]}</strong> - Different public cert, different fingerprint`;

        this.attackerEl.classList.add('show');
        this.stepManager.markPersistent(this.attackerEl);

        await this.stepManager.createDetailBox(`
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
            border: '2px solid #ff0000'
        });
    }

    async step2_sendFakeCert() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[2]}</strong> - App will check the fingerprint`;

        // Send fake packet
        const fakePacket = await this.stepManager.sendPacket(
            this.attackerEl,
            this.clientEl,
            '← Fake Cert',
            'packet-fake',
            {
                key: 'fakePacket',
                duration: this.state.getDelay('packet'),
                transform: async (packet) => {
                    packet.innerHTML = '📜 SHA256: XXXX9999...';
                }
            }
        );

        // Show app checking at SAME HEIGHT as pinning info (main-left)
        await this.stepManager.createDetailBox(`
            <strong style="color: #00ffff">📱 App Checking:</strong><br>
            <br>
            Received cert fingerprint:<br>
            <span style="color: #ff0000">XXXX9999888777...</span><br>
            <br>
            Looking up pinned cert...<br>
            <span style="color: #00ff00">AAAA1234567890...</span>
        `, {
            key: 'checkingBox',
            zone: 'main-left', // Same position as pinning info
            border: '2px solid #00ffff'
        });
    }

    async step3_compareFingerprints() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[3]}</strong> - Certificates don't match`;

        await this.stepManager.createDetailBox(`
            <h3 style="color: #ffff00; margin-bottom: 10px;">Certificate Comparison:</h3>
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
            border: '3px solid #ffff00'
        });

        // Pulse shield
        this.shieldEl.style.animation = 'pulse 1s infinite';
    }

    async step4_blockConnection() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[4]}</strong> - App refuses to connect`;

        // Create block sign
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
        this.stepManager.registerElement(blockSign, 'blockSign');

        await this.stepManager.createDetailBox(`
            <strong style="color: #ff0000">CONNECTION BLOCKED!</strong><br>
            <br>
            App throws error:<br>
            <code style="color: #ffffff; font-family: monospace; font-size: 11px">
            SSLPinningError:<br>
            Certificate fingerprint<br>
            does not match pinned<br>
            certificate<br>
            </code>
            <br>
            <span style="color: #ffff00">Attack prevented!</span>
        `, {
            key: 'blockDetail',
            zone: 'main-center',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #ff0000'
        });

        // Fade attacker
        this.attackerEl.style.opacity = '0.3';
    }

    async step5_tryRealCert() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.pinning[5]}</strong> - Only the pinned certificate is accepted`;

        // Hide attacker
        this.attackerEl.style.opacity = '0';

        const realPacket = await this.stepManager.sendPacket(
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

        await this.stepManager.createDetailBox(`
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

        await this.stepManager.drawConnection(
            this.clientEl,
            this.serverEl,
            'secure-line',
            { key: 'line' }
        );

        this.status.innerHTML = '🛡️ PROTECTED! Certificate pinning prevents MITM attacks!';
    }

    reset() {
        super.reset();
        this.attackerEl.classList.remove('show');
        this.attackerEl.style.opacity = '';
        this.shieldEl.classList.remove('show');
        this.shieldEl.style.animation = '';
        this.sequence = new AnimationSequence(this.stage, this.state);
    }
}