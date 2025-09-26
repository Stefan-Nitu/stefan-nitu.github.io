// ===== Animation Sequences and Patterns =====
class AnimationSequence {
    constructor(stage, state) {
        this.stage = stage;
        this.state = state;
        this.zoneElements = new Map();
    }

    // Hide previous elements at the same zone
    clearZoneElements(zone) {
        const existing = this.zoneElements.get(zone) || [];
        existing.forEach(el => {
            if (el && el.style && el.parentNode) {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    if (el.parentNode) {
                        el.remove();
                    }
                }, 300);
            }
        });
        this.zoneElements.set(zone, []);
    }

    getStandardPosition(zone) {
        const positions = {
            'top-center': { ...AnimationConfig.positions.topInfo, ...AnimationConfig.positions.center },
            'main-center': { ...AnimationConfig.positions.mainInfo, ...AnimationConfig.positions.center },
            'main-left': { ...AnimationConfig.positions.mainInfo, ...AnimationConfig.positions.clientSide },
            'main-right': { ...AnimationConfig.positions.mainInfo, ...AnimationConfig.positions.serverSide },
            'bottom-center': { ...AnimationConfig.positions.bottomInfo, ...AnimationConfig.positions.center },
            'bottom-left': { ...AnimationConfig.positions.bottomInfo, ...AnimationConfig.positions.clientSide },
            'bottom-right': { ...AnimationConfig.positions.bottomInfo, ...AnimationConfig.positions.serverSide }
        };
        return positions[zone] || AnimationConfig.positions.center;
    }

    async showDetailBox(content, options = {}) {
        if (options.zone) {
            options.position = this.getStandardPosition(options.zone);

            // In stepping mode, clear previous elements at same zone
            if (this.state.isSteppingMode) {
                this.clearZoneElements(options.zone);
            }
        }

        const box = createDetailBox(content, options);
        this.stage.appendChild(box);

        if (options.zone && this.state.isSteppingMode) {
            // Track this element at its zone
            const zoneList = this.zoneElements.get(options.zone) || [];
            zoneList.push(box);
            this.zoneElements.set(options.zone, zoneList);
        }

        if (options.key) {
            this.state.store(options.key, box);
        }

        if (options.duration && !this.state.isSteppingMode) {
            await sleep(options.duration);
            box.style.opacity = '0';
        }

        return box;
    }

    async sendPacket(from, to, label, className = 'packet-plain', options = {}) {
        const packet = await createAndMovePacketBetweenElements(
            this.stage,
            label,
            className,
            from,
            to,
            options.duration !== undefined ? options.duration : this.state.getDelay('animation')
        );

        if (options.key) {
            this.state.store(options.key, packet);
        }

        if (options.transform) {
            await options.transform(packet);
        }

        if (options.autoHide && !this.state.isSteppingMode) {
            await sleep(options.hideDelay !== undefined ? options.hideDelay : this.state.getDelay('short'));
            packet.style.opacity = '0';
        }

        return packet;
    }

    async drawConnection(from, to, className = 'secure-line', options = {}) {
        const line = createConnectionLine(this.stage, from, to, className);

        if (options.style) {
            Object.assign(line.style, options.style);
        }

        if (options.key) {
            this.state.store(options.key, line);
        }

        await sleep(100);
        line.classList.add('show');

        if (options.autoHide && !this.state.isSteppingMode) {
            await sleep(options.hideDelay !== undefined ? options.hideDelay : this.state.getDelay('animation'));
            line.style.opacity = '0';
        }

        return line;
    }

    async showTransformation(nearElement, label, className, position = 'below', options = {}) {
        const transformed = showPacketTransformation(
            this.stage,
            label,
            className,
            nearElement,
            position
        );

        if (options.style) {
            Object.assign(transformed.style, options.style);
        }

        if (options.key) {
            this.state.store(options.key, transformed);
        }

        if (options.autoHide && !this.state.isSteppingMode) {
            await sleep(options.hideDelay !== undefined ? options.hideDelay : this.state.getDelay('short'));
            transformed.style.opacity = '0';
        }

        return transformed;
    }

    async pulseElement(element, options = {}) {
        const originalAnimation = element.style.animation;
        const originalBoxShadow = element.style.boxShadow;

        element.style.animation = options.animation || 'pulse 1s';
        if (options.boxShadow) {
            element.style.boxShadow = options.boxShadow;
        }

        await sleep(options.duration !== undefined ? options.duration : this.state.getDelay('animation'));

        if (options.reset !== false) {
            element.style.animation = originalAnimation;
            element.style.boxShadow = originalBoxShadow;
        }

        return element;
    }

    cleanupStep() {
        // In stepping mode, do NOT cleanup - we want to see all elements accumulate
        if (!this.state.isSteppingMode) {
            this.state.cleanupPreviousStep();
        }
    }
}

