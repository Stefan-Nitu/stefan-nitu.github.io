// Reusable Visual Elements with Good Contrast
class VisualElements {
    static createCertTag(type = 'PUBLIC', options = {}) {
        const tag = document.createElement('div');
        tag.className = 'cert-tag ' + (options.className || '');

        const styles = {
            PUBLIC: {
                background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                border: '2px solid #00ff00',
                color: '#000000',
                boxShadow: '0 0 10px rgba(0,255,0,0.5)'
            },
            PRIVATE: {
                background: 'linear-gradient(135deg, #ff00ff, #cc00cc)',
                border: '2px solid #ff00ff',
                color: '#ffffff',
                boxShadow: '0 0 10px rgba(255,0,255,0.5)'
            },
            FAKE: {
                background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                border: '2px solid #ff0000',
                color: '#ffffff',
                boxShadow: '0 0 10px rgba(255,0,0,0.5)'
            }
        };

        const style = styles[type] || styles.PUBLIC;

        tag.style.cssText = `
            position: ${options.position || 'absolute'};
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: bold;
            font-size: ${options.fontSize || '14px'};
            z-index: ${options.zIndex || '10'};
            transition: all 0.3s ease;
            background: ${style.background};
            border: ${style.border};
            color: ${style.color};
            box-shadow: ${style.boxShadow};
            ${options.additionalStyles || ''}
        `;

        tag.innerHTML = `
            <span class="cert-icon">${type === 'PRIVATE' ? '🔒' : '📜'}</span>
            <span class="cert-label">${type}</span>
        `;

        return tag;
    }

    static createInfoBox(content, options = {}) {
        const box = document.createElement('div');
        box.className = 'info-box ' + (options.className || '');

        const themes = {
            success: {
                background: 'rgba(0, 40, 20, 0.95)',
                border: '2px solid #00ff00',
                headerColor: '#00ff88',
                textColor: '#ffffff'
            },
            warning: {
                background: 'rgba(40, 40, 0, 0.95)',
                border: '2px solid #ffff00',
                headerColor: '#ffff00',
                textColor: '#ffffff'
            },
            danger: {
                background: 'rgba(40, 0, 0, 0.95)',
                border: '2px solid #ff0000',
                headerColor: '#ff6666',
                textColor: '#ffffff'
            },
            info: {
                background: 'rgba(0, 20, 40, 0.95)',
                border: '2px solid #00ffff',
                headerColor: '#00ffff',
                textColor: '#ffffff'
            },
            neutral: {
                background: 'rgba(20, 20, 20, 0.95)',
                border: '2px solid #888888',
                headerColor: '#cccccc',
                textColor: '#ffffff'
            }
        };

        const theme = themes[options.theme || 'info'];

        box.style.cssText = `
            position: absolute;
            padding: 16px;
            border-radius: 12px;
            max-width: ${options.maxWidth || '280px'};
            z-index: ${options.zIndex || '80'};
            background: ${theme.background};
            border: ${theme.border};
            color: ${theme.textColor};
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
            line-height: 1.6;
            font-size: ${options.fontSize || '13px'};
            ${options.additionalStyles || ''}
        `;

        // Process content to apply header color
        box.innerHTML = content.replace(
            /<strong>/g,
            `<strong style="color: ${theme.headerColor}; font-size: 14px;">`
        );

        return box;
    }

    static createPacket(label, options = {}) {
        const packet = document.createElement('div');
        packet.className = 'packet ' + (options.className || '');

        const types = {
            plain: {
                background: 'linear-gradient(135deg, #666666, #444444)',
                border: '2px solid #888888',
                color: '#ffffff'
            },
            encrypted: {
                background: 'linear-gradient(135deg, #0066ff, #0044cc)',
                border: '2px solid #0088ff',
                color: '#ffffff'
            },
            cert: {
                background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                border: '2px solid #00ff00',
                color: '#000000'
            },
            fake: {
                background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                border: '2px solid #ff0000',
                color: '#ffffff'
            },
            warning: {
                background: 'linear-gradient(135deg, #ffaa00, #ff8800)',
                border: '2px solid #ffcc00',
                color: '#000000'
            }
        };

        const type = types[options.type || 'plain'];

        packet.style.cssText = `
            position: absolute;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: ${options.fontSize || '14px'};
            text-align: center;
            min-width: ${options.minWidth || '120px'};
            z-index: 60;
            background: ${type.background};
            border: ${type.border};
            color: ${type.color};
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            ${options.additionalStyles || ''}
        `;

        packet.textContent = label;
        return packet;
    }

