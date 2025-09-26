// ===== Timing Configuration System =====
class AnimationTiming {
    constructor(mode = 'normal') {
        this.modes = {
            fast: {
                ANIMATION_DURATION: 800,
                SHORT_DELAY: 500,
                LONG_DELAY: 1500,
                PACKET_TRAVEL: 800
            },
            normal: {
                ANIMATION_DURATION: 1500,
                SHORT_DELAY: 1000,
                LONG_DELAY: 3000,
                PACKET_TRAVEL: 1500
            },
            slow: {
                ANIMATION_DURATION: 2500,
                SHORT_DELAY: 1500,
                LONG_DELAY: 4500,
                PACKET_TRAVEL: 2500
            },
            step: {
                ANIMATION_DURATION: 0,
                SHORT_DELAY: 0,
                LONG_DELAY: 0,
                PACKET_TRAVEL: 500
            }
        };

        this.setMode(mode);
    }

    setMode(mode) {
        const config = this.modes[mode] || this.modes.normal;
        Object.assign(this, config);
        this.currentMode = mode;
    }

    getDelay(type) {
        switch(type) {
            case 'short': return this.SHORT_DELAY;
            case 'long': return this.LONG_DELAY;
            case 'animation': return this.ANIMATION_DURATION;
            case 'packet': return this.PACKET_TRAVEL;
            default: return this.SHORT_DELAY;
        }
    }
}

// ===== Animation Configuration =====
const AnimationConfig = {
    // Visual settings
    ENTITY_HEIGHT: 120,
    ENTITY_WIDTH: 140,
    PACKET_WIDTH: 120,
    PACKET_HEIGHT: 30,
    DETAIL_BOX_OFFSET: 10,

    // Standardized positioning zones
    positions: {
        topInfo: { top: '80px' },
        mainInfo: { top: '350px' },
        bottomInfo: { top: '480px' },
        clientSide: { left: '50px' },
        serverSide: { right: '50px' },
        center: { left: '50%', transform: 'translateX(-50%)' }
    },

    // Color schemes
    colors: {
        ssl: {
            primary: '#00ffff',
            secondary: '#00ff00',
            accent: '#ffd700',
            secure: '#00ff00'
        },
        attack: {
            primary: '#ff0000',
            secondary: '#ff6b6b',
            warning: '#ffff00',
            fake: '#ff00ff'
        },
        pinning: {
            primary: '#00ffff',
            secondary: '#00ff00',
            blocked: '#ff0000',
            shield: '#ffd700'
        }
    },

    // Animation step descriptions
    steps: {
        ssl: [
            'SETUP: CERTIFICATE PAIRS',
            'CLIENT HELLO',
            'SERVER SENDS PUBLIC CERTIFICATE',
            'iOS VALIDATES CERTIFICATE INTERNALLY',
            'ENCRYPT WITH PUBLIC KEY',
            'SESSION KEYS'
        ],
        mitm: [
            'SETUP: SAME NETWORK',
            'ATTACKER WITH OWN CERT PAIR',
            'INTERCEPT CLIENT HELLO',
            'ATTACKER SENDS TWO DIFFERENT PUBLIC CERTS',
            'DECRYPT & RE-ENCRYPT',
            'TOTAL BREACH'
        ],
        pinning: [
            'SETUP: CERTIFICATE PINNING',
            'ATTACKER HAS DIFFERENT CERT',
            'ATTACKER SENDS FAKE CERT',
            'FINGERPRINT MISMATCH!',
            'CONNECTION BLOCKED!',
            'REAL CERT WORKS!'
        ]
    },

    // Default animation options
    defaults: {
        detailBox: {
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #00ffff',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '11px',
            color: 'white',
            zIndex: 80,
            lineHeight: 1.4,
            maxWidth: '250px'
        },
        packet: {
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 60,
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
            maxWidth: '180px'
        }
    }
};

// ===== Enhanced State Management =====
class EnhancedAnimationState extends AnimationState {
    constructor() {
        super();
        this.timing = new AnimationTiming('normal');
        this.elementGroups = {};
        this.persistentElements = new Set();
    }

    reset() {
        super.reset();  // Reset base properties
        // Reset enhanced properties
        this.elementGroups = {};
        this.persistentElements = new Set();
        // Keep timing settings - they shouldn't reset
    }

    storeGroup(groupName, elements) {
        this.elementGroups[groupName] = elements;
        elements.forEach(el => this.store(`${groupName}_${elements.indexOf(el)}`, el));
    }

    hideGroup(groupName) {
        const group = this.elementGroups[groupName];
        if (group) {
            group.forEach(el => {
                if (el && el.style) el.style.opacity = '0';
            });
        }
    }

    removeGroup(groupName) {
        const group = this.elementGroups[groupName];
        if (group) {
            group.forEach(el => {
                if (el && !this.persistentElements.has(el)) {
                    el.remove();
                }
            });
            delete this.elementGroups[groupName];
        }
    }

    markPersistent(element) {
        this.persistentElements.add(element);
    }

    cleanupNonPersistent() {
        Object.values(this.elements).forEach(el => {
            if (el && !this.persistentElements.has(el) && el.style?.opacity === '0') {
                el.remove();
            }
        });
    }

    setTimingMode(mode) {
        this.timing.setMode(mode);
    }

    getDelay(type) {
        return this.timing.getDelay(type);
    }

    async sleep(ms) {
        // Interruptible sleep that checks shouldStop
        const checkInterval = 50;
        const endTime = Date.now() + ms;

        while (Date.now() < endTime) {
            if (this.shouldStop) {
                throw new Error('Animation cancelled');
            }
            const remaining = endTime - Date.now();
            const sleepTime = Math.min(checkInterval, remaining);
            if (sleepTime > 0) {
                await new Promise(resolve => setTimeout(resolve, sleepTime));
            }
        }
    }
}