// ===== Certificate Animation Patterns =====
class CertificateAnimationPatterns {
    constructor(sequence) {
        this.sequence = sequence;
    }

    async showCertificatePair(element, options = {}) {
        const colors = options.colors || { public: '#00ff00', private: '#ff00ff' };
        const label = options.label || 'Certificate Pair';

        return await this.sequence.showDetailBox(`
            <strong style="color: #ffff00">🔑 ${label}:</strong><br>
            <br>
            <span style="color: ${colors.public}">PUBLIC Certificate:</span><br>
            • Can be shared with everyone<br>
            • Contains public key<br>
            • Used to encrypt TO server<br>
            <br>
            <span style="color: ${colors.private}">PRIVATE Key:</span><br>
            • NEVER shared, kept secret!<br>
            • Used to decrypt messages<br>
            • Only server has this
        `, {
            ...options,
            border: options.border || `2px solid #ffff00`,
            position: options.position || {
                right: '50px',
                ...positionBelowElement(element)
            }
        });
    }

    async showCertificateValidation(element, options = {}) {
        const status = options.status || 'valid';
        const colors = {
            valid: '#00ff00',
            invalid: '#ff0000',
            checking: '#ffff00'
        };

        return await this.sequence.showDetailBox(`
            <strong style="color: ${colors[status]}">📱 Certificate Validation:</strong><br>
            <br>
            ${options.content || this.getValidationContent(status)}
        `, {
            ...options,
            border: `2px solid ${colors[status]}`,
            position: options.position || {
                left: '50px',
                ...positionBelowElement(element)
            }
        });
    }

    getValidationContent(status) {
        const contents = {
            valid: `
                ✅ Certificate Valid<br>
                • Signature verified<br>
                • Trusted CA confirmed<br>
                • Domain matches
            `,
            invalid: `
                ❌ Certificate Invalid<br>
                • Signature mismatch<br>
                • Unknown CA<br>
                • Domain doesn't match
            `,
            checking: `
                🔍 Checking Certificate<br>
                • Verifying signature...<br>
                • Checking CA trust...<br>
                • Validating domain...
            `
        };
        return contents[status] || contents.checking;
    }
}

// ===== Attack Animation Patterns =====
class AttackAnimationPatterns {
    constructor(sequence) {
        this.sequence = sequence;
    }

    async showAttackerAppearing(attackerEl, options = {}) {
        attackerEl.classList.add('show');

        if (options.showKeys) {
            const keysEl = attackerEl.querySelector('.key-pair-visual');
            if (keysEl) keysEl.style.display = 'block';
        }

        if (options.description) {
            return await this.sequence.showDetailBox(options.description, {
                ...options,
                border: options.border || '2px solid #ff0000',
                position: options.position || {
                    left: '50%',
                    transform: 'translateX(-50%)',
                    ...positionBelowElement(attackerEl)
                }
            });
        }
    }

    async showInterception(from, to, attacker, options = {}) {
        const packet = await this.sequence.sendPacket(
            from,
            attacker,
            options.label || 'Intercepted →',
            options.className || 'packet-plain',
            { duration: options.duration }
        );

        await sleep(500);
        packet.style.opacity = '0';

        return await this.sequence.showTransformation(
            attacker,
            '🔴 INTERCEPTED!',
            'packet-fake',
            'below',
            { key: options.key, autoHide: options.autoHide }
        );
    }

