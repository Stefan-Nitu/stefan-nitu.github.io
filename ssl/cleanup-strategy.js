// Cleanup Strategy for Step-by-Step Mode
// Problem: Elements overlap at same positions making them unreadable
// Solution: Hide previous elements at same zones when new ones appear

class SmartCleanupStrategy {
    constructor() {
        this.zoneElements = new Map();
    }

    registerElement(element, zone) {
        if (!zone) return;

        // Get existing elements at this zone
        const existing = this.zoneElements.get(zone) || [];

        // Hide previous elements at same zone
        existing.forEach(el => {
            if (el && el.style) {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.3s';

                // Remove after transition
                setTimeout(() => {
                    if (el.parentNode) {
                        el.remove();
                    }
                }, 300);
            }
        });

        // Clear the zone list and add new element
        this.zoneElements.set(zone, [element]);
    }

    clearZone(zone) {
        const existing = this.zoneElements.get(zone) || [];
        existing.forEach(el => {
            if (el && el.style) {
                el.style.opacity = '0';
                setTimeout(() => {
                    if (el.parentNode) {
                        el.remove();
                    }
                }, 300);
            }
        });
        this.zoneElements.delete(zone);
    }

    clearAll() {
        this.zoneElements.forEach((elements, zone) => {
            this.clearZone(zone);
        });
        this.zoneElements.clear();
    }
}

// Consistent dark background for all detail boxes
const STANDARD_BACKGROUND = 'rgba(10, 10, 15, 0.95)';

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SmartCleanupStrategy, STANDARD_BACKGROUND };
}