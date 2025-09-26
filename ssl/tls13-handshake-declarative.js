class TLS13HandshakeAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('tls13-stage');
        const status = document.getElementById('tls13-status');
        super(stage, status);

        this.clientEl = stage.querySelector('.client');
        this.serverEl = stage.querySelector('.server');
        this.caEl = stage.querySelector('.ca');
        // Use base class button setup
        this.setupButtons('tls13-play', 'tls13-step', 'tls13-reset');

        // Define subclass-specific reset behavior
        this.onReset = () => {
            this.statusEl.textContent = 'TLS 1.3 - Modern, fast, and secure handshake';
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>TLS 1.3 KEY CONCEPTS</strong> - Faster, simpler, more secure',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">🚀 TLS 1.3 Improvements:</strong><br>
                        <br>
                        <span style="color: #00ff88">• 1-RTT Handshake</span><br>
                        &nbsp;&nbsp;Complete in ONE round trip!<br>
                        <br>
                        <span style="color: #ffff00">• Forward Secrecy Only</span><br>
                        &nbsp;&nbsp;No RSA, only ECDHE<br>
                        <br>
                        <span style="color: #ff88ff">• Encrypted Certificates</span><br>
                        &nbsp;&nbsp;Hides server identity<br>
                        <br>
                        <span style="color: #88ffff">• 0-RTT Resumption</span><br>
                        &nbsp;&nbsp;Instant reconnection!
                    `, {
                        key: 'concepts',
                        style: {
                            border: '3px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['concepts'],
                persist: []
            },
            {
                status: '<strong>CLIENT HELLO + KEY SHARE</strong> - Client sends supported groups AND key share upfront',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">📱 TLS 1.3 Client Hello:</strong><br>
                        <br>
                        <span style="color: #ffff00">Version:</span> TLS 1.3 (0x0304)<br>
                        <span style="color: #ffff00">Random:</span> 32 bytes<br>
                        <span style="color: #ffff00">Session ID:</span> Legacy compatibility<br>
                        <br>
                        <span style="color: #00ffff">Cipher Suites (simplified!):</span><br>
                        • TLS_AES_256_GCM_SHA384<br>
                        • TLS_AES_128_GCM_SHA256<br>
                        • TLS_CHACHA20_POLY1305_SHA256<br>
                        <br>
                        <span style="color: #ff88ff">Extensions:</span><br>
                        • server_name: example.com<br>
                        • supported_versions: [TLS 1.3]<br>
                        • signature_algorithms: [ECDSA, RSA-PSS]<br>
                        • supported_groups: [x25519, secp256r1]<br>
                        <span style="color: #00ff00">• key_share: x25519 public key!</span>
                    `, {
                        key: 'clientHelloDetail',
                        style: {
                            border: '2px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '11px'
                        },
                        position: { left: '20px', top: '420px' }
                    });

                    const packet = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'ClientHello + KeyShare →',
                        'packet-plain',
                        { key: 'clientHello', duration: 1500 }
                    );
                    packet.style.background = 'linear-gradient(135deg, #00ff88, #00ffff)';
                    packet.innerHTML = 'ClientHello + <span style="color: #ffff00">KEY</span> →';

                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">🔑 Key Share Extension:</strong><br>
                        <br>
                        Client generates ECDHE key pair:<br>
                        • Private: kept secret<br>
                        • Public: sent in ClientHello<br>
                        <br>
                        <code style="color: #00ff88; font-size: 10px">
                        key_share {<br>
                        &nbsp;&nbsp;group: x25519<br>
                        &nbsp;&nbsp;public_key: A9B2C3D4...<br>
                        }<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">⚡ No extra round trip!</span>
                    `, {
                        key: 'keyShareDetail',
                        style: {
                            border: '2px solid #ffff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });
                },
                show: ['clientHelloDetail', 'clientHello', 'keyShareDetail'],
                hide: ['concepts'],
                persist: []
            },
            {
                status: '<strong>SERVER HELLO + KEY SHARE</strong> - Server immediately derives keys',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">🖥️ Server Hello (minimal!):</strong><br>
                        <br>
                        <span style="color: #ffff00">Version:</span> TLS 1.2 (legacy field)<br>
                        <span style="color: #ffff00">Random:</span> 32 bytes<br>
                        <span style="color: #ffff00">Session ID:</span> Echo from client<br>
                        <br>
                        <span style="color: #00ff88">Selected Cipher:</span><br>
                        TLS_AES_256_GCM_SHA384<br>
                        <br>
                        <span style="color: #ff88ff">Extensions:</span><br>
                        • supported_versions: TLS 1.3<br>
                        <span style="color: #00ff00">• key_share: server's x25519 key</span>
                    `, {
                        key: 'serverHelloDetail',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const packet = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← ServerHello + KEY',
                        'packet-cert',
                        { key: 'serverHello', duration: 1500 }
                    );
                    packet.innerHTML = '← ServerHello + <span style="color: #ffff00">KEY</span>';

                    await anim.createDetailBox(`
                        <strong style="color: #00ff00">🔐 Key Derivation:</strong><br>
                        <br>
                        Both sides now have:<br>
                        • Client's public key<br>
                        • Server's public key<br>
                        • Their own private keys<br>
                        <br>
                        <span style="color: #ffff00">ECDHE Shared Secret:</span><br>
                        client_priv × server_pub =<br>
                        server_priv × client_pub =<br>
                        <span style="color: #00ff88">SAME SECRET!</span><br>
                        <br>
                        Derive handshake keys NOW!
                    `, {
                        key: 'keyDerivation',
                        style: {
                            border: '3px solid #00ff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['serverHelloDetail', 'serverHello', 'keyDerivation'],
                hide: ['clientHelloDetail', 'clientHello', 'keyShareDetail'],
                persist: []
            },
            {
                status: '<strong>{ENCRYPTED EXTENSIONS}</strong> - Everything after ServerHello is encrypted!',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff88ff">🔒 Encrypted Extensions:</strong><br>
                        <br>
                        <span style="color: #ffff00">NOW ENCRYPTED with handshake keys!</span><br>
                        <br>
                        Server sends:<br>
                        • server_name acknowledgment<br>
                        • max_fragment_length<br>
                        • supported_groups<br>
                        • heartbeat<br>
                        • ALPN (h2, http/1.1)<br>
                        <br>
                        <span style="color: #00ff88">Eavesdroppers can't see these!</span>
                    `, {
                        key: 'encryptedExt',
                        style: {
                            border: '2px solid #ff88ff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const packet1 = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← {EncryptedExtensions}',
                        'packet-encrypted',
                        { key: 'encExt', duration: 1000 }
                    );
                    packet1.style.background = 'linear-gradient(135deg, #ff88ff, #8844ff)';

                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">🛡️ Encryption Active:</strong><br>
                        <br>
                        Using handshake traffic secret:<br>
                        <code style="color: #00ff88; font-size: 10px">
                        HKDF-Extract(<br>
                        &nbsp;&nbsp;salt = 0,<br>
                        &nbsp;&nbsp;secret = ECDHE_secret<br>
                        )<br>
                        </code>
                        <br>
                        All following messages encrypted!
                    `, {
                        key: 'encActive',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '20px', top: '420px' }
                    });
                },
                show: ['encryptedExt', 'encExt', 'encActive'],
                hide: ['serverHelloDetail', 'serverHello', 'keyDerivation'],
                persist: []
            },
            {
                status: '<strong>{CERTIFICATE}</strong> - Server certificate, but encrypted!',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">📜 {Certificate} Message:</strong><br>
                        <br>
                        <span style="color: #ffff00">ENCRYPTED - hidden from passive attackers!</span><br>
                        <br>
                        Certificate chain:<br>
                        1. Server cert (example.com)<br>
                        &nbsp;&nbsp;• Subject: CN=example.com<br>
                        &nbsp;&nbsp;• Public Key: RSA-2048 or ECDSA<br>
                        &nbsp;&nbsp;• Validity: 2024-2025<br>
                        <br>
                        2. Intermediate CA cert<br>
                        3. Root CA (trusted by iOS)<br>
                        <br>
                        <span style="color: #ff88ff">Privacy: Server identity hidden!</span>
                    `, {
                        key: 'certDetail',
                        style: {
                            border: '2px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const certPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← {Certificate}',
                        'packet-encrypted',
                        { key: 'cert', duration: 1000 }
                    );
                    certPacket.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
                },
                show: ['certDetail', 'cert'],
                hide: ['encryptedExt', 'encExt', 'encActive'],
                persist: []
            },
            {
                status: '<strong>{CERTIFICATE VERIFY}</strong> - Server proves it owns the private key',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">✍️ {CertificateVerify}:</strong><br>
                        <br>
                        Server signs the transcript hash:<br>
                        <br>
                        <code style="color: #00ff88; font-size: 10px">
                        signature = Sign(<br>
                        &nbsp;&nbsp;server_private_key,<br>
                        &nbsp;&nbsp;"TLS 1.3, server CertificateVerify" ||<br>
                        &nbsp;&nbsp;0x00 ||<br>
                        &nbsp;&nbsp;Hash(ClientHello...Certificate)<br>
                        )<br>
                        </code>
                        <br>
                        Algorithm: RSA-PSS or ECDSA<br>
                        <br>
                        <span style="color: #ff88ff">Proves server has private key!</span>
                    `, {
                        key: 'certVerify',
                        style: {
                            border: '2px solid #ffff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const verifyPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← {CertificateVerify}',
                        'packet-encrypted',
                        { key: 'verify', duration: 1000 }
                    );
                    verifyPacket.style.background = 'linear-gradient(135deg, #ffff00, #ffcc00)';

                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">📱 iOS Certificate Validation:</strong><br>
                        <br>
                        <span style="color: #ffff00">Even with encryption, iOS still verifies!</span><br>
                        <br>
                        1. ✓ Certificate chain building<br>
                        2. ✓ Check against iOS trusted CAs<br>
                        3. ✓ Domain matches SNI/SAN<br>
                        4. ✓ Signature algorithm secure<br>
                        5. ✓ Not expired or revoked<br>
                        6. ✓ CertificateVerify signature valid<br>
                        <br>
                        <span style="color: #00ff88">Server authenticated!</span><br>
                        <span style="color: #ff88ff">All happens INSIDE the device</span>
                    `, {
                        key: 'clientVerify',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '20px', top: '420px' }
                    });

                    // Visual connection to CA
                    const line = await this.drawConnection(this.clientEl, this.caEl, 'secure-line');
                    line.style.borderStyle = 'dashed';
                    line.style.opacity = '0.5';
                    anim.registerElement('caValidationLine', line);

                    // Pulse effect on client
                    this.clientEl.style.animation = 'pulse 1s';
                    this.clientEl.style.boxShadow = '0 0 40px rgba(0,255,255,0.8)';

                    setTimeout(() => {
                        this.clientEl.style.animation = '';
                        this.clientEl.style.boxShadow = '';
                    }, 1000);
                },
                show: ['certVerify', 'verify', 'clientVerify', 'caValidationLine'],
                hide: ['certDetail', 'cert'],
                persist: []
            },
            {
                status: '<strong>{FINISHED}</strong> - Server finished, includes MAC of entire handshake',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff88ff">{Finished} Message:</strong><br>
                        <br>
                        Server sends MAC of handshake:<br>
                        <br>
                        <code style="color: #00ff88; font-size: 10px">
                        verify_data = HMAC(<br>
                        &nbsp;&nbsp;finished_key,<br>
                        &nbsp;&nbsp;Hash(all_handshake_messages)<br>
                        )<br>
                        </code>
                        <br>
                        Confirms:<br>
                        • Handshake integrity<br>
                        • Both have same view<br>
                        • Keys correctly derived<br>
                        <br>
                        <span style="color: #ffff00">Server done in 1-RTT!</span>
                    `, {
                        key: 'serverFinished',
                        style: {
                            border: '2px solid #ff88ff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const finishedPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← {Finished}',
                        'packet-encrypted',
                        { key: 'srvFinished', duration: 1000 }
                    );
                    finishedPacket.style.background = 'linear-gradient(135deg, #ff88ff, #ff44ff)';
                },
                show: ['serverFinished', 'srvFinished'],
                hide: ['certVerify', 'verify', 'clientVerify', 'caValidationLine'],
                persist: []
            },
            {
                status: '<strong>CLIENT CAN SEND DATA!</strong> - Application data can be sent immediately',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">🚀 1-RTT Complete!</strong><br>
                        <br>
                        Client can now:<br>
                        • Send application data<br>
                        • Uses application traffic secret<br>
                        • No need to wait!<br>
                        <br>
                        <span style="color: #ffff00">50% faster than TLS 1.2!</span>
                    `, {
                        key: 'earlyData',
                        style: {
                            border: '3px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const dataPacket = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'GET /api/data →',
                        'packet-encrypted',
                        { key: 'appData', duration: 1000 }
                    );
                    dataPacket.style.background = 'linear-gradient(135deg, #00ff88, #00ffff)';
                    dataPacket.innerHTML = '🔒 GET /api/data →';
                },
                show: ['earlyData', 'appData'],
                hide: ['serverFinished', 'srvFinished'],
                persist: []
            },
            {
                status: '<strong>{CLIENT FINISHED}</strong> - Client confirms handshake completion',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">{Client Finished}:</strong><br>
                        <br>
                        Client sends its MAC:<br>
                        • Confirms received all messages<br>
                        • Handshake complete!<br>
                        <br>
                        <code style="color: #00ff88; font-size: 10px">
                        verify_data = HMAC(<br>
                        &nbsp;&nbsp;client_finished_key,<br>
                        &nbsp;&nbsp;Hash(full_transcript)<br>
                        )<br>
                        </code>
                    `, {
                        key: 'clientFinished',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '20px', top: '460px' }
                    });

                    const finPacket = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        '{Finished} →',
                        'packet-encrypted',
                        { key: 'cliFinished', duration: 1000 }
                    );
                    finPacket.style.background = 'linear-gradient(135deg, #00ffff, #0088ff)';
                    // Offset vertically to avoid overlap with GET /api/data packet
                    const currentTop = parseInt(finPacket.style.top);
                    finPacket.style.top = `${currentTop + 50}px`;
                },
                show: ['clientFinished', 'cliFinished'],
                persist: ['earlyData', 'appData']
            },
            {
                status: '<strong>✅ SECURE CONNECTION!</strong> - Both parties using AES-256-GCM',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">🔒 Connection Established:</strong><br>
                        <br>
                        <span style="color: #ffff00">Cipher Suite:</span><br>
                        TLS_AES_256_GCM_SHA384<br>
                        <br>
                        <span style="color: #00ffff">Traffic Keys:</span><br>
                        • client_application_traffic_secret<br>
                        • server_application_traffic_secret<br>
                        <br>
                        <span style="color: #ff88ff">Features:</span><br>
                        • Perfect Forward Secrecy ✓<br>
                        • 1-RTT handshake ✓<br>
                        • Encrypted certificates ✓<br>
                        • Authenticated encryption ✓<br>
                        <br>
                        <span style="color: #00ff88">🚀 TLS 1.3 - Fast & Secure!</span>
                    `, {
                        key: 'complete',
                        style: {
                            border: '3px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    const line = await this.drawConnection(this.clientEl, this.serverEl, 'secure-line');
                    anim.registerElement('secureLine', line);
                },
                show: ['complete', 'secureLine'],
                hide: ['clientFinished', 'cliFinished', 'earlyData', 'appData'],
                persist: []
            },
            {
                status: '<strong>BONUS: 0-RTT RESUMPTION</strong> - Instant reconnection with PSK',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">⚡ 0-RTT Resumption:</strong><br>
                        <br>
                        <span style="color: #00ff88">Next connection:</span><br>
                        <br>
                        ClientHello includes:<br>
                        • pre_shared_key extension<br>
                        • early_data extension<br>
                        • PSK from this session<br>
                        <br>
                        <span style="color: #ff88ff">Can send data IMMEDIATELY:</span><br>
                        <code style="color: #00ffff; font-size: 10px">
                        ClientHello + PSK<br>
                        {GET /api/user} ← encrypted!<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">No waiting at all!</span><br>
                        Perfect for mobile apps!<br>
                        <br>
                        <span style="color: #ff6666">⚠️ Replay risk - use carefully</span>
                    `, {
                        key: 'zeroRTT',
                        style: {
                            border: '3px solid #ffff00',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['zeroRTT'],
                hide: ['complete', 'secureLine'],
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
}