    async showDecryptionAttack(attackerEl, data, options = {}) {
        const decryptBox = document.createElement('div');
        decryptBox.className = 'detail-box';
        decryptBox.style.background = 'rgba(10, 10, 15, 0.95)';
        decryptBox.style.border = '2px solid #ff0000';
        decryptBox.innerHTML = `
            <strong>🔓 DECRYPTING</strong><br>
            Using: Attacker's PRIVATE key<br>
            <br>
            Result: <span style="color: #ffff00">${data}</span>
        `;

        const attackerPos = getElementCenter(attackerEl);
        decryptBox.style.left = `${attackerPos.x - 100}px`;
        decryptBox.style.top = `${attackerPos.y + 60}px`;
        this.sequence.stage.appendChild(decryptBox);

        if (options.key) {
            this.sequence.state.store(options.key, decryptBox);
        }

        return decryptBox;
    }
}

// ===== Pinning Animation Patterns =====
class PinningAnimationPatterns {
    constructor(sequence) {
        this.sequence = sequence;
    }

    async showPinningConcept(element, options = {}) {
        return await this.sequence.showDetailBox(`
            <strong style="color: #00ffff">📌 Certificate Pinning:</strong><br>
            <br>
            <strong>iOS App Code:</strong><br>
            <code style="color: #00ff00; font-family: monospace; font-size: 10px">
            let pinnedCerts = {<br>
            &nbsp;&nbsp;"${options.domain || 'api.example.com'}": {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;sha256: "${options.fingerprint || 'AAAA1234...'}"<br>
            &nbsp;&nbsp;}<br>
            }<br>
            </code>
            <br>
            <span style="color: #ffff00">Hardcoded = Can't be faked!</span>
        `, {
            ...options,
            border: options.border || '3px solid #00ffff',
            position: options.position || {
                left: '50px',
                ...positionBelowElement(element)
            }
        });
    }

    async showFingerprintComparison(received, expected, options = {}) {
        const match = received === expected;

        return await this.sequence.showDetailBox(`
            <h3 style="color: #ffff00; margin-bottom: 10px;">Certificate Comparison:</h3>
            <div style="display: flex; gap: 20px;">
                <div>
                    <strong style="color: #ff0000">Received:</strong><br>
                    SHA256: ${received} ${match ? '✓' : '❌'}
                </div>
                <div>
                    <strong style="color: #00ff00">Expected:</strong><br>
                    SHA256: ${expected} ✓
                </div>
            </div>
            <div style="font-size: 20px; margin-top: 10px; color: ${match ? '#00ff00' : '#ff0000'}; text-align: center;">
                ${match ? '✅ CERTIFICATES MATCH!' : '❌ CERTIFICATES DON\'T MATCH!'}
            </div>
        `, {
            ...options,
            background: 'rgba(10, 10, 15, 0.95)',
            border: `3px solid ${match ? '#00ff00' : '#ffff00'}`,
            position: options.position || {
                left: '50%',
                transform: 'translateX(-50%)',
                top: '300px'
            }
        });
    }

    async showConnectionBlocked(element, options = {}) {
        const blockSign = document.createElement('div');
        blockSign.style.position = 'absolute';
        blockSign.style.fontSize = '80px';
        blockSign.style.left = '50%';
        blockSign.style.top = '100px';
        blockSign.style.transform = 'translateX(-50%)';
        blockSign.style.zIndex = '70';
        blockSign.textContent = '🚫';
        blockSign.style.animation = 'pulse 1s infinite';
        this.sequence.stage.appendChild(blockSign);

        if (options.signKey) {
            this.sequence.state.store(options.signKey, blockSign);
        }

        const detail = await this.sequence.showDetailBox(`
            <strong style="color: #ff0000">CONNECTION BLOCKED!</strong><br>
            <br>
            App throws error:<br>
            <code style="color: #ff6b6b; font-family: monospace; font-size: 10px">
            ${options.errorMessage || `SSLPinningError:<br>
            Certificate fingerprint<br>
            does not match pinned<br>
            certificate`}<br>
            </code>
            <br>
            <span style="color: #ffff00">${options.resultMessage || 'Attack prevented!'}</span>
        `, {
            ...options,
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #ff0000',
            position: options.position || {
                left: '50%',
                transform: 'translateX(-50%)',
                ...positionBelowElement(element)
            }
        });

        return { blockSign, detail };
    }
}