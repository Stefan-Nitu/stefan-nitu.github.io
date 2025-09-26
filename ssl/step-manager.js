// Step Manager - Handles automatic cleanup between animation steps
class StepManager {
    constructor(animation) {
        this.animation = animation;
        this.currentStepElements = new Set();
        this.persistentElements = new Set();
        this.stepHistory = [];
    }

    // Register an element created in the current step
    registerElement(element, key) {
        this.currentStepElements.add(element);
        if (key) {
            this.animation.state.store(key, element);
        }
        return element;
    }

    // Mark an element to persist across steps
    markPersistent(element) {
        this.persistentElements.add(element);
        this.currentStepElements.delete(element);
    }

    // Clean up all elements from previous step
    cleanupPreviousStep() {
        for (const element of this.currentStepElements) {
            if (!this.persistentElements.has(element)) {
                // Fade out then remove
                if (element && element.style) {
                    element.style.opacity = '0';
                    element.style.transition = 'opacity 0.3s';

                    // Remove after transition
                    setTimeout(() => {
                        if (element.parentNode) {
                            element.remove();
                        }
                    }, 300);
                }
            }
        }

        // Clear the set for next step
        this.currentStepElements.clear();
    }

    // Execute a step with automatic cleanup
    async executeStep(stepNumber, stepFunction) {
        // Clean up previous step if not first step
        if (this.stepHistory.length > 0 && !this.animation.state.isSteppingMode) {
            this.cleanupPreviousStep();
        }

        // Record this step
        this.stepHistory.push(stepNumber);

        // Check if should stop
        if (this.animation.state.shouldStop) return;

        // Execute the step
        await stepFunction.call(this.animation);

        // Check again after step
        if (this.animation.state.shouldStop) return;
    }

    // Create a detail box that's automatically tracked
    async createDetailBox(content, options = {}) {
        const box = await this.animation.sequence.showDetailBox(content, options);
        this.registerElement(box, options.key);
        return box;
    }

    // Send a packet that's automatically tracked
    async sendPacket(from, to, label, className, options = {}) {
        const packet = await this.animation.sequence.sendPacket(
            from, to, label, className, options
        );
        this.registerElement(packet, options.key);
        return packet;
    }

    // Draw a connection line that's automatically tracked
    async drawConnection(from, to, className, options = {}) {
        const line = await this.animation.sequence.drawConnection(
            from, to, className, options
        );
        this.registerElement(line, options.key);
        return line;
    }

    // Reset the manager
    reset() {
        // Clean up all elements
        const allElements = new Set([
            ...this.currentStepElements,
            ...this.persistentElements
        ]);

        for (const element of allElements) {
            if (element && element.parentNode) {
                element.remove();
            }
        }

        this.currentStepElements.clear();
        this.persistentElements.clear();
        this.stepHistory = [];
    }
}

// Enhanced Base Animation with Step Manager
class ManagedAnimation extends BaseAnimation {
    constructor(stageId, statusId, playBtnId, stepBtnId, resetBtnId) {
        super(stageId, statusId, playBtnId, stepBtnId, resetBtnId);
        this.stepManager = new StepManager(this);
    }

    async executeStep(stepNumber) {
        const stepMethods = this.getStepMethods();

        if (stepMethods[stepNumber]) {
            await this.stepManager.executeStep(
                stepNumber,
                stepMethods[stepNumber]
            );
        }
    }

    // Override in subclasses
    getStepMethods() {
        throw new Error('getStepMethods must be implemented');
    }

    reset() {
        this.stepManager.reset();
        super.reset();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StepManager, ManagedAnimation };
}