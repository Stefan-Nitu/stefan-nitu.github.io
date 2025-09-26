// MITM Attack Animation
class MITMAnimation extends BaseAnimation {
    constructor() {
        super('mitm-stage', 'mitm-status', 'mitm-play', 'mitm-step', 'mitm-reset');

        this.clientEl = this.stage.querySelector('.client');
        this.serverEl = this.stage.querySelector('.server');
        this.attackerEl = document.getElementById('mitm-attacker');
        this.attackerKeys = document.getElementById('attacker-keys');
        this.serverKeys = document.getElementById('mitm-server-keys');
        this.clientCert = document.getElementById('mitm-client-cert');

        this.state = new EnhancedAnimationState();
        this.sequence = new AnimationSequence(this.stage, this.state);
        this.attackPatterns = new AttackAnimationPatterns(this.sequence);
    }

    getTotalSteps() {
        return AnimationConfig.steps.mitm.length;
    }

    getInitialStatusText() {
        return 'See how attackers intercept "secure" connections';
    }

    async executeStep(stepNumber) {
        const stepMethods = [
            () => this.step0_compromisedNetwork(),
            () => this.step1_attackerAppears(),
            () => this.step2_interceptConnection(),
            () => this.step3_twoCertificates(),
            () => this.step4_decryptReencrypt(),
            () => this.step5_totalBreach()
        ];

        if (stepMethods[stepNumber]) {
            // Check shouldStop before starting
            if (this.state.shouldStop) return;

            await stepMethods[stepNumber]();

            // Check shouldStop after completing
            if (this.state.shouldStop) return;
        }
    }

