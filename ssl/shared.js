// ===== Configuration Constants =====
const ENTITY_HEIGHT = 120;
const ENTITY_WIDTH = 140;
const PACKET_WIDTH = 120;
const PACKET_HEIGHT = 30;
const DETAIL_BOX_OFFSET = 10;
const ANIMATION_DURATION = 1500;
const SHORT_DELAY = 1000;
const LONG_DELAY = 3000;

// ===== Animation State Management =====
class AnimationState {
    constructor() {
        this.currentStep = 0;
        this.isSteppingMode = false;
        this.isPlaying = false;
        this.shouldStop = false;
        this.elements = {};
        this.playPromise = null; // Track the play promise
    }

    reset() {
        this.currentStep = 0;
        this.elements = {};
        // Don't reset shouldStop here - it's managed by the reset() method
        this.playPromise = null;
    }

    store(key, element) {
        this.elements[key] = element;
    }

    get(key) {
        return this.elements[key];
    }

    hideElement(key) {
        const element = this.elements[key];
        if (element) {
            element.style.opacity = '0';
        }
    }

    removeElement(key) {
        const element = this.elements[key];
        if (element) {
            element.remove();
            delete this.elements[key];
        }
    }

    cleanupPreviousStep() {
        Object.values(this.elements).forEach(el => {
            if (el && el.style && el.style.opacity === '0') {
                el.remove();
            }
        });
    }
}

// ===== Helper Functions =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Make sleep globally available for patching
window.sleep = sleep;

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    const stageRect = element.closest('.stage').getBoundingClientRect();
    return {
        x: rect.left - stageRect.left + rect.width / 2,
        y: rect.top - stageRect.top + rect.height / 2
    };
}

function createDetailBox(innerHTML, options = {}) {
    const box = document.createElement('div');
    box.className = 'detail-box';
    box.innerHTML = innerHTML;

    if (options.border) box.style.border = options.border;
    if (options.background) box.style.background = options.background;
    if (options.position) Object.assign(box.style, options.position);

    return box;
}

function positionBelowElement(element) {
    const pos = getElementCenter(element);
    return {
        top: `${pos.y + ENTITY_HEIGHT/2 + DETAIL_BOX_OFFSET}px`
    };
}

function positionCenterHorizontal() {
    return {
        left: '50%',
        transform: 'translateX(-50%)'
    };
}

function createConnectionLine(stage, fromElement, toElement, className = 'secure-line') {
    const from = getElementCenter(fromElement);
    const to = getElementCenter(toElement);

    const line = document.createElement('div');
    line.className = `connection-line ${className}`;

    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

    line.style.width = `${distance}px`;
    line.style.left = `${from.x}px`;
    line.style.top = `${from.y}px`;
    line.style.transform = `rotate(${angle}deg)`;

    stage.appendChild(line);
    return line;
}

async function createAndMovePacket(stage, text, className, startX, startY, endX, endY, duration = ANIMATION_DURATION) {
    const packet = document.createElement('div');
    packet.className = `packet ${className}`;
    packet.textContent = text;
    packet.style.left = `${startX}px`;
    packet.style.top = `${startY}px`;
    packet.style.position = 'absolute';
    stage.appendChild(packet);

    await sleep(100);
    packet.classList.add('show');

    await sleep(300);
    packet.classList.add('moving');
    packet.style.left = `${endX}px`;
    packet.style.top = `${endY}px`;

    await sleep(duration);
    return packet;
}

async function createAndMovePacketBetweenElements(stage, text, className, fromElement, toElement, duration = ANIMATION_DURATION) {
    const from = getElementCenter(fromElement);
    const to = getElementCenter(toElement);
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const movingRight = from.x < to.x;
    const startX = from.x - PACKET_WIDTH/2;
    const startY = from.y - PACKET_HEIGHT/2;

    let endX;
    if (movingRight) {
        endX = (toRect.left - stageRect.left) - PACKET_WIDTH - 10;
    } else {
        endX = (toRect.right - stageRect.left);
    }
    const endY = to.y - PACKET_HEIGHT/2;

    return createAndMovePacket(stage, text, className, startX, startY, endX, endY, duration);
}

function showPacketTransformation(stage, text, className, nearElement, position = 'below') {
    const packet = document.createElement('div');
    packet.className = `packet ${className} show`;
    packet.textContent = text;
    packet.style.position = 'absolute';

    const elementPos = getElementCenter(nearElement);
    let x = elementPos.x - PACKET_WIDTH/2;
    let y = elementPos.y;

    switch(position) {
        case 'below':
            y = elementPos.y + ENTITY_HEIGHT/2 + 20;
            break;
        case 'above':
            y = elementPos.y - ENTITY_HEIGHT/2 - PACKET_HEIGHT - 20;
            break;
        case 'left':
            x = elementPos.x - PACKET_WIDTH - ENTITY_WIDTH/2 - 20;
            y = elementPos.y - PACKET_HEIGHT/2;
            break;
        case 'right':
            x = elementPos.x + ENTITY_WIDTH/2 + 20;
            y = elementPos.y - PACKET_HEIGHT/2;
            break;
        case 'center':
            y = elementPos.y - PACKET_HEIGHT/2;
            break;
    }

    packet.style.left = `${x}px`;
    packet.style.top = `${y}px`;

    stage.appendChild(packet);
    return packet;
}

