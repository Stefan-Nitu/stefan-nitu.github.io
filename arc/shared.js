function updateRefCount(element, newCount, options = {}) {
    if (!element) return;

    element.textContent = newCount;

    if (options.increment) {
        element.classList.add('incrementing');
        setTimeout(() => element.classList.remove('incrementing'), 500);
    }

    if (options.decrement) {
        element.classList.add('decrementing');
        setTimeout(() => element.classList.remove('decrementing'), 500);
    }

    if (newCount === 0) {
        element.classList.add('zero');
        setTimeout(() => element.classList.remove('zero'), 500);
    }
}

function createReference(stage, from, to, type = 'strong', label = '', options = {}) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ref-arrow animation-element');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '50';
    svg.style.opacity = '0';

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const yOffset = options.yOffset || 0;

    const fromX = fromRect.left - stageRect.left + fromRect.width / 2;
    const fromY = fromRect.top - stageRect.top + fromRect.height / 2 + yOffset;
    const toX = toRect.left - stageRect.left + toRect.width / 2;
    const toY = toRect.top - stageRect.top + toRect.height / 2 + yOffset;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const startOffset = 100;
    const endOffset = 100;

    const x1 = fromX + Math.cos(angle) * startOffset;
    const y1 = fromY + Math.sin(angle) * startOffset;
    const x2 = toX - Math.cos(angle) * endOffset;
    const y2 = toY - Math.sin(angle) * endOffset;

    const colors = {
        strong: '#00ffff',
        weak: '#ff00ff',
        unowned: '#ffaa00'
    };

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', `ref-arrow-line ${type}`);

    if (type === 'weak') {
        line.setAttribute('stroke-dasharray', '10,5');
    } else if (type === 'unowned') {
        line.setAttribute('stroke-dasharray', '5,3');
    }

    const arrowSize = 12;
    const arrowAngle = angle;
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = [
        [x2, y2],
        [x2 - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
         y2 - arrowSize * Math.sin(arrowAngle - Math.PI / 6)],
        [x2 - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
         y2 - arrowSize * Math.sin(arrowAngle + Math.PI / 6)]
    ];
    arrow.setAttribute('points', points.map(p => p.join(',')).join(' '));
    arrow.setAttribute('class', 'ref-arrow-head');
    arrow.setAttribute('fill', colors[type]);

    svg.appendChild(line);
    svg.appendChild(arrow);
    stage.appendChild(svg);

    if (label) {
        const labelEl = document.createElement('div');
        labelEl.className = `ref-label ${type} animation-element`;
        labelEl.textContent = label;
        labelEl.style.left = `${(x1 + x2) / 2}px`;
        labelEl.style.top = `${(y1 + y2) / 2 - 20}px`;
        labelEl.style.transform = 'translate(-50%, -50%)';
        labelEl.style.opacity = '0';
        stage.appendChild(labelEl);

        return { arrow: svg, label: labelEl };
    }

    return { arrow: svg };
}

function showElement(element) {
    if (!element) return;

    if (!element.parentNode || element.parentNode.nodeType !== 1) {
        return;
    }

    element.classList.add('show');
    element.style.opacity = '1';
}

function hideElement(element) {
    if (!element) return;

    element.classList.remove('show');
    element.style.opacity = '0';

    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, 500);
}

function showObject(obj) {
    if (!obj) return;
    obj.classList.add('show', 'alive');
}

function markObjectDeallocating(obj) {
    if (!obj) return;
    obj.classList.remove('alive', 'leaked');
    obj.classList.add('deallocating');
}

function markObjectDeallocated(obj) {
    if (!obj) return;
    obj.classList.remove('alive', 'deallocating', 'leaked');
    obj.classList.add('deallocated');
}

function markObjectLeaked(obj) {
    if (!obj) return;
    obj.classList.remove('alive', 'deallocating');
    obj.classList.add('leaked');
}

function createConnectionLine(stage, from, to, className = 'connection-line') {
    const line = document.createElement('div');
    line.className = `${className} animation-element`;

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const fromX = fromRect.left - stageRect.left + fromRect.width / 2;
    const fromY = fromRect.top - stageRect.top + fromRect.height / 2;
    const toX = toRect.left - stageRect.left + toRect.width / 2;
    const toY = toRect.top - stageRect.top + toRect.height / 2;

    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);

    line.style.width = `${length}px`;
    line.style.height = '4px';
    line.style.left = `${fromX}px`;
    line.style.top = `${fromY}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 50%';

    stage.appendChild(line);
    return line;
}