    static createConnectionLine(from, to, options = {}) {
        const line = document.createElement('div');
        line.className = 'connection-line ' + (options.className || '');

        const styles = {
            secure: {
                border: '3px solid #00ff00',
                boxShadow: '0 0 10px rgba(0,255,0,0.5)'
            },
            insecure: {
                border: '3px dashed #ff0000',
                boxShadow: '0 0 10px rgba(255,0,0,0.5)'
            },
            neutral: {
                border: '2px solid #888888',
                boxShadow: '0 0 5px rgba(128,128,128,0.3)'
            },
            fake: {
                border: '3px dotted #ff00ff',
                boxShadow: '0 0 10px rgba(255,0,255,0.5)'
            }
        };

        const style = styles[options.type || 'neutral'];

        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();
        const stage = from.closest('.stage');
        const stageRect = stage.getBoundingClientRect();

        const x1 = fromRect.left - stageRect.left + fromRect.width / 2;
        const y1 = fromRect.top - stageRect.top + fromRect.height / 2;
        const x2 = toRect.left - stageRect.left + toRect.width / 2;
        const y2 = toRect.top - stageRect.top + toRect.height / 2;

        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        line.style.cssText = `
            position: absolute;
            width: ${distance}px;
            height: 0;
            left: ${x1}px;
            top: ${y1}px;
            transform-origin: left center;
            transform: rotate(${angle}deg);
            border-top: ${style.border};
            box-shadow: ${style.boxShadow};
            transition: opacity 0.3s ease;
            z-index: 40;
            ${options.additionalStyles || ''}
        `;

        return line;
    }

    static applyHighContrastTheme(element) {
        // Ensure text is readable on any background
        const bgColor = window.getComputedStyle(element).backgroundColor;
        const rgb = bgColor.match(/\d+/g);

        if (rgb) {
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

            if (brightness > 128) {
                // Light background - use dark text
                element.style.color = '#000000';
                element.style.textShadow = '0 0 2px rgba(255,255,255,0.5)';
            } else {
                // Dark background - use light text
                element.style.color = '#ffffff';
                element.style.textShadow = '0 0 2px rgba(0,0,0,0.5)';
            }
        }
    }

    static createStatusIndicator(status, options = {}) {
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator ' + (options.className || '');

        const statuses = {
            success: { icon: '✅', color: '#00ff00', bg: 'rgba(0,255,0,0.2)' },
            error: { icon: '❌', color: '#ff0000', bg: 'rgba(255,0,0,0.2)' },
            warning: { icon: '⚠️', color: '#ffff00', bg: 'rgba(255,255,0,0.2)' },
            info: { icon: 'ℹ️', color: '#00ffff', bg: 'rgba(0,255,255,0.2)' },
            loading: { icon: '⏳', color: '#ffffff', bg: 'rgba(128,128,128,0.2)' },
            blocked: { icon: '🚫', color: '#ff0000', bg: 'rgba(255,0,0,0.2)' },
            secure: { icon: '🔒', color: '#00ff00', bg: 'rgba(0,255,0,0.2)' },
            insecure: { icon: '🔓', color: '#ff0000', bg: 'rgba(255,0,0,0.2)' }
        };

        const statusInfo = statuses[status] || statuses.info;

        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: ${options.fontSize || '16px'};
            background: ${statusInfo.bg};
            border: 2px solid ${statusInfo.color};
            color: ${statusInfo.color};
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ${options.additionalStyles || ''}
        `;

        indicator.innerHTML = `
            <span class="status-icon" style="font-size: 20px;">${statusInfo.icon}</span>
            <span class="status-text">${options.text || status.toUpperCase()}</span>
        `;

        return indicator;
    }
}

// Export for use in animations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualElements;
}