// Base Animation Class - FIXED VERSION
class BaseAnimation {
    constructor(stageId, statusId, playBtnId, stepBtnId, resetBtnId) {
        this.state = new AnimationState();
        this.stage = document.getElementById(stageId);
        this.status = document.getElementById(statusId);
        this.playBtn = document.getElementById(playBtnId);
        this.stepBtn = document.getElementById(stepBtnId);
        this.resetBtn = document.getElementById(resetBtnId);

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.playBtn) this.playBtn.addEventListener('click', () => this.play());
        if (this.stepBtn) this.stepBtn.addEventListener('click', () => this.step());
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.reset());
    }

    async play() {
        this.state.isSteppingMode = false;
        this.state.isPlaying = true;
        this.state.shouldStop = false;
        if (this.playBtn) {
            this.playBtn.textContent = '⏸️ Playing...';
            this.playBtn.classList.add('playing');
        }
        if (this.stepBtn) this.stepBtn.disabled = true;

        this.cleanup();
        this.state.reset();

        // Set this as the active animation for sleep interruption
        window.activeAnimation = this;

        // Store the promise so we can wait for it in reset
        this.state.playPromise = this.runAnimation();
        await this.state.playPromise;

        // Only update UI if we weren't stopped
        if (!this.state.shouldStop) {
            if (this.playBtn) {
                this.playBtn.textContent = '▶️ Play Animation';
                this.playBtn.classList.remove('playing');
            }
            if (this.stepBtn) this.stepBtn.disabled = false;
        }

        this.state.isPlaying = false;

        // Clean up the stage after play completes so step can start fresh
        this.cleanup();
        this.state.currentStep = 0;
        this.state.playPromise = null;
        window.activeAnimation = null; // Clear active animation
    }

    async runAnimation() {
        const totalSteps = this.getTotalSteps();
        for (let i = 0; i < totalSteps; i++) {
            if (this.state.shouldStop) {
                break; // Stop immediately when shouldStop is true
            }

            try {
                await this.executeStep(i);
            } catch (e) {
                if (this.state.shouldStop) {
                    break; // Step was interrupted by reset
                }
                throw e; // Re-throw if it wasn't a stop
            }

            if (i < totalSteps - 1 && !this.state.shouldStop) {
                await this.sleepInterruptible(100);
            }
        }
    }

    async sleepInterruptible(ms) {
        const checkInterval = 50; // Check every 50ms
        const endTime = Date.now() + ms;

        while (Date.now() < endTime) {
            if (this.state.shouldStop) {
                return; // Exit immediately if should stop
            }
            const remaining = endTime - Date.now();
            const sleepTime = Math.min(checkInterval, remaining);
            if (sleepTime > 0) {
                await sleep(sleepTime);
            }
        }
    }

    async step() {
        if (this.state.isPlaying) return;

        this.state.isSteppingMode = true;
        if (this.stepBtn) {
            this.stepBtn.disabled = true;
            this.stepBtn.textContent = '⏳ Running...';
        }

        if (this.state.currentStep === 0) {
            this.cleanup();
            this.state.reset();
        } else {
            // Clean up previous step's transient elements
            this.cleanupTransientElements();
        }

        await this.executeStep(this.state.currentStep);
        this.state.currentStep++;

        const totalSteps = this.getTotalSteps();
        if (this.state.currentStep >= totalSteps) {
            if (this.stepBtn) {
                this.stepBtn.disabled = true;
                this.stepBtn.textContent = '✅ Complete';
            }
            // Keep the final step's status message visible, don't overwrite it
        } else if (this.state.currentStep === totalSteps - 1) {
            if (this.stepBtn) {
                this.stepBtn.disabled = false;
                this.stepBtn.textContent = '⏭️ Final Step';
            }
        } else {
            if (this.stepBtn) {
                this.stepBtn.disabled = false;
                this.stepBtn.textContent = '⏭️ Next Step';
            }
        }
    }

    async reset() {
        // Signal animation to stop
        this.state.shouldStop = true;

        // Wait for any running animation to complete
        if (this.state.playPromise) {
            await this.state.playPromise;
        }

        // Now safe to clean up
        this.cleanup();
        this.state.reset();

        // Reset UI
        if (this.playBtn) {
            this.playBtn.textContent = '▶️ Play Animation';
            this.playBtn.classList.remove('playing');
        }
        if (this.stepBtn) {
            this.stepBtn.disabled = false;
            this.stepBtn.textContent = '⏭️ Next Step';
        }
        this.status.textContent = this.getInitialStatusText();

        // Clear playing state
        this.state.isPlaying = false;
        this.state.isSteppingMode = false;

        // Clear shouldStop last
        this.state.shouldStop = false;
    }

    cleanup() {
        this.stage.querySelectorAll('.packet, .connection-line, .detail-box, .animation-element').forEach(el => el.remove());
    }

    cleanupTransientElements() {
        // Remove transient elements: packets, detail boxes, connection lines
        // But keep persistent elements (handled by subclasses)
        this.stage.querySelectorAll('.packet, .detail-box, .connection-line').forEach(el => {
            // Don't remove if marked as persistent
            if (!el.classList.contains('persistent')) {
                el.remove();
            }
        });
    }

    // Override these in subclasses
    getTotalSteps() {
        throw new Error('getTotalSteps must be implemented');
    }

    async executeStep(stepNumber) {
        throw new Error('executeStep must be implemented');
    }

    getInitialStatusText() {
        return 'Click Play to start the animation';
    }
}