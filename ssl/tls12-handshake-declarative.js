class TLS12HandshakeAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('tls12-stage');
        const status = document.getElementById('tls12-status');
        super(stage, status);

        this.clientEl = stage.querySelector('.client');
        this.serverEl = stage.querySelector('.server');
        this.caEl = stage.querySelector('.ca');
        this.serverKeys = document.getElementById('tls12-server-keys');
        this.clientCertDisplay = document.getElementById('tls12-client-cert');

        // Use base class button setup
        this.setupButtons('tls12-play', 'tls12-step', 'tls12-reset');

        // Define subclass-specific reset behavior
        this.onReset = () => {
            this.serverKeys.style.display = 'none';
            if (this.clientCertDisplay) this.clientCertDisplay.style.display = 'none';
            this.statusEl.textContent = 'TLS 1.2 - Complete handshake process with all details';
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>TLS 1.2 OVERVIEW</strong> - RSA or Diffie-Hellman key exchange',
                create: async (anim) => {
                    this.serverKeys.style.display = 'block';

                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">🔐 TLS 1.2 Handshake:</strong><br>
                        <br>
                        <span style="color: #ffff00">Key Exchange Methods:</span><br>
                        • RSA (no forward secrecy)<br>
                        • DHE (forward secrecy)<br>
                        • ECDHE (forward secrecy, faster)<br>
                        <br>
                        <span style="color: #ff88ff">Process:</span><br>
                        1. ClientHello → ServerHello<br>
                        2. Certificate exchange<br>
                        3. Key exchange<br>
                        4. Change cipher spec<br>
                        5. Finished messages<br>
                        <br>
                        <span style="color: #ff6666">2-RTT: Full round trip needed!</span>
                    `, {
                        key: 'overview',
                        style: {
                            border: '3px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['overview'],
                persist: []
            },
            {
                status: '<strong>CLIENT HELLO</strong> - Client initiates with supported ciphers and random',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">📱 ClientHello Message:</strong><br>
                        <br>
                        <span style="color: #ffff00">Protocol Version:</span> TLS 1.2 (0x0303)<br>
                        <br>
                        <span style="color: #ffff00">Random (32 bytes):</span><br>
                        • Timestamp: 4 bytes<br>
                        • Random bytes: 28 bytes<br>
                        <code style="color: #888; font-size: 9px">
                        7B3F2A9E8C4D1B6F...<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">Session ID:</span> Empty (new session)<br>
                        <br>
                        <span style="color: #00ffff">Cipher Suites (in order):</span><br>
                        • TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384<br>
                        • TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256<br>
                        • TLS_DHE_RSA_WITH_AES_256_CBC_SHA256<br>
                        • TLS_RSA_WITH_AES_256_CBC_SHA256<br>
                        • TLS_RSA_WITH_AES_128_CBC_SHA<br>
                        <br>
                        <span style="color: #ff88ff">Compression:</span> null (disabled)<br>
                        <br>
                        <span style="color: #00ff88">Extensions:</span><br>
                        • server_name: example.com<br>
                        • supported_groups: [secp256r1, secp384r1]<br>
                        • signature_algorithms: [RSA+SHA256, ECDSA+SHA256]<br>
                        • heartbeat<br>
                        • session_ticket<br>
                        • renegotiation_info
                    `, {
                        key: 'clientHelloDetail',
                        style: {
                            border: '2px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { left: '20px', top: '420px', maxWidth: '320px' }
                    });

                    const packet = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'ClientHello →',
                        'packet-plain',
                        { key: 'clientHello', duration: 1500 }
                    );
                    packet.innerHTML = 'ClientHello → <span style="font-size: 0.8em">📋</span>';
                    packet.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
                },
                show: ['clientHelloDetail', 'clientHello'],
                hide: ['overview'],
                persist: []
            },
            {
                status: '<strong>SERVER HELLO</strong> - Server selects cipher suite and provides random',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">🖥️ ServerHello Response:</strong><br>
                        <br>
                        <span style="color: #ffff00">Protocol Version:</span> TLS 1.2 (0x0303)<br>
                        <br>
                        <span style="color: #ffff00">Random (32 bytes):</span><br>
                        • Server's random value<br>
                        <code style="color: #888; font-size: 9px">
                        9E4A1B8C3F7D2E6A...<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">Session ID:</span><br>
                        <code style="color: #888; font-size: 9px">
                        A1B2C3D4E5F67890...(32 bytes)<br>
                        </code>
                        <br>
                        <span style="color: #00ff88">Selected Cipher Suite:</span><br>
                        TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384<br>
                        <br>
                        Breakdown:<br>
                        • <span style="color: #ff88ff">ECDHE</span>: Elliptic Curve DH Ephemeral<br>
                        • <span style="color: #ffff00">RSA</span>: Authentication method<br>
                        • <span style="color: #00ffff">AES_256_GCM</span>: Encryption<br>
                        • <span style="color: #88ff88">SHA384</span>: HMAC for PRF<br>
                        <br>
                        <span style="color: #ff88ff">Compression:</span> null<br>
                        <br>
                        <span style="color: #00ff88">Extensions:</span><br>
                        • renegotiation_info<br>
                        • server_name acknowledged
                    `, {
                        key: 'serverHelloDetail',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { right: '20px', top: '420px', maxWidth: '320px' }
                    });

                    const packet = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← ServerHello',
                        'packet-plain',
                        { key: 'serverHello', duration: 1500 }
                    );
                    packet.style.background = 'linear-gradient(135deg, #00ffff, #0099ff)';
                },
                show: ['serverHelloDetail', 'serverHello'],
                hide: ['clientHelloDetail', 'clientHello'],
                persist: []
            },
            {
                status: '<strong>CERTIFICATE</strong> - Server sends certificate chain for authentication',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">📜 Certificate Message:</strong><br>
                        <br>
                        <span style="color: #00ff88">Certificate Chain (3 certs):</span><br>
                        <br>
                        <span style="color: #00ffff">1. Server Certificate:</span><br>
                        • Subject: CN=example.com<br>
                        • Issuer: CN=DigiCert SHA2 Secure Server CA<br>
                        • Serial: 0A:B3:4C:D5:E6:F7:89:01<br>
                        • Validity:<br>
                        &nbsp;&nbsp;Not Before: Jan 1 2024<br>
                        &nbsp;&nbsp;Not After: Dec 31 2025<br>
                        • Public Key: RSA 2048 bits<br>
                        &nbsp;&nbsp;Modulus: B4:2C:3D:4E...<br>
                        &nbsp;&nbsp;Exponent: 65537<br>
                        • Extensions:<br>
                        &nbsp;&nbsp;SubjectAltName: *.example.com<br>
                        &nbsp;&nbsp;KeyUsage: Digital Signature<br>
                        • Signature: SHA256withRSA<br>
                        • Fingerprint: <span style="color: #ffff00">AA:BB:CC:DD:EE:FF...</span><br>
                        <br>
                        <span style="color: #00ffff">2. Intermediate CA:</span><br>
                        • CN=DigiCert SHA2 Secure Server CA<br>
                        • Issuer: CN=DigiCert Global Root CA<br>
                        <br>
                        <span style="color: #00ffff">3. Root CA (optional):</span><br>
                        • CN=DigiCert Global Root CA<br>
                        • Self-signed
                    `, {
                        key: 'certDetail',
                        style: {
                            border: '2px solid #ffff00',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { right: '20px', top: '420px', maxWidth: '340px' }
                    });

                    const certPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← Certificate',
                        'packet-cert',
                        { key: 'certificate', duration: 1500 }
                    );

                    if (this.clientCertDisplay) {
                        this.clientCertDisplay.style.display = 'block';
                    }
                },
                show: ['certDetail', 'certificate'],
                hide: ['serverHelloDetail', 'serverHello'],
                persist: []
            },
            {
                status: '<strong>SERVER KEY EXCHANGE</strong> - ECDHE parameters and signature',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff88ff">🔑 ServerKeyExchange (ECDHE):</strong><br>
                        <br>
                        <span style="color: #ffff00">EC Diffie-Hellman Parameters:</span><br>
                        <br>
                        <span style="color: #00ff88">Curve Type:</span> named_curve<br>
                        <span style="color: #00ff88">Named Curve:</span> secp256r1 (P-256)<br>
                        <br>
                        <span style="color: #00ffff">Public Key (65 bytes):</span><br>
                        <code style="color: #888; font-size: 9px">
                        04:A1:B2:C3:D4:E5:F6:78:<br>
                        90:12:34:56:78:9A:BC:DE:<br>
                        ...(x and y coordinates)<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">Signature Algorithm:</span><br>
                        SHA256withRSA<br>
                        <br>
                        <span style="color: #ff88ff">Signature (256 bytes):</span><br>
                        Signs: ClientRandom + ServerRandom + ECParams<br>
                        <code style="color: #888; font-size: 9px">
                        3F:4A:5B:6C:7D:8E:9F:A0:<br>
                        B1:C2:D3:E4:F5:06:17:28:<br>
                        ...<br>
                        </code>
                        <br>
                        <span style="color: #00ff88">Purpose:</span><br>
                        • Provides ephemeral ECDH public key<br>
                        • Signed to prove authenticity<br>
                        • Enables forward secrecy!
                    `, {
                        key: 'serverKeyExchange',
                        style: {
                            border: '2px solid #ff88ff',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { right: '20px', top: '420px', maxWidth: '320px' }
                    });

                    const keyPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← ServerKeyExchange',
                        'packet-plain',
                        { key: 'serverKey', duration: 1500 }
                    );
                    keyPacket.style.background = 'linear-gradient(135deg, #ff88ff, #ff44ff)';
                },
                show: ['serverKeyExchange', 'serverKey'],
                hide: ['certDetail', 'certificate'],
                persist: []
            },
            {
                status: '<strong>SERVER HELLO DONE</strong> - Server finished its part',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #88ff88">✓ ServerHelloDone:</strong><br>
                        <br>
                        Empty message (0 bytes payload)<br>
                        <br>
                        Signals:<br>
                        • Server finished hello phase<br>
                        • Client can now respond<br>
                        • No client cert requested<br>
                        <br>
                        <span style="color: #ffff00">Client now validates:</span><br>
                        ✓ Certificate chain<br>
                        ✓ Signature on key exchange<br>
                        ✓ Domain matches<br>
                        ✓ Certificate not expired
                    `, {
                        key: 'serverDone',
                        style: {
                            border: '2px solid #88ff88',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '420px' }
                    });

                    const donePacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← ServerHelloDone',
                        'packet-plain',
                        { key: 'helloDone', duration: 1000 }
                    );
                },
                show: ['serverDone', 'helloDone'],
                hide: ['serverKeyExchange', 'serverKey'],
                persist: []
            },
            {
                status: '<strong>CERTIFICATE VERIFICATION</strong> - Client validates certificate chain',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">📱 iOS Certificate Validation:</strong><br>
                        <br>
                        <span style="color: #ffff00">1. Chain Building:</span><br>
                        Server cert → Intermediate → Root<br>
                        <br>
                        <span style="color: #00ff88">2. Signature Verification:</span><br>
                        • Server cert signed by Intermediate ✓<br>
                        • Intermediate signed by Root ✓<br>
                        • Root is self-signed ✓<br>
                        <br>
                        <span style="color: #ff88ff">3. Trust Store Check:</span><br>
                        iOS Keychain contains:<br>
                        • DigiCert Global Root CA ✓<br>
                        • 170+ other trusted roots<br>
                        <br>
                        <span style="color: #00ffff">4. Validity Checks:</span><br>
                        • Current date within validity ✓<br>
                        • Not revoked (OCSP check) ✓<br>
                        • Domain matches SAN/CN ✓<br>
                        <br>
                        <span style="color: #88ff88">5. Constraints:</span><br>
                        • Basic Constraints: CA:TRUE ✓<br>
                        • Key Usage correct ✓<br>
                        • Path length OK ✓<br>
                        <br>
                        <span style="color: #00ff88">✅ Certificate Valid!</span>
                    `, {
                        key: 'validation',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { left: '20px', top: '420px', maxWidth: '320px' }
                    });

                    const line = await this.drawConnection(this.clientEl, this.caEl, 'secure-line');
                    line.style.borderStyle = 'dashed';
                    line.style.opacity = '0.5';
                    anim.registerElement('validationLine', line);

                    this.clientEl.style.animation = 'pulse 1s';
                    this.clientEl.style.boxShadow = '0 0 40px rgba(0,255,255,0.8)';

                    setTimeout(() => {
                        this.clientEl.style.animation = '';
                        this.clientEl.style.boxShadow = '';
                    }, 1000);
                },
                show: ['validation', 'validationLine'],
                hide: ['serverDone', 'helloDone', 'serverKeyExchange'],
                persist: []
            },
            {
                status: '<strong>CLIENT KEY EXCHANGE</strong> - Client sends its ECDHE public key',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">🔑 ClientKeyExchange:</strong><br>
                        <br>
                        <span style="color: #ffff00">ECDHE Public Key:</span><br>
                        <br>
                        Client generates ephemeral key pair:<br>
                        • Private: <span style="color: #ff6666">kept secret</span><br>
                        • Public: <span style="color: #00ff88">sent to server</span><br>
                        <br>
                        <span style="color: #00ffff">Public Key (65 bytes):</span><br>
                        <code style="color: #888; font-size: 9px">
                        04:F1:E2:D3:C4:B5:A6:97:<br>
                        88:79:6A:5B:4C:3D:2E:1F:<br>
                        ...(P-256 point)<br>
                        </code>
                        <br>
                        <span style="color: #ff88ff">Pre-Master Secret Calculation:</span><br>
                        <code style="color: #00ff88; font-size: 10px">
                        ECDH(client_private, server_public) =<br>
                        ECDH(server_private, client_public) =<br>
                        Shared Secret (32 bytes)<br>
                        </code>
                        <br>
                        Both sides now have same secret!<br>
                        Never transmitted over network!
                    `, {
                        key: 'clientKeyExchange',
                        style: {
                            border: '2px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { left: '20px', top: '420px', maxWidth: '320px' }
                    });

                    const keyPacket = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'ClientKeyExchange →',
                        'packet-encrypted',
                        { key: 'clientKey', duration: 1500 }
                    );
                    keyPacket.style.background = 'linear-gradient(135deg, #00ff88, #00ffff)';
                },
                show: ['clientKeyExchange', 'clientKey'],
                hide: ['validation', 'validationLine'],
                persist: []
            },
            {
                status: '<strong>KEY DERIVATION</strong> - Both sides derive session keys',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">🔐 Master Secret Derivation:</strong><br>
                        <br>
                        <span style="color: #00ff88">Inputs:</span><br>
                        • Pre-Master Secret (ECDH result)<br>
                        • Client Random (32 bytes)<br>
                        • Server Random (32 bytes)<br>
                        <br>
                        <span style="color: #ff88ff">PRF (Pseudo-Random Function):</span><br>
                        <code style="color: #888; font-size: 9px">
                        master_secret = PRF(<br>
                        &nbsp;&nbsp;pre_master_secret,<br>
                        &nbsp;&nbsp;"master secret",<br>
                        &nbsp;&nbsp;ClientRandom + ServerRandom<br>
                        )[0..47] // 48 bytes<br>
                        </code>
                        <br>
                        <span style="color: #00ffff">Key Expansion:</span><br>
                        <code style="color: #888; font-size: 9px">
                        key_block = PRF(<br>
                        &nbsp;&nbsp;master_secret,<br>
                        &nbsp;&nbsp;"key expansion",<br>
                        &nbsp;&nbsp;ServerRandom + ClientRandom<br>
                        )<br>
                        </code>
                        <br>
                        <span style="color: #00ff88">Derived Keys (AES-256-GCM):</span><br>
                        • client_write_key (32 bytes)<br>
                        • server_write_key (32 bytes)<br>
                        • client_write_IV (4 bytes)<br>
                        • server_write_IV (4 bytes)<br>
                        <br>
                        <span style="color: #ffff00">Ready to encrypt!</span>
                    `, {
                        key: 'keyDerivation',
                        style: {
                            border: '3px solid #ffff00',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px', maxWidth: '360px' }
                    });
                },
                show: ['keyDerivation'],
                hide: ['clientKeyExchange', 'clientKey'],
                persist: []
            },
            {
                status: '<strong>CHANGE CIPHER SPEC</strong> - Client switches to encrypted mode',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff88ff">🔄 ChangeCipherSpec:</strong><br>
                        <br>
                        Protocol: <span style="color: #ffff00">Not a handshake message!</span><br>
                        Content Type: 20 (change_cipher_spec)<br>
                        Payload: 0x01 (single byte)<br>
                        <br>
                        <span style="color: #00ff88">Signals:</span><br>
                        • Start using negotiated keys<br>
                        • All following messages encrypted<br>
                        • Using AES-256-GCM<br>
                        <br>
                        <span style="color: #00ffff">Cipher State Update:</span><br>
                        From: TLS_NULL_WITH_NULL_NULL<br>
                        To: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
                    `, {
                        key: 'clientCCS',
                        style: {
                            border: '2px solid #ff88ff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { left: '20px', top: '440px' }
                    });

                    const ccsPacket = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'ChangeCipherSpec →',
                        'packet-plain',
                        { key: 'ccs', duration: 1000 }
                    );
                    ccsPacket.style.background = 'linear-gradient(135deg, #ff88ff, #ff44ff)';
                },
                show: ['clientCCS', 'ccs'],
                hide: ['keyDerivation'],
                persist: []
            },
            {
                status: '<strong>[CLIENT FINISHED]</strong> - Encrypted verification of handshake',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">🔒 [Finished] Message:</strong><br>
                        <br>
                        <span style="color: #ffff00">ENCRYPTED with client_write_key!</span><br>
                        <br>
                        <span style="color: #ff88ff">Verify Data (12 bytes):</span><br>
                        <code style="color: #888; font-size: 9px">
                        verify_data = PRF(<br>
                        &nbsp;&nbsp;master_secret,<br>
                        &nbsp;&nbsp;"client finished",<br>
                        &nbsp;&nbsp;Hash(all_handshake_messages)<br>
                        )[0..11]<br>
                        </code>
                        <br>
                        Includes hash of:<br>
                        • ClientHello<br>
                        • ServerHello<br>
                        • Certificate<br>
                        • ServerKeyExchange<br>
                        • ServerHelloDone<br>
                        • ClientKeyExchange<br>
                        <br>
                        <span style="color: #00ff88">Proves:</span><br>
                        • Keys correctly derived<br>
                        • Handshake not tampered<br>
                        • Both have same view
                    `, {
                        key: 'clientFinished',
                        style: {
                            border: '2px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '10px'
                        },
                        position: { left: '20px', top: '420px', maxWidth: '300px' }
                    });

                    const finPacket = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        '[Finished] →',
                        'packet-encrypted',
                        { key: 'clientFin', duration: 1000 }
                    );
                    finPacket.style.background = 'linear-gradient(135deg, #00ff88, #00ff00)';
                    finPacket.innerHTML = '🔒 [Finished] →';
                },
                show: ['clientFinished', 'clientFin'],
                hide: ['clientCCS', 'ccs'],
                persist: []
            },
            {
                status: '<strong>SERVER CHANGE CIPHER & FINISHED</strong> - Server confirms and switches',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">🔄 Server Response:</strong><br>
                        <br>
                        <span style="color: #ff88ff">1. ChangeCipherSpec:</span><br>
                        Server switches to encryption<br>
                        <br>
                        <span style="color: #00ff88">2. [Finished] Message:</span><br>
                        Encrypted with server_write_key<br>
                        <br>
                        <code style="color: #888; font-size: 9px">
                        verify_data = PRF(<br>
                        &nbsp;&nbsp;master_secret,<br>
                        &nbsp;&nbsp;"server finished",<br>
                        &nbsp;&nbsp;Hash(all_messages_including_client_finished)<br>
                        )[0..11]<br>
                        </code>
                        <br>
                        <span style="color: #ffff00">Handshake Complete!</span>
                    `, {
                        key: 'serverFinished',
                        style: {
                            border: '2px solid #00ffff',
                            background: 'rgba(10, 10, 15, 0.95)'
                        },
                        position: { right: '20px', top: '440px' }
                    });

                    const ccsPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← ChangeCipherSpec',
                        'packet-plain',
                        { key: 'serverCCS', duration: 800 }
                    );
                    ccsPacket.style.background = 'linear-gradient(135deg, #ff88ff, #ff44ff)';

                    await sleep(500);

                    const finPacket = await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← [Finished]',
                        'packet-encrypted',
                        { key: 'serverFin', duration: 800 }
                    );
                    finPacket.style.background = 'linear-gradient(135deg, #00ffff, #0099ff)';
                    finPacket.innerHTML = '🔒 ← [Finished]';

                    // Add vertical offset to prevent overlap
                    finPacket.style.top = `${parseInt(finPacket.style.top) + 50}px`;
                },
                show: ['serverFinished', 'serverCCS', 'serverFin'],
                hide: ['clientFinished', 'clientFin'],
                persist: []
            },
            {
                status: '<strong>✅ SECURE CONNECTION ESTABLISHED!</strong> - Application data can flow',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">🔒 TLS 1.2 Connection Ready:</strong><br>
                        <br>
                        <span style="color: #ffff00">Cipher Suite Active:</span><br>
                        TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384<br>
                        <br>
                        <span style="color: #00ffff">Security Properties:</span><br>
                        • <span style="color: #ff88ff">Forward Secrecy:</span> Yes (ECDHE)<br>
                        • <span style="color: #00ff88">Encryption:</span> AES-256-GCM<br>
                        • <span style="color: #ffff00">Authentication:</span> RSA certificates<br>
                        • <span style="color: #88ffff">Integrity:</span> AEAD (built-in)<br>
                        <br>
                        <span style="color: #00ff88">Session Keys:</span><br>
                        • client_write_key: 32 bytes<br>
                        • server_write_key: 32 bytes<br>
                        • client_write_IV: 4 bytes<br>
                        • server_write_IV: 4 bytes<br>
                        <br>
                        <span style="color: #ff88ff">Performance:</span><br>
                        • 2-RTT handshake complete<br>
                        • ~300ms typical latency<br>
                        • Session resumption available<br>
                        <br>
                        <span style="color: #00ff88">Ready for Application Data!</span>
                    `, {
                        key: 'complete',
                        style: {
                            border: '3px solid #00ff88',
                            background: 'rgba(10, 10, 15, 0.95)',
                            fontSize: '11px'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });

                    const line = await this.drawConnection(this.clientEl, this.serverEl, 'secure-line');
                    anim.registerElement('secureLine', line);

                    const dataPacket = await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        '🔒 GET /api/data →',
                        'packet-encrypted',
                        { key: 'appData', duration: 1000 }
                    );
                    dataPacket.style.background = 'linear-gradient(135deg, #00ff88, #00ffff)';
                },
                show: ['complete', 'secureLine', 'appData'],
                hide: ['serverFinished', 'serverCCS', 'serverFin'],
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