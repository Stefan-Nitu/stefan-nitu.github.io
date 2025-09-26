class MITMAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('mitm-stage');
        const status = document.getElementById('mitm-status');
        super(stage, status);

        this.clientEl = stage.querySelector('.client');
        this.serverEl = stage.querySelector('.server');
        this.attackerEl = document.getElementById('mitm-attacker');
        this.attackerKeys = document.getElementById('attacker-keys');
        this.serverKeys = document.getElementById('mitm-server-keys');
        this.clientCert = document.getElementById('mitm-client-cert');

        this.setupButtons();
        this.defineAnimationSteps();
    }

    setupButtons() {
        this.playBtn = document.getElementById('mitm-play');
        this.stepBtn = document.getElementById('mitm-step');
        this.resetBtn = document.getElementById('mitm-reset');

        if (this.playBtn) this.playBtn.addEventListener('click', () => this.handlePlay());
        if (this.stepBtn) this.stepBtn.addEventListener('click', () => this.handleStep());
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.handleReset());
    }

    async handlePlay() {
        this.playBtn.disabled = true;
        this.stepBtn.disabled = true;
        await this.play();
        this.playBtn.disabled = false;
        this.stepBtn.disabled = false;
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
        this.reset();
        this.attackerEl.classList.remove('show');
        this.attackerEl.style.opacity = '';
        if (this.attackerKeys) this.attackerKeys.style.display = 'none';
        if (this.serverKeys) this.serverKeys.style.display = 'none';
        if (this.clientCert) this.clientCert.style.display = 'none';

        this.playBtn.disabled = false;
        this.stepBtn.disabled = false;
        this.stepBtn.textContent = '⏭️ Next Step';
        this.statusEl.textContent = 'See how attackers intercept "secure" connections';
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>SETUP: SAME NETWORK</strong> - You and the attacker are on the same WiFi/network',
                create: async (anim) => {
                    this.attackerEl.classList.add('show');

                    await anim.createDetailBox(`
                        <strong style="color: #ff0000">🌐 Network Position Attack:</strong><br>
                        <br>
                        📱 Your Device: 192.168.1.100<br>
                        👹 Attacker: 192.168.1.666<br>
                        🏦 Gateway: 192.168.1.1<br>
                        <br>
                        <span style="color: #ffcc00">Attack Techniques:</span><br>
                        • ARP spoofing (pretend to be gateway)<br>
                        • DNS hijacking (fake DNS responses)<br>
                        • Rogue WiFi AP (evil twin)<br>
                        • BGP hijacking (ISP level)<br>
                        <br>
                        <span style="color: #ff6666">Common scenarios:</span><br>
                        • Public WiFi (coffee shop, airport)<br>
                        • Compromised router<br>
                        • Malicious WiFi hotspot
                    `, {
                        key: 'networkBox',
                        style: {
                            border: '2px solid #ff0000',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['networkBox'],
                persist: []
            },
            {
                status: '<strong>ATTACKER WITH OWN CERT PAIR</strong> - Has their own public/private key pair',
                create: async (anim) => {
                    this.attackerKeys.style.display = 'block';

                    await anim.createDetailBox(`
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
                        style: {
                            border: '2px solid #ff0000',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['attackerKeysDetail'],
                hide: ['networkBox'],
                persist: []
            },
            {
                status: '<strong>INTERCEPT CLIENT HELLO</strong> - Attacker intercepts your connection attempt',
                create: async (anim) => {
                    const packet = await anim.sendPacket(
                        this.clientEl,
                        this.attackerEl,
                        'CLIENT HELLO →',
                        'packet-plain',
                        { key: 'interceptPacket', duration: 1500 }
                    );

                    setTimeout(() => {
                        packet.style.opacity = '0';
                    }, 2000);

                    const intercepted = await this.showTransformation(
                        this.attackerEl,
                        '🔴 INTERCEPTED!',
                        'packet-fake',
                        'below'
                    );
                    anim.registerElement('intercepted', intercepted);
                },
                show: ['interceptPacket', 'intercepted'],
                hide: ['attackerKeysDetail'],
                persist: []
            },
            {
                status: '<strong>ATTACKER SENDS TWO DIFFERENT PUBLIC CERTS</strong>',
                create: async (anim) => {
                    if (this.serverKeys) this.serverKeys.style.display = 'block';

                    await anim.createDetailBox(`
                        <strong style="color: #ff6666">The Deception:</strong><br>
                        <br>
                        <strong>To iOS App:</strong><br>
                        Sends ATTACKER's PUBLIC cert<br>
                        • <span style="color: #ff0000">Contains attacker's public key</span><br>
                        • <span style="color: #ffff00">Valid cert from trusted CA!</span><br>
                        • For attacker's domain (e.g., evil.com)<br>
                        • <span style="color: #00ff88">iOS validates it ✓</span><br>
                        • <span style="color: #ff6666">NO WARNING shown!</span><br>
                        <br>
                        <strong>From Server:</strong><br>
                        Gets REAL server's cert<br>
                        • <span style="color: #00ff00">Contains server's public key</span><br>
                        • Attacker uses this with real server<br>
                        <br>
                        <span style="color: #ffcc00">Why it works:</span><br>
                        • Attacker has VALID cert for THEIR domain<br>
                        • DNS/network hijacking makes you connect to them<br>
                        • iOS can't detect the domain switch!
                    `, {
                        key: 'certDetail',
                        style: {
                            border: '3px solid #ffff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    const fakeCert = await anim.sendPacket(
                        this.attackerEl,
                        this.clientEl,
                        '← Fake Cert',
                        'packet-fake',
                        { key: 'fakeCert', duration: 1500 }
                    );
                    fakeCert.innerHTML = '📜 Fake cert<br><small style="color: #ffcc00">iOS trusts it!</small>';

                    if (this.clientCert) this.clientCert.style.display = 'block';

                    const realCert = await anim.sendPacket(
                        this.serverEl,
                        this.attackerEl,
                        '← Server Cert',
                        'packet-cert',
                        { key: 'realCert', duration: 1500 }
                    );

                    const line1 = await this.drawConnection(this.clientEl, this.attackerEl, 'fake-line');
                    const line2 = await this.drawConnection(this.attackerEl, this.serverEl, 'fake-line');
                    anim.registerElement('line1', line1);
                    anim.registerElement('line2', line2);
                },
                show: ['certDetail', 'fakeCert', 'realCert', 'line1', 'line2'],
                hide: ['interceptPacket', 'intercepted'],
                persist: []
            },
            {
                status: '<strong>DECRYPT & RE-ENCRYPT</strong> - Attacker can read everything!',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff6666">WHY ATTACKER CAN DECRYPT:</strong><br>
                        <br>
                        1. You got attacker's PUBLIC cert<br>
                        2. You encrypt with their PUBLIC key<br>
                        3. Attacker has matching PRIVATE key<br>
                        4. They decrypt YOUR data!<br>
                        <br>
                        Then re-encrypt with server's public<br>
                        Server thinks it's talking to you!
                    `, {
                        key: 'keyInsight',
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '2px solid #ff0000'
                        },
                        position: { left: '50px', top: '420px' }
                    });

                    const password = await anim.sendPacket(
                        this.clientEl,
                        this.attackerEl,
                        '🔒 Password →',
                        'packet-encrypted',
                        { key: 'password', duration: 1500 }
                    );

                    const decryptBox = await this.createDecryptBox(this.attackerEl, 'Password: MyS3cr3t!');
                    anim.registerElement('decryptBox', decryptBox);

                    await sleep(1500);
                    password.style.opacity = '0';

                    const decrypted = await this.showTransformation(
                        this.attackerEl,
                        '📖 Password: MyS3cr3t!',
                        'packet-plain',
                        'center'
                    );
                    decrypted.style.background = 'linear-gradient(135deg, #ff6b6b, #ff4444)';
                    decrypted.style.maxWidth = '220px';
                    anim.registerElement('decrypted', decrypted);

                    await sleep(1000);
                    decrypted.style.opacity = '0';

                    const reencrypted = await anim.sendPacket(
                        this.attackerEl,
                        this.serverEl,
                        '🔒 Password →',    
                        'packet-encrypted',
                        { key: 'reencrypted', duration: 1500 }
                    );
                },
                show: ['keyInsight', 'password', 'decryptBox', 'decrypted', 'reencrypted'],
                hide: ['certDetail', 'fakeCert', 'realCert'],
                persist: ['line1', 'line2']
            },
            {
                status: '⚠️ TOTAL BREACH! Attacker can read and modify everything!',
                create: async (anim) => {
                    await anim.createDetailBox(`
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
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '3px solid #ff0000'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
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
                    anim.registerElement('warning', warning);
                },
                show: ['breachSummary', 'warning'],
                hide: ['keyInsight', 'password', 'decryptBox', 'reencrypted', 'line1', 'line2'],
                persist: []
            }
        ]);
    }

    async drawConnection(from, to, className) {
        const line = createConnectionLine(this.stage, from, to, className);
        await sleep(100);
        line.classList.add('show');
        return line;
    }

    showTransformation(nearElement, text, className, position) {
        return showPacketTransformation(this.stage, text, className, nearElement, position);
    }

    async createDecryptBox(attackerEl, data) {
        const decryptBox = document.createElement('div');
        decryptBox.className = 'detail-box';
        decryptBox.style.background = 'rgba(10, 10, 15, 0.95)';
        decryptBox.style.border = '2px solid #ff0000';
        decryptBox.innerHTML = `
            <strong>🔓 DECRYPTING</strong><br>
            Using: Attacker's PRIVATE key<br>
            <br>
            Result: <span style="color: #ffff00">${data}</span>
        `;

        const position = positionBelowElement(attackerEl);
        decryptBox.style.position = 'absolute';
        Object.assign(decryptBox.style, position);
        decryptBox.style.left = `${getElementCenter(attackerEl).x - 100}px`;
        this.stage.appendChild(decryptBox);

        return decryptBox;
    }
}