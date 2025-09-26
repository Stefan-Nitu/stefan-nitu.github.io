/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

function loadScript(filename) {
    const scriptContent = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.head.appendChild(scriptEl);
}

beforeAll(() => {
    loadScript('shared.js');
    loadScript('config.js');
    loadScript('animations.js');
    loadScript('sleep-patch.js');
    loadScript('mitm.js');
});

describe('MITM Attack Animation - Complete Test Suite', () => {
    let animation;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="stage" id="mitm-stage">
                <div class="step-indicator" id="mitm-status"></div>
                <div class="entity client" id="mitm-client">
                    <div id="mitm-client-cert" style="display:none;">
                        <div class="key-item">FAKE CERT</div>
                    </div>
                </div>
                <div class="entity attacker" id="mitm-attacker">
                    <div id="attacker-keys" style="display:none;">
                        <div class="key-item">FAKE CERT</div>
                        <div class="key-item">FAKE PRIVATE</div>
                    </div>
                </div>
                <div class="entity server" id="mitm-server">
                    <div id="mitm-server-keys" style="display:none;">
                        <div class="key-item">REAL CERT</div>
                        <div class="key-item">REAL PRIVATE</div>
                    </div>
                </div>
            </div>
            <button id="mitm-play">Play</button>
            <button id="mitm-step">Step</button>
            <button id="mitm-reset">Reset</button>
        `;
        animation = new MITMAnimation();
        animation.state.timing.setMode('step');
    });

    afterEach(() => {
        if (animation) {
            animation.cleanup();
            animation.reset();
        }
    });

    describe('Step-by-Step Cleanup Behavior', () => {
        test('Step 0: Same Network - attacker appears and persists', async () => {
            // Act
            await animation.step();

            // Assert
            expect(animation.attackerEl.classList.contains('show')).toBe(true);
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            expect(detailBoxes.length).toBe(1);
            expect(detailBoxes[0].textContent).toContain('Same WiFi');
        });

        test('Step 1: Attacker Keys - should clean Step 0 details but keep attacker visible', async () => {
            // Arrange
            await animation.step(); // Step 0
            const step0Box = animation.stage.querySelector('.detail-box');

            // Act
            await animation.step(); // Step 1

            // Assert - Persistent elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true); // Attacker persists
            expect(animation.attackerKeys.style.display).toBe('block'); // Keys appear

            // Assert - Check attacker key labels
            if (animation.attackerKeys) {
                expect(animation.attackerKeys.textContent).toContain('FAKE CERT');
                expect(animation.attackerKeys.textContent).toContain('FAKE PRIVATE');
            }

            // Assert - Cleaned elements
            expect(step0Box.parentNode).toBeNull(); // Step 0 box removed

            // Assert - New elements
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            expect(detailBoxes.length).toBe(1);
            expect(detailBoxes[0].textContent).toContain("Attacker's Certificate");
        });

        test('Step 2: Interception - attacker sends fake cert', async () => {
            // Arrange
            await animation.step(); // Step 0
            await animation.step(); // Step 1

            // Act
            await animation.step(); // Step 2

            // Assert - Persistent elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true);
            expect(animation.attackerKeys.style.display).toBe('block');

            // Assert - New elements (intercept packet)
            const packets = animation.stage.querySelectorAll('.packet');
            const hasInterceptedPacket = Array.from(packets).some(p =>
                p.textContent.includes('INTERCEPTED') || p.textContent.includes('CLIENT HELLO')
            );
            expect(hasInterceptedPacket).toBe(true);
        });

        test('Step 3: iOS Accepts - should show acceptance without validation', async () => {
            // Arrange
            for (let i = 0; i < 3; i++) await animation.step();

            // Act
            await animation.step(); // Step 3

            // Assert - Persistent elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true);

            // Assert - Status
            expect(animation.status.textContent).toContain('TWO DIFFERENT PUBLIC CERTS');

            // Assert - Server and client keys should be visible
            if (animation.serverKeys) {
                expect(animation.serverKeys.style.display).toBe('block');
                expect(animation.serverKeys.textContent).toContain('REAL CERT');
            }
            if (animation.clientCert) {
                expect(animation.clientCert.style.display).toBe('block');
                expect(animation.clientCert.textContent).toContain('FAKE CERT');
            }

            // Assert - Detail boxes explain the deception
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            const hasDeceptionInfo = Array.from(detailBoxes).some(box =>
                box.textContent.includes('Deception') || box.textContent.includes('accepts')
            );
            expect(hasDeceptionInfo).toBe(true);
        });

        test('Step 4: Decrypt - attacker can decrypt all traffic', async () => {
            // Arrange
            for (let i = 0; i < 4; i++) await animation.step();

            // Act
            await animation.step(); // Step 4

            // Assert - Persistent elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true);

            // Assert - Decryption info
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            const hasDecryptInfo = Array.from(detailBoxes).some(box =>
                box.textContent.includes('DECRYPT') || box.textContent.includes('decrypt')
            );
            expect(hasDecryptInfo).toBe(true);
        });

        test('Step 5: Total Breach - should show compromised data', async () => {
            // Arrange
            for (let i = 0; i < 5; i++) await animation.step();

            // Act
            await animation.step(); // Step 5

            // Assert
            expect(animation.status.textContent).toContain('BREACH');
            expect(animation.attackerEl.classList.contains('show')).toBe(true);
        });
    });

    describe('Element Persistence Rules', () => {
        test('attacker should persist from Step 0 through entire animation', async () => {
            for (let step = 0; step < 6; step++) {
                await animation.step();
                expect(animation.attackerEl.classList.contains('show')).toBe(true);
            }
        });

        test('attacker keys should persist from Step 1 onwards', async () => {
            await animation.step(); // Step 0
            expect(animation.attackerKeys.style.display).toBe('none');

            await animation.step(); // Step 1
            expect(animation.attackerKeys.style.display).toBe('block');

            // Should persist through remaining steps
            for (let i = 2; i < 6; i++) {
                await animation.step();
                expect(animation.attackerKeys.style.display).toBe('block');
            }
        });

        test('detail boxes should be transient except critical warnings', async () => {
            await animation.step(); // Step 0
            const step0Boxes = animation.stage.querySelectorAll('.detail-box').length;

            await animation.step(); // Step 1
            const visibleBoxes = Array.from(animation.stage.querySelectorAll('.detail-box'))
                .filter(box => box.style.opacity !== '0' && box.style.display !== 'none');

            // Should clean most boxes but may keep critical warnings
            expect(visibleBoxes.length).toBeLessThanOrEqual(2);
        });

        test('packets should be cleaned between steps', async () => {
            await animation.step(); // Step 0
            await animation.step(); // Step 1
            await animation.step(); // Step 2

            const packets = Array.from(animation.stage.querySelectorAll('.packet'));
            const packetCopy = [...packets];

            await animation.step(); // Step 3

            // Previous packets should be removed
            packetCopy.forEach(packet => {
                expect(packet.parentNode).toBeNull();
            });
        });
    });

    describe('Timer Consistency', () => {
        test('should use same timing system as SSL handshake', () => {
            const sslStage = document.createElement('div');
            sslStage.id = 'ssl-stage';
            document.body.appendChild(sslStage);

            loadScript('handshake.js');
            const sslAnimation = new SSLHandshakeAnimation();

            // Set both to normal mode for comparison
            animation.state.timing.setMode('normal');
            sslAnimation.state.timing.setMode('normal');

            // Both should have same timing values
            expect(animation.state.timing.ANIMATION_DURATION)
                .toBe(sslAnimation.state.timing.ANIMATION_DURATION);
            expect(animation.state.timing.SHORT_DELAY)
                .toBe(sslAnimation.state.timing.SHORT_DELAY);
            expect(animation.state.timing.LONG_DELAY)
                .toBe(sslAnimation.state.timing.LONG_DELAY);

            // Reset back to step mode for other tests
            animation.state.timing.setMode('step');
        });
    });

    describe('Reset Behavior', () => {
        test('reset should hide attacker and clear all elements', async () => {
            // Arrange
            for (let i = 0; i < 4; i++) await animation.step();

            // Act
            await animation.reset();

            // Assert
            expect(animation.attackerEl.classList.contains('show')).toBe(false);
            expect(animation.attackerKeys.style.display).toBe('none');
            expect(animation.stage.querySelectorAll('.packet').length).toBe(0);
            expect(animation.stage.querySelectorAll('.detail-box').length).toBe(0);
            expect(animation.state.currentStep).toBe(0);
        });
    });
});