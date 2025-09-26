// Declarative Animation System - Clean abstraction for step-based animations

class AnimationStep {
    constructor(config) {
        this.show = config.show || [];
        this.hide = config.hide || [];
        this.persist = config.persist || [];
        this.create = config.create || (async function() {});
        this.status = config.status || '';
    }
}

class DeclarativeAnimation {
    constructor(stage, statusEl) {
        this.stage = stage;
        this.statusEl = statusEl;
        this.elements = new Map();
        this.visibleElements = new Set();
        this.currentStep = 0;
        this.steps = [];
        this.isPlaying = false;
        this.shouldStop = false;
        this.sleepTimeouts = [];
    }

    // Interruptible sleep
    async sleep(ms) {
        if (this.shouldStop) return;

        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                resolve();
            }, ms);

            this.sleepTimeouts.push(timeoutId);
        });
    }

    registerElement(key, element) {
        this.elements.set(key, element);
        return element;
    }

    getElement(key) {
        return this.elements.get(key);
    }

    async executeStep(step) {
        // Single check at start
        if (this.shouldStop) return;

        // Update status
        if (this.statusEl && step.status) {
            this.statusEl.innerHTML = step.status;
        }

        // First, hide elements that need to be hidden
        const elementsToHide = [];
        for (const key of step.hide) {
            const element = this.elements.get(key);
            if (element) {
                elementsToHide.push(element);
                this.visibleElements.delete(key);
            }
        }

        // Handle implicit hiding - anything not in show or persist gets hidden
        const keepVisible = new Set([...step.show, ...step.persist]);
        for (const key of this.visibleElements) {
            if (!keepVisible.has(key)) {
                const element = this.elements.get(key);
                if (element) {
                    elementsToHide.push(element);
                }
            }
        }

        // Hide all elements immediately
        for (const element of elementsToHide) {
            this.hideElementImmediately(element);
        }

        // Wait for hide transition if there are elements to hide
        if (elementsToHide.length > 0) {
            await this.sleep(350);
        }

        // Create new elements - the sleep inside will handle interruption
        await step.create(this);

        // Show elements
        for (const key of step.show) {
            const element = this.elements.get(key);
            if (element) {
                this.showElement(element);
                this.visibleElements.add(key);
            }
        }

        // Update visible set
        this.visibleElements = new Set([...step.show, ...step.persist]);
    }

    hideElementImmediately(element) {
        if (element && element.style) {
            element.style.transition = 'opacity 0.3s';
            element.style.opacity = '0';
            setTimeout(() => {
                if (element.parentNode) {
                    element.remove();
                }
            }, 300);
        }
    }

    hideElement(element) {
        this.hideElementImmediately(element);
    }

    showElement(element) {
        if (element && element.style) {
            if (!element.parentNode) {
                this.stage.appendChild(element);
            }
            element.style.opacity = '1';
        }
    }

    async createDetailBox(content, options = {}) {
        const box = document.createElement('div');
        box.className = 'detail-box';
        box.innerHTML = content;

        if (options.style) Object.assign(box.style, options.style);
        if (options.position) Object.assign(box.style, options.position);

        this.stage.appendChild(box);

        if (options.key) {
            this.registerElement(options.key, box);
        }

        return box;
    }

    async sendPacket(from, to, label, className, options = {}) {
        const packet = document.createElement('div');
        packet.className = `packet ${className}`;
        packet.innerHTML = label;

        // Get entity positions and sizes
        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();
        const stageRect = this.stage.getBoundingClientRect();

        // Calculate packet dimensions (approximate)
        const packetWidth = 170;
        const packetHeight = 30;

        // Calculate positions relative to stage
        const fromCenter = {
            x: fromRect.left - stageRect.left + fromRect.width / 2,
            y: fromRect.top - stageRect.top + fromRect.height / 2
        };

        const toCenter = {
            x: toRect.left - stageRect.left + toRect.width / 2,
            y: toRect.top - stageRect.top + toRect.height / 2
        };

        // Calculate direction vector
        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / distance;
        const unitY = dy / distance;

        // Calculate start position (edge of source entity)
        const startOffset = fromRect.width / 2;
        const startX = fromCenter.x + unitX * startOffset - packetWidth / 2;
        const startY = fromCenter.y + unitY * startOffset - packetHeight / 2;

        // Calculate end position (edge of destination entity)
        const endOffset = toRect.width / 2 + packetWidth / 2;
        const endX = toCenter.x - unitX * endOffset - packetWidth / 2;
        const endY = toCenter.y - unitY * endOffset - packetHeight / 2;

        packet.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            z-index: 60;
            opacity: 0;
            transform: scale(0);
        `;

        this.stage.appendChild(packet);

        // Fade in at source
        await this.sleep(50);
        packet.style.transition = 'all 0.3s ease';
        packet.style.opacity = '1';
        packet.style.transform = 'scale(1)';

        await this.sleep(300);

        // Move to destination edge
        packet.style.transition = 'all 1.5s ease-in-out';
        packet.style.left = `${endX}px`;
        packet.style.top = `${endY}px`;

        await this.sleep(options.duration || 1500);

        if (options.key) {
            this.registerElement(options.key, packet);
        }

        return packet;
    }

    defineSteps(stepDefinitions) {
        this.steps = stepDefinitions.map(def => new AnimationStep(def));
    }

    async play() {
        this.isPlaying = true;
        this.shouldStop = false;
        // Reset currentStep for play mode
        this.currentStep = 0;

        for (let i = 0; i < this.steps.length; i++) {
            if (this.shouldStop) break;
            await this.executeStep(this.steps[i]);
            if (i < this.steps.length - 1 && !this.shouldStop) {
                await this.sleep(1500); // Default delay between steps
            }
        }

        this.isPlaying = false;
    }

    async step() {
        // Reset shouldStop for step mode
        this.shouldStop = false;

        if (this.currentStep < this.steps.length) {
            await this.executeStep(this.steps[this.currentStep]);
            this.currentStep++;
        }
    }

    reset() {
        // Stop any playing animation
        this.shouldStop = true;
        this.isPlaying = false;

        // Clear all sleep timeouts
        this.sleepTimeouts.forEach(id => clearTimeout(id));
        this.sleepTimeouts = [];

        // Immediately remove all animation elements without transitions
        this.stage.querySelectorAll('.packet, .detail-box, .connection-line, .animation-element').forEach(el => {
            // Stop any in-progress transitions/animations
            if (el.style) {
                el.style.transition = 'none';
                el.style.animation = 'none';
                el.style.transitionDuration = '0s';
                el.style.animationDuration = '0s';
            }

            // Remove the element immediately
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        // Reset state
        this.elements.clear();
        this.visibleElements.clear();
        this.currentStep = 0;

        // Reset status
        if (this.statusEl) {
            this.statusEl.textContent = 'Ready to start animation';
        }
    }
}

// Example usage for SSL Handshake
class DeclarativeSSLHandshake extends DeclarativeAnimation {
    constructor(stage, statusEl) {
        super(stage, statusEl);

        this.clientEl = stage.querySelector('.client');
        this.serverEl = stage.querySelector('.server');
        this.serverKeys = document.getElementById('server-keys');

        this.defineSteps([
            {
                status: '<strong>SETUP: CERTIFICATE PAIRS</strong> - Server has PUBLIC + PRIVATE key pair',
                create: async (anim) => {
                    // Show server keys
                    if (this.serverKeys) this.serverKeys.style.display = 'block';

                    // Create explanation box
                    await anim.createDetailBox(`
                        <strong>🔑 Key Pair Concept:</strong><br>
                        PUBLIC: Can be shared<br>
                        PRIVATE: Kept secret!
                    `, {
                        key: 'pairExplain',
                        position: { right: '50px', top: '250px' }
                    });
                },
                show: ['pairExplain'],
                persist: []
            },
            {
                status: '<strong>CLIENT HELLO</strong> - Client lists encryption algorithms',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong>📱 Client Hello:</strong><br>
                        TLS Version: 1.3<br>
                        Cipher Suites...
                    `, {
                        key: 'clientHello',
                        position: { left: '50px', top: '250px' }
                    });

                    await anim.sendPacket(
                        this.clientEl,
                        this.serverEl,
                        'CLIENT HELLO →',
                        'packet-plain',
                        { key: 'helloPacket' }
                    );
                },
                show: ['clientHello', 'helloPacket'],
                hide: ['pairExplain'],
                persist: []
            },
            {
                status: '<strong>SERVER CERTIFICATE</strong> - Sends PUBLIC cert only',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong>📜 PUBLIC Certificate:</strong><br>
                        Domain: example.com<br>
                        Private key STAYS SECRET!
                    `, {
                        key: 'certDetail',
                        position: { right: '50px', top: '250px' }
                    });

                    await anim.sendPacket(
                        this.serverEl,
                        this.clientEl,
                        '← PUBLIC CERT',
                        'packet-cert',
                        { key: 'certPacket' }
                    );
                },
                show: ['certDetail', 'certPacket'],
                hide: ['clientHello', 'helloPacket'],
                persist: []
            }
        ]);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DeclarativeAnimation, AnimationStep, DeclarativeSSLHandshake };
}