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
    loadScript('pinning.js');
});

describe('SSL Pinning Animation - Complete Test Suite', () => {
    let animation;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="stage" id="pin-stage">
                <div class="step-indicator" id="pin-status"></div>
                <div class="entity client" id="pin-client">
                    <div class="shield" id="pin-shield" style="display:none;">🛡️</div>
                </div>
                <div class="entity attacker" id="pin-attacker"></div>
                <div class="entity server"></div>
            </div>
            <button id="pin-play">Play</button>
            <button id="pin-step">Step</button>
            <button id="pin-reset">Reset</button>
        `;
        animation = new SSLPinningAnimation();
        animation.state.timing.setMode('step');
    });

    afterEach(() => {
        if (animation) {
            animation.cleanup();
            animation.reset();
        }
    });

    describe('Step-by-Step Cleanup Behavior', () => {
        test('Step 0: Certificate Pinning Concept - should explain pinning', async () => {
            // Act
            await animation.step();

            // Assert
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            expect(detailBoxes.length).toBeGreaterThan(0);
            const content = Array.from(detailBoxes).map(b => b.textContent).join('');
            expect(content).toContain('Certificate Pinning');
            expect(content).toContain('Hardcoded');
        });

        test('Step 1: Attacker Appears - should clean Step 0 but show attacker', async () => {
            // Arrange
            await animation.step(); // Step 0
            const step0Boxes = animation.stage.querySelectorAll('.detail-box');

            // Act
            await animation.step(); // Step 1

            // Assert - Cleaned elements
            step0Boxes.forEach(box => {
                expect(box.parentNode).toBeNull();
            });

            // Assert - New elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true);
            expect(animation.shieldEl.style.display).toBe('block'); // Shield appears

            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            const hasAttackerInfo = Array.from(detailBoxes).some(box =>
                box.textContent.includes('Attacker') || box.textContent.includes('MITM')
            );
            expect(hasAttackerInfo).toBe(true);
        });

        test('Step 2: Fake Certificate - attacker sends fake cert, app checks', async () => {
            // Arrange
            await animation.step(); // Step 0
            await animation.step(); // Step 1

            // Act
            await animation.step(); // Step 2

            // Assert - Persistent elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true);
            expect(animation.shieldEl.style.display).toBe('block');

            // Assert - New elements
            const packets = animation.stage.querySelectorAll('.packet');
            const hasFakeCert = Array.from(packets).some(p =>
                p.textContent.includes('Fake') || p.textContent.includes('FAKE')
            );
            expect(hasFakeCert).toBe(true);

            // Should show app checking
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            const hasCheckingInfo = Array.from(detailBoxes).some(box =>
                box.textContent.includes('Checking') || box.textContent.includes('checking')
            );
            expect(hasCheckingInfo).toBe(true);
        });

        test('Step 3: Certificate Comparison - should show mismatch', async () => {
            // Arrange
            for (let i = 0; i < 3; i++) await animation.step();

            // Act
            await animation.step(); // Step 3

            // Assert - Persistent elements
            expect(animation.attackerEl.classList.contains('show')).toBe(true);
            expect(animation.shieldEl.style.display).toBe('block');

            // Assert - Comparison result
            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            const hasComparison = Array.from(detailBoxes).some(box =>
                box.textContent.includes('MATCH') || box.textContent.includes('Comparison')
            );
            expect(hasComparison).toBe(true);
        });

        test('Step 4: Connection Blocked - should show attack prevented', async () => {
            // Arrange
            for (let i = 0; i < 4; i++) await animation.step();

            // Act
            await animation.step(); // Step 4

            // Assert - Persistent elements
            expect(animation.shieldEl.style.display).toBe('block'); // Shield still active

            // Assert - Blocked indication
            expect(animation.status.textContent).toContain('BLOCKED');

            const hasBlockSign = animation.stage.querySelector('.animation-element')?.textContent.includes('🚫');
            expect(hasBlockSign).toBe(true);
        });

        test('Step 5: Real Certificate Works - should show successful connection', async () => {
            // Arrange
            for (let i = 0; i < 5; i++) await animation.step();

            // Act
            await animation.step(); // Step 5

            // Assert
            expect(animation.status.textContent).toContain('REAL CERT WORKS');
            expect(animation.shieldEl.style.display).toBe('block');

            // Should show secure connection
            const lines = animation.stage.querySelectorAll('.connection-line');
            const hasSecureLine = Array.from(lines).some(line =>
                line.classList.contains('secure-line')
            );
            expect(hasSecureLine).toBe(true);
        });
    });

    describe('Element Persistence Rules', () => {
        test('shield should persist from Step 1 through entire animation', async () => {
            await animation.step(); // Step 0
            expect(animation.shieldEl.style.display).toBe('none');

            for (let step = 1; step < 6; step++) {
                await animation.step();
                expect(animation.shieldEl.style.display).toBe('block');
            }
        });

        test('attacker should appear in Step 1 and persist differently than MITM', async () => {
            await animation.step(); // Step 0
            expect(animation.attackerEl.classList.contains('show')).toBe(false);

            await animation.step(); // Step 1
            expect(animation.attackerEl.classList.contains('show')).toBe(true);

            // In pinning, attacker might be shown differently (blocked/faded) in later steps
            for (let i = 2; i < 6; i++) {
                await animation.step();
                // Attacker remains visible but may change appearance
                expect(animation.attackerEl.classList.contains('show')).toBe(true);
            }
        });

        test('detail boxes should clean between steps except critical info', async () => {
            await animation.step(); // Step 0
            const step0Count = animation.stage.querySelectorAll('.detail-box').length;

            await animation.step(); // Step 1
            const step1Visible = Array.from(animation.stage.querySelectorAll('.detail-box'))
                .filter(box => box.style.opacity !== '0' && box.style.display !== 'none');

            // Should have cleaned previous step
            expect(step1Visible.length).toBeLessThanOrEqual(2);
        });

        test('fake certificate packet should be transient', async () => {
            await animation.step(); // Step 0
            await animation.step(); // Step 1
            await animation.step(); // Step 2

            const fakePacket = Array.from(animation.stage.querySelectorAll('.packet'))
                .find(p => p.textContent.includes('Fake'));

            await animation.step(); // Step 3

            // Fake packet should be removed
            if (fakePacket) {
                expect(fakePacket.parentNode).toBeNull();
            }
        });
    });

    describe('Pinning-Specific Behavior', () => {
        test('should show fingerprint comparison clearly', async () => {
            // Navigate to comparison step
            for (let i = 0; i < 4; i++) await animation.step();

            const detailBoxes = animation.stage.querySelectorAll('.detail-box');
            const comparisonContent = Array.from(detailBoxes).map(b => b.textContent).join('');

            // Should show both fingerprints
            expect(comparisonContent).toMatch(/[A-Z0-9]{4,}/); // At least one fingerprint
            expect(comparisonContent).toContain("DON'T MATCH");
        });

        test('block sign should appear when connection blocked', async () => {
            for (let i = 0; i < 5; i++) await animation.step();

            const blockSign = animation.stage.querySelector('.animation-element');
            expect(blockSign?.textContent).toContain('🚫');
        });
    });

    describe('Timer Consistency', () => {
        test('should use same timing as other animations', () => {
            // Create MITM for comparison
            const mitmStage = document.createElement('div');
            mitmStage.id = 'mitm-stage';
            document.body.appendChild(mitmStage);

            loadScript('mitm.js');
            const mitmAnimation = new MITMAnimation();

            // Set both to normal mode for comparison
            animation.state.timing.setMode('normal');
            mitmAnimation.state.timing.setMode('normal');

            // Should have identical timing
            expect(animation.state.timing.ANIMATION_DURATION)
                .toBe(mitmAnimation.state.timing.ANIMATION_DURATION);
            expect(animation.state.timing.SHORT_DELAY)
                .toBe(mitmAnimation.state.timing.SHORT_DELAY);
            expect(animation.state.timing.LONG_DELAY)
                .toBe(mitmAnimation.state.timing.LONG_DELAY);

            // Reset back to step mode for other tests
            animation.state.timing.setMode('step');
        });
    });

    describe('Reset Behavior', () => {
        test('reset should hide shield, attacker, and clear all elements', async () => {
            // Arrange
            for (let i = 0; i < 4; i++) await animation.step();

            // Act
            await animation.reset();

            // Assert
            expect(animation.shieldEl.style.display).toBe('none');
            expect(animation.attackerEl.classList.contains('show')).toBe(false);
            expect(animation.stage.querySelectorAll('.packet').length).toBe(0);
            expect(animation.stage.querySelectorAll('.detail-box').length).toBe(0);
            expect(animation.stage.querySelectorAll('.animation-element').length).toBe(0);
            expect(animation.state.currentStep).toBe(0);
        });
    });
});