// Minimal utility functions for TLS animations

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    const stageRect = element.closest('.stage').getBoundingClientRect();
    return {
        x: rect.left - stageRect.left + rect.width / 2,
        y: rect.top - stageRect.top + rect.height / 2
    };
}

function createConnectionLine(stage, fromElement, toElement, className = 'secure-line') {
    const from = getElementCenter(fromElement);
    const to = getElementCenter(toElement);

    const line = document.createElement('div');
    line.className = `connection-line ${className}`;

    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

    line.style.cssText = `
        position: absolute;
        width: ${distance}px;
        left: ${from.x}px;
        top: ${from.y}px;
        transform-origin: 0 50%;
        transform: rotate(${angle}deg);
    `;

    stage.appendChild(line);
    return line;
}

function positionBelowElement(element) {
    const rect = element.getBoundingClientRect();
    const stageRect = element.closest('.stage').getBoundingClientRect();
    return {
        top: `${rect.bottom - stageRect.top + 20}px`,
        left: `${rect.left - stageRect.left}px`
    };
}

function showPacketTransformation(stage, text, className, nearElement, position = 'below') {
    const packet = document.createElement('div');
    packet.className = `packet ${className}`;
    packet.innerHTML = text;

    const rect = nearElement.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    let top, left;

    if (position === 'below') {
        top = rect.bottom - stageRect.top + 10;
        left = rect.left - stageRect.left + rect.width / 2 - 85;
    } else if (position === 'center') {
        top = rect.top - stageRect.top + rect.height / 2 - 15;
        left = rect.left - stageRect.left + rect.width / 2 - 110;
    } else {
        top = rect.top - stageRect.top - 40;
        left = rect.left - stageRect.left + rect.width / 2 - 85;
    }

    packet.style.cssText = `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        z-index: 65;
        opacity: 0;
        transform: scale(0);
    `;

    stage.appendChild(packet);

    setTimeout(() => {
        packet.style.transition = 'all 0.3s ease';
        packet.style.opacity = '1';
        packet.style.transform = 'scale(1)';
    }, 50);

    return packet;
}

// Make functions globally available
window.sleep = sleep;
window.positionBelowElement = positionBelowElement;
window.showPacketTransformation = showPacketTransformation;
window.getElementCenter = getElementCenter;
window.createConnectionLine = createConnectionLine;