    async step0_compromisedNetwork() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.mitm[0]}</strong> - You and the attacker are on the same WiFi/network`;

        // Show attacker on the network
        this.attackerEl.classList.add('show');

        await this.sequence.showDetailBox(`
            <strong style="color: #ff0000">🌐 Shared Network:</strong><br>
            <br>
            📱 Your Device: 192.168.1.100<br>
            👹 Attacker: 192.168.1.666<br>
            🏦 Gateway: 192.168.1.1<br>
            <br>
            <span style="color: #ffcc00">Same WiFi = Can see traffic!</span><br>
            Examples:<br>
            • Coffee shop WiFi<br>
            • Airport network<br>
            • Compromised home router
        `, {
            key: 'networkBox',
            zone: 'main-center',
            border: '2px solid #ff0000',
            duration: this.state.getDelay('long')
        });
    }

    async step1_attackerAppears() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.mitm[1]}</strong> - Has their own public/private key pair`;

        this.sequence.cleanupStep();
        this.attackerKeys.style.display = 'block';

        await this.sequence.showDetailBox(`
            <strong style="color: #ff0000">Attacker's Certificate Pair:</strong><br>
            <br>
            📜 <span style="color: #ff6b6b">Fake PUBLIC Certificate</span><br>
            • Will send this to you<br>
            • Contains attacker's public key<br>
            <br>
            🔒 <span style="color: #ff00ff">Attacker's PRIVATE Key</span><br>
            • Can decrypt YOUR data<br>
            • Because you'll use their public!
        `, {
            key: 'attackerKeysDetail',
            zone: 'main-center',
            border: '2px solid #ff0000',
            duration: this.state.getDelay('short')
        });
    }

    async step2_interceptConnection() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.mitm[2]}</strong> - Attacker intercepts your connection attempt`;

        this.sequence.cleanupStep();

        await this.attackPatterns.showInterception(
            this.clientEl,
            this.serverEl,
            this.attackerEl,
            {
                label: 'CLIENT HELLO →',
                key: 'intercepted',
                autoHide: true,
                hideDelay: this.state.getDelay('short')
            }
        );
    }

    async step3_twoCertificates() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.mitm[3]}</strong>`;

        this.sequence.cleanupStep();

        // Show server keys (server always has them)
        if (this.serverKeys) this.serverKeys.style.display = 'block';

        const certDetail = await this.sequence.showDetailBox(`
            <strong style="color: #ff6666">The Deception:</strong><br>
            <br>
            <strong>To iOS App:</strong><br>
            Sends ATTACKER's PUBLIC cert<br>
            • <span style="color: #ff0000">Contains attacker's public key</span><br>
            • Signed by a trusted CA (or self-signed)<br>
            • <span style="color: #ffcc00">iOS accepts it silently!</span><br>
            <br>
            <strong>From Server:</strong><br>
            Gets SERVER's PUBLIC cert<br>
            • <span style="color: #00ff00">Contains server's public key</span><br>
            • Attacker encrypts to server with THIS<br>
            <br>
            = Two different encryption keys!
        `, {
            key: 'certDetail',
            zone: 'main-center',
            border: '3px solid #ffff00',
            duration: this.state.getDelay('animation')
        });

        const fakeCert = await this.sequence.sendPacket(
            this.attackerEl,
            this.clientEl,
            '← Fake Cert',
            'packet-fake',
            {
                key: 'fakeCert',
                transform: async (packet) => {
                    packet.innerHTML = '📜 Fake cert<br><small style="color: #ffcc00">iOS trusts it!</small>';
                }
            }
        );

        // Show client cert AFTER receiving fake cert from attacker
        if (this.clientCert) this.clientCert.style.display = 'block';

        const realConn = await this.sequence.sendPacket(
            this.serverEl,
            this.attackerEl,
            '← Bank Cert',
            'packet-cert',
            { key: 'realConn' }
        );

        const lines = await Promise.all([
            this.sequence.drawConnection(this.clientEl, this.attackerEl, 'fake-line', { key: 'line1' }),
            this.sequence.drawConnection(this.attackerEl, this.serverEl, 'fake-line', { key: 'line2' })
        ]);

        if (!this.state.isSteppingMode) {
            await sleep(this.state.getDelay('animation'));
            fakeCert.style.opacity = '0';
            realConn.style.opacity = '0';
            certDetail.style.opacity = '0';
        }
    }

    async step4_decryptReencrypt() {
        this.status.innerHTML = `<strong>${AnimationConfig.steps.mitm[4]}</strong> - Attacker can read everything!`;

        this.sequence.cleanupStep();

        const keyInsight = await this.sequence.showDetailBox(`
            <strong style="color: #ff6666">WHY ATTACKER CAN DECRYPT:</strong><br>
            <br>
            1. You got attacker's PUBLIC cert<br>
            2. You encrypt with their PUBLIC key<br>
            3. Attacker has matching PRIVATE key<br>
            4. They decrypt YOUR data!<br>
            <br>
            Then re-encrypt with bank's public<br>
            Bank thinks it's talking to you!
        `, {
            key: 'keyInsight',
            zone: 'main-left',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #ff0000'
        });

        const password = await this.sequence.sendPacket(
            this.clientEl,
            this.attackerEl,
            '🔒 Password →',
            'packet-encrypted',
            { key: 'password' }
        );

        const decryptBox = await this.attackPatterns.showDecryptionAttack(
            this.attackerEl,
            'Password: MyS3cr3t!',
            { key: 'decryptBox' }
        );

        await sleep(this.state.getDelay('animation'));
        password.style.opacity = '0';

        const decryptedPassword = await this.sequence.showTransformation(
            this.attackerEl,
            '📖 Password: MyS3cr3t!',
            'packet-plain',
            'center',
            {
                key: 'decryptedPassword',
                style: {
                    background: 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                    maxWidth: '220px'
                }
            }
        );

        await sleep(this.state.getDelay('short'));
        decryptedPassword.style.opacity = '0';

        const reencrypted = await this.sequence.sendPacket(
            this.attackerEl,
            this.serverEl,
            '🔒 Password →',
            'packet-encrypted',
            { key: 'reencrypted' }
        );

        if (!this.state.isSteppingMode) {
            await sleep(this.state.getDelay('short'));
            keyInsight.style.opacity = '0';
            decryptBox.style.opacity = '0';
            reencrypted.style.opacity = '0';
        }
    }

    async step5_totalBreach() {
        this.status.innerHTML = '⚠️ TOTAL BREACH! Attacker can read and modify everything!';

        this.sequence.cleanupStep();

        const breachSummary = await this.sequence.showDetailBox(`
            <strong style="color: #ff0000">Complete Compromise:</strong><br>
            <br>
            Attacker can now:<br>
            • 📖 Read all passwords<br>
            • 💳 See credit card numbers<br>
            • ✏️ Modify your requests<br>
            • 💉 Inject malware<br>
            • 📸 Capture session tokens<br>
            <br>
            <span style="color: #ffcc00">All because you accepted<br>
            the wrong certificate!</span>
        `, {
            key: 'breachSummary',
            zone: 'main-center',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '3px solid #ff0000'
        });

        const warning = document.createElement('div');
        warning.className = 'animation-element';
        warning.style.cssText = `
            position: absolute;
            font-size: 80px;
            left: 50%;
            top: 100px;
            transform: translateX(-50%);
            z-index: 70;
            animation: pulse 1s infinite;
        `;
        warning.textContent = '⚠️';
        this.stage.appendChild(warning);
        this.state.store('warning', warning);

        if (!this.state.isSteppingMode) {
            await sleep(this.state.getDelay('long'));
            breachSummary.style.opacity = '0';
            warning.style.opacity = '0';
        }
    }

    reset() {
        super.reset();
        this.attackerEl.classList.remove('show');
        this.attackerEl.style.animation = '';
        this.attackerEl.style.opacity = '';  // Clear inline style
        if (this.attackerKeys) this.attackerKeys.style.display = 'none';
        if (this.serverKeys) this.serverKeys.style.display = 'none';
        if (this.clientCert) this.clientCert.style.display = 'none';
        // Don't create new state - reuse existing to maintain reference
        this.sequence = new AnimationSequence(this.stage, this.state);
    }
}