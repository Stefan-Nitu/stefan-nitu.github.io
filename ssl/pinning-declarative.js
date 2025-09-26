class SSLPinningAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('pin-stage');
        const status = document.getElementById('pin-status');
        super(stage, status);

        this.clientEl = document.getElementById('pin-client');
        this.serverEl = stage.querySelector('.server');
        this.attackerEl = document.getElementById('pin-attacker');
        this.shieldEl = document.getElementById('pin-shield');
        this.clientPinned = document.getElementById('pin-client-pinned');
        this.attackerKeys = document.getElementById('pin-attacker-keys');
        this.serverKeys = document.getElementById('pin-server-keys');

        // Use base class button setup
        this.setupButtons('pin-play', 'pin-step', 'pin-reset');

        // Define subclass-specific reset behavior
        this.onReset = () => {
            this.attackerEl.classList.remove('show');
            this.attackerEl.style.opacity = '';
            this.shieldEl.style.display = 'none';
            this.shieldEl.classList.remove('show');
            this.shieldEl.style.animation = '';

            if (this.clientPinned) this.clientPinned.style.display = 'none';
            if (this.attackerKeys) this.attackerKeys.style.display = 'none';
            if (this.serverKeys) this.serverKeys.style.display = 'none';
            this.statusEl.textContent = 'Learn how apps protect against MITM by "pinning" the exact certificate';
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>SETUP: CERTIFICATE PINNING</strong> - App stores server\'s PUBLIC certificate fingerprint',
                create: async (anim) => {
                    if (this.clientPinned) this.clientPinned.style.display = 'block';
                    if (this.serverKeys) this.serverKeys.style.display = 'block';

                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">📌 Certificate Pinning:</strong><br>
                        <br>
                        <strong>Pinning Methods:</strong><br>
                        • Certificate pinning (full cert)<br>
                        • Public key pinning (just key)<br>
                        • SPKI pinning (subject public key info)<br>
                        <br>
                        <strong>iOS Implementation:</strong><br>
                        <code style="color: #00ff00; font-family: monospace; font-size: 10px">
                        let pinnedCerts = {<br>
                        &nbsp;&nbsp;"api.example.com": {<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;sha256: "AAAA1234567890..."<br>
                        &nbsp;&nbsp;}<br>
                        }<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">Hardcoded at compile time!</span>
                    `, {
                        key: 'pinDetail',
                        style: {
                            border: '3px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50px', top: '420px' }
                    });

                    await anim.createDetailBox(`
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
                        style: {
                            border: '2px solid #00ff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '50px', top: '420px' }
                    });
                },
                show: ['pinDetail', 'serverCert'],
                persist: []
            },
            {
                status: '<strong>ATTACKER HAS DIFFERENT CERT</strong> - Different public cert, different fingerprint',
                create: async (anim) => {
                    this.shieldEl.style.display = 'block';
                    this.shieldEl.classList.add('show');
                    anim.registerElement('shield', this.shieldEl);

                    this.attackerEl.classList.add('show');
                    if (this.attackerKeys) this.attackerKeys.style.display = 'block';

                    await anim.createDetailBox(`
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
                        style: {
                            border: '2px solid #ff0000',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['attackerCert', 'shield'],
                hide: ['pinDetail', 'serverCert'],
                persist: []
            },
            {
                status: '<strong>ATTACKER SENDS FAKE CERT</strong> - App will check the fingerprint',
                create: async (anim) => {
                    const fakePacket = await anim.sendPacket(
                        this.attackerEl,
                        this.clientEl,
                        '← Fake Cert',
                        'packet-fake',
                        { key: 'fakePacket', duration: 1500 }
                    );
                    fakePacket.innerHTML = '📜 FAKE CERT<br><span style="font-size: 0.8em">SHA256: XXXX9999...</span>';

                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">📱 App Checking:</strong><br>
                        <br>
                        Received cert fingerprint:<br>
                        <span style="color: #ff0000">XXXX9999888777...</span><br>
                        <br>
                        Looking up pinned cert...<br>
                        <span style="color: #00ff00">AAAA1234567890...</span>
                    `, {
                        key: 'checkingBox',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50px', top: '420px' }
                    });
                },
                show: ['fakePacket', 'checkingBox'],
                hide: ['attackerCert'],
                persist: ['shield']
            },
            {
                status: '<strong>FINGERPRINT MISMATCH!</strong> - Certificates don\'t match',
                create: async (anim) => {
                    await anim.createDetailBox(`
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
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '3px solid #ffff00'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    this.shieldEl.style.animation = 'pulse 1s infinite';
                },
                show: ['comparison'],
                hide: ['fakePacket', 'checkingBox'],
                persist: ['shield']
            },
            {
                status: '<strong>CONNECTION BLOCKED!</strong> - App refuses to connect',
                create: async (anim) => {
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
                    anim.registerElement('blockSign', blockSign);

                    await anim.createDetailBox(`
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
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            border: '2px solid #ff0000'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    this.attackerEl.style.opacity = '0.3';
                },
                show: ['blockSign', 'blockDetail'],
                hide: ['comparison'],
                persist: ['shield']
            },
            {
                status: '🛡️ PROTECTED! Certificate pinning prevents MITM attacks!',
                create: async (anim) => {
                    // Hide attacker completely
                    this.attackerEl.style.opacity = '0';

                    const realPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← Real Cert',
                        'packet-cert',
                        { key: 'realPacket', duration: 1500 }
                    );
                    realPacket.innerHTML = '📜 SHA256: AAAA1234...';

                    await sleep(1000);

                    await anim.createDetailBox(`
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
                        style: {
                            border: '3px solid #00ff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    const line = await this.drawConnection(this.clientEl, this.serverEl, 'secure-line');
                    anim.registerElement('connectionLine', line);
                },
                show: ['realPacket', 'successDetail', 'connectionLine'],
                hide: ['blockSign', 'blockDetail'],
                persist: ['shield']
            }
        ]);
    }

    async drawConnection(from, to, className) {
        const line = createConnectionLine(this.stage, from, to, className);
        await sleep(100);
        line.classList.add('show');
        return line;
    }
}