class RetainCycleAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('cycle-stage');
        const status = document.getElementById('cycle-status');
        super(stage, status);

        this.parent = document.getElementById('cycle-parent');
        this.child = document.getElementById('cycle-child');
        this.parentCount = document.getElementById('cycle-parent-count');
        this.childCount = document.getElementById('cycle-child-count');

        this.setupButtons('cycle-play', 'cycle-step', 'cycle-reset');

        this.onReset = () => {
            this.parent.className = 'arc-object';
            this.child.className = 'arc-object';
            this.parentCount.textContent = '0';
            this.childCount.textContent = '0';
            this.parentCount.className = 'ref-count';
            this.childCount.className = 'ref-count';
            this.statusEl.textContent = 'See how two objects can keep each other alive forever';
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>CREATING PARENT OBJECT</strong> - Parent instance created',
                create: async (anim) => {
                    showObject(this.parent);
                    await anim.sleep(500);
                    updateRefCount(this.parentCount, 1, { increment: true });

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">Parent Created</strong><br><br>
                        <code>let parent = Parent()</code><br><br>
                        • Parent object allocated<br>
                        • refCount: 1<br>
                        • Has a <code>child</code> property
                    `, {
                        key: 'parentCreate',
                        style: { border: '2px solid #00ff88' },
                        position: { left: '50px', top: '450px' }
                    });
                },
                show: ['parentCreate'],
                persist: []
            },
            {
                status: '<strong>CREATING CHILD OBJECT</strong> - Child instance created',
                create: async (anim) => {
                    showObject(this.child);
                    await anim.sleep(500);
                    updateRefCount(this.childCount, 1, { increment: true });

                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">Child Created</strong><br><br>
                        <code>let child = Child()</code><br><br>
                        • Child object allocated<br>
                        • refCount: 1<br>
                        • Has a <code>parent</code> property
                    `, {
                        key: 'childCreate',
                        style: { border: '2px solid #00ffff' },
                        position: { right: '50px', top: '450px' }
                    });
                },
                show: ['childCreate'],
                hide: ['parentCreate'],
                persist: []
            },
            {
                status: '<strong>PARENT → CHILD (STRONG)</strong> - Parent holds strong reference to Child',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">Parent References Child</strong><br><br>
                        <code>parent.child = child</code><br><br>
                        • Parent now holds Child<br>
                        • Strong reference created<br>
                        • Child refCount: 1 → 2
                    `, {
                        key: 'parentToChild',
                        style: { border: '2px solid #00ffff' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);

                    const refs = createReference(this.stage, this.parent, this.child, 'strong', 'strong', { yOffset: -20 });
                    refs.arrow.classList.add('show');
                    if (refs.label) refs.label.style.opacity = '1';
                    anim.registerElement('parentToChildArrow', refs.arrow);
                    if (refs.label) anim.registerElement('parentToChildLabel', refs.label);

                    await anim.sleep(500);
                    updateRefCount(this.childCount, 2, { increment: true });
                },
                show: ['parentToChild', 'parentToChildArrow', 'parentToChildLabel'],
                hide: ['childCreate'],
                persist: []
            },
            {
                status: '<strong>CHILD → PARENT (STRONG)</strong> - Child holds strong reference to Parent - CYCLE FORMED! ⚠️',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">⚠️ Child References Parent</strong>
                        <br><br>
                        <code>child.parent = parent</code>
                        <br><br>
                        • Child now holds Parent<br>
                        • Strong reference created<br>
                        • Parent refCount: 1 → 2
                        <br><br>
                        <strong style="color: #ffff00">🔥 RETAIN CYCLE FORMED!</strong>
                    `, {
                        key: 'childToParent',
                        style: {
                            border: '3px solid #ff4444',
                            background: 'rgba(255, 68, 68, 0.2)'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);

                    const refs = createReference(this.stage, this.child, this.parent, 'strong', 'strong', { yOffset: 20 });
                    refs.arrow.classList.add('show');
                    if (refs.label) refs.label.style.opacity = '1';
                    anim.registerElement('childToParentArrow', refs.arrow);
                    if (refs.label) anim.registerElement('childToParentLabel', refs.label);

                    await anim.sleep(500);
                    updateRefCount(this.parentCount, 2, { increment: true });
                },
                show: ['childToParent', 'childToParentArrow', 'childToParentLabel'],
                hide: ['parentToChild'],
                persist: ['parentToChildArrow', 'parentToChildLabel']
            },
            {
                status: '<strong>REMOVING EXTERNAL REFERENCES</strong> - Variables go out of scope, but...',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffaa00">External Refs Removed</strong><br><br>
                        <code>parent = nil</code><br>
                        <code>child = nil</code><br><br>
                        Variables go out of scope...<br><br>
                        • Parent: 2 → 1<br>
                        • Child: 2 → 1<br><br>
                        <strong>But they still reference each other!</strong>
                    `, {
                        key: 'removeExternal',
                        style: { border: '2px solid #ffaa00' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    updateRefCount(this.parentCount, 1, { decrement: true });
                    await anim.sleep(300);
                    updateRefCount(this.childCount, 1, { decrement: true });
                },
                show: ['removeExternal'],
                hide: ['childToParent'],
                persist: ['parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel']
            },
            {
                status: '🚨 <strong>MEMORY LEAK!</strong> - Objects can never be deallocated',
                create: async (anim) => {
                    await anim.sleep(500);
                    markObjectLeaked(this.parent);
                    markObjectLeaked(this.child);

                    const warningParent = document.createElement('div');
                    warningParent.className = 'warning-badge animation-element';
                    warningParent.textContent = '⚠️';
                    warningParent.style.cssText = `
                        position: absolute;
                        left: 20%;
                        top: 220px;
                        transform: translate(-50%, -50%);
                    `;
                    this.stage.appendChild(warningParent);
                    anim.registerElement('warningParent', warningParent);

                    const warningChild = document.createElement('div');
                    warningChild.className = 'warning-badge animation-element';
                    warningChild.textContent = '⚠️';
                    warningChild.style.cssText = `
                        position: absolute;
                        right: 20%;
                        top: 220px;
                        transform: translate(50%, -50%);
                    `;
                    this.stage.appendChild(warningChild);
                    anim.registerElement('warningChild', warningChild);

                    await anim.createDetailBox(`
                        <strong style="color: #ffff00">🚨 MEMORY LEAK DETECTED!</strong><br><br>
                        <strong>The Problem:</strong><br>
                        • Parent holds Child (refCount = 1)<br>
                        • Child holds Parent (refCount = 1)<br>
                        • No external references exist<br>
                        • Both stuck at refCount = 1<br><br>
                        <strong style="color: #ffff00">They keep each other alive!</strong><br><br>
                        ARC can't deallocate them because:<br>
                        refCount > 0 for both objects
                    `, {
                        key: 'leak',
                        style: {
                            border: '3px solid #ff4444',
                            background: 'rgba(255, 68, 68, 0.2)',
                            maxWidth: '420px'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });
                },
                show: ['leak', 'warningParent', 'warningChild'],
                hide: ['removeExternal'],
                persist: ['parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel']
            },
            {
                status: '💡 <strong>THE SOLUTION</strong> - Use weak or unowned to break the cycle',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #f093fb">💡 How to Fix Retain Cycles</strong><br><br>
                        <strong style="color: #ff4444">❌ Problem:</strong><br>
                        Both references are <code>strong</code><br>
                        Creates a retain cycle<br><br>
                        <strong style="color: #00ff88">✅ Solution:</strong><br>
                        Make one reference <code>weak</code><br>
                        (or <code>unowned</code>)<br><br>
                        <code>weak var parent: Parent?</code><br><br>
                        <strong>Common Pattern:</strong><br>
                        • Parent → Child: <code>strong</code><br>
                        • Child → Parent: <code>weak</code><br><br>
                        Let's see this in the next animation!
                    `, {
                        key: 'solution',
                        style: {
                            border: '2px solid #f093fb',
                            maxWidth: '450px'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['solution'],
                hide: ['leak', 'warningParent', 'warningChild'],
                persist: ['parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel']
            }
        ]);
    }
}