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
    loadScript('handshake.js');
});

describe('SSL Handshake Animation - Complete Test Suite', () => {
    let animation;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="stage" id="ssl-stage">
                <div class="step-indicator" id="ssl-status"></div>
                <div class="entity client">
                    <div id="client-cert" style="display:none;">
                        <div class="key-item">SERVER CERT</div>
                    </div>
                </div>
                <div class="entity server">
                    <div id="server-keys" style="display:none;">
                        <div class="key-item">PUBLIC CERT</div>
                        <div class="key-item">PRIVATE KEY</div>
                    </div>
                </div>
                <div class="entity ca"></div>
            </div>
            <button id="ssl-play">Play</button>
            <button id="ssl-step">Step</button>
            <button id="ssl-reset">Reset</button>
        `;
        animation = new SSLHandshakeAnimation();
        animation.state.timing.setMode('step');
    });

    afterEach(() => {
        if (animation) {
            animation.cleanup();
            animation.reset();
        }
    });

    describe('Step-by-Step Cleanup Behavior', () => {
        test('Step 0: Certificate Pairs - should show server keys and explanation', async () => {
            // Act
            await animation.step();

            // Assert
            expect(animation.serverKeys.style.display).toBe('block');

            // Assert - Check server key labels
            if (animation.serverKeys) {
                expect(animation.serverKeys.textContent).toContain('PUBLIC CERT');
                expect(animation.serverKeys.textContent).toContain('PRIVATE KEY');
            }

            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            expect(detailBoxes.length).toBe(1); // Only the key pair explanation
            expect(detailBoxes[0].textContent).toContain('Key Pair');
        });

        test('Step 1: Client Hello - should clean Step 0 details but keep server keys', async () => {
            // Arrange
            await animation.step(); // Step 0
            const step0Box = animation.stage.querySelector('.detail-box');

            // Act
            await animation.step(); // Step 1

            // Assert - Persistent elements
            expect(animation.serverKeys.style.display).toBe('block'); // Server keys persist

            // Assert - Cleaned elements
            expect(step0Box.parentNode).toBeNull(); // Step 0 detail box removed

            // Assert - New elements
            const packets = animation.stage.querySelectorAll('.packet');
            expect(packets.length).toBe(1); // Client Hello packet
            expect(packets[0].textContent).toContain('CLIENT HELLO');
        });

        test('Step 2: Server Certificate - should clean Step 1 but keep server keys', async () => {
            // Arrange
            await animation.step(); // Step 0
            await animation.step(); // Step 1
            const step1Packet = animation.stage.querySelector('.packet');

            // Act
            await animation.step(); // Step 2

            // Assert - Persistent elements
            expect(animation.serverKeys.style.display).toBe('block'); // Still visible
            expect(animation.clientCertDisplay.style.display).toBe('block'); // Client now has cert

            // Assert - Cleaned elements
            expect(step1Packet.parentNode).toBeNull(); // Step 1 packet removed

            // Assert - New elements
            const packets = animation.stage.querySelectorAll('.packet');
            expect(packets.length).toBe(1); // Server cert packet
            expect(packets[0].textContent).toContain('PUBLIC CERT');
        });

        test('Step 3: iOS Validation - should clean packets but keep certs visible', async () => {
            // Arrange
            await animation.step(); // Step 0
            await animation.step(); // Step 1
            await animation.step(); // Step 2

            // Act
            await animation.step(); // Step 3

            // Assert - Persistent elements
            expect(animation.serverKeys.style.display).toBe('block');
            expect(animation.clientCertDisplay.style.display).toBe('block');

            // Assert - New elements
            const lines = animation.stage.querySelectorAll('.connection-line');
            expect(lines.length).toBeGreaterThan(0); // Connection to CA
        });

        test('Step 4: Key Exchange - should show encryption process', async () => {
            // Arrange
            for (let i = 0; i < 4; i++) await animation.step();

            // Act
            await animation.step(); // Step 4

            // Assert - Persistent elements
            expect(animation.clientCertDisplay.style.display).toBe('block');

            // Assert - New elements
            const packets = animation.stage.querySelectorAll('.packet');
            const hasSecretPacket = Array.from(packets).some(p =>
                p.textContent.includes('SECRET') || p.textContent.includes('Encrypted')
            );
            expect(hasSecretPacket).toBe(true);
        });

        test('Step 5: Session Keys - should show final secure connection', async () => {
            // Arrange
            for (let i = 0; i < 5; i++) await animation.step();

            // Act
            await animation.step(); // Step 5

            // Assert
            const lines = animation.stage.querySelectorAll('.connection-line.secure-line');
            expect(lines.length).toBeGreaterThan(0);
            expect(animation.status.textContent).toContain('SECURE');
        });
    });

    describe('Element Persistence Rules', () => {
        test('server keys should persist from Step 0 through entire animation', async () => {
            for (let step = 0; step < 6; step++) {
                await animation.step();
                expect(animation.serverKeys.style.display).toBe('block');
            }
        });

        test('client cert should persist from Step 2 onwards', async () => {
            await animation.step(); // Step 0
            expect(animation.clientCertDisplay.style.display).toBe('none');

            await animation.step(); // Step 1
            expect(animation.clientCertDisplay.style.display).toBe('none');

            await animation.step(); // Step 2
            expect(animation.clientCertDisplay.style.display).toBe('block');

            // Should persist through remaining steps
            for (let i = 3; i < 6; i++) {
                await animation.step();
                expect(animation.clientCertDisplay.style.display).toBe('block');
            }
        });

        test('detail boxes should be transient - cleaned on next step', async () => {
            await animation.step(); // Step 0
            const step0Boxes = animation.stage.querySelectorAll('.detail-box').length;
            expect(step0Boxes).toBeGreaterThan(0);

            await animation.step(); // Step 1
            // Previous boxes should be gone or hidden
            const visibleBoxes = Array.from(animation.stage.querySelectorAll('.detail-box'))
                .filter(box => box.style.opacity !== '0' && box.style.display !== 'none');

            // Should only have current step's boxes
            expect(visibleBoxes.length).toBeLessThanOrEqual(2);
        });

        test('packets should be transient - cleaned on next step', async () => {
            await animation.step(); // Step 0
            await animation.step(); // Step 1

            const step1Packets = Array.from(animation.stage.querySelectorAll('.packet'));
            expect(step1Packets.length).toBeGreaterThan(0);

            await animation.step(); // Step 2

            // Step 1 packets should be removed
            step1Packets.forEach(packet => {
                expect(packet.parentNode).toBeNull();
            });
        });
    });

    describe('Timer Consistency', () => {
        test('all timing values should be consistent', () => {
            const timing = animation.state.timing;

            // In step mode, delays should be minimal
            animation.state.timing.setMode('step');
            expect(timing.ANIMATION_DURATION).toBe(0);
            expect(timing.SHORT_DELAY).toBe(0);
            expect(timing.LONG_DELAY).toBe(0);

            // In normal mode, should have standard delays
            animation.state.timing.setMode('normal');
            expect(timing.ANIMATION_DURATION).toBe(1500);
            expect(timing.SHORT_DELAY).toBe(1000);
            expect(timing.LONG_DELAY).toBe(3000);
        });
    });

    describe('Reset Behavior', () => {
        test('reset should clear all elements and reset state', async () => {
            // Arrange - run through several steps
            for (let i = 0; i < 4; i++) await animation.step();

            // Act
            await animation.reset();

            // Assert
            expect(animation.serverKeys.style.display).toBe('none');
            expect(animation.clientCertDisplay.style.display).toBe('none');
            expect(animation.stage.querySelectorAll('.packet').length).toBe(0);
            expect(animation.stage.querySelectorAll('.detail-box').length).toBe(0);
            expect(animation.stage.querySelectorAll('.connection-line').length).toBe(0);
            expect(animation.state.currentStep).toBe(0);
            expect(animation.state.isSteppingMode).toBe(false);
        });
    });
});