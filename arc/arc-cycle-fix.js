class CycleFixAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('fix-stage');
        const status = document.getElementById('fix-status');
        super(stage, status);

        this.parent = document.getElementById('fix-parent');
        this.child = document.getElementById('fix-child');
        this.parentCount = document.getElementById('fix-parent-count');
        this.childCount = document.getElementById('fix-child-count');

        this.setupButtons('fix-play', 'fix-step', 'fix-reset');

        this.onReset = () => {
            this.parent.className = 'arc-object';
            this.child.className = 'arc-object';
            this.parentCount.textContent = '0';
            this.childCount.textContent = '0';
            this.parentCount.className = 'ref-count';
            this.childCount.className = 'ref-count';
            this.statusEl.textContent = 'Using weak reference breaks the cycle and allows proper deallocation';
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>SETUP</strong> - Creating Parent and Child objects',
                create: async (anim) => {
                    showObject(this.parent);
                    await anim.sleep(300);
                    updateRefCount(this.parentCount, 1, { increment: true });

                    await anim.sleep(500);

                    showObject(this.child);
                    await anim.sleep(300);
                    updateRefCount(this.childCount, 1, { increment: true });

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">Objects Created</strong><br><br>
                        <code>let parent = Parent()</code><br>
                        <code>let child = Child()</code><br><br>
                        Both objects created with refCount = 1
                    `, {
                        key: 'setup',
                        style: { border: '2px solid #00ff88' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });
                },
                show: ['setup'],
                persist: []
            },
            {
                status: '<strong>PARENT → CHILD (STRONG)</strong> - Parent holds strong reference to Child',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">Parent → Child (strong)</strong><br><br>
                        <code>parent.child = child</code><br><br>
                        • Strong reference created<br>
                        • Child refCount: 1 → 2<br>
                        • This is normal and correct
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
                hide: ['setup'],
                persist: []
            },
            {
                status: '<strong>CHILD → PARENT (WEAK)</strong> - Child uses WEAK reference - No cycle! ✅',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff00ff">✅ Child → Parent (weak)</strong><br><br>
                        <code>weak var parent: Parent?</code><br>
                        <code>child.parent = parent</code><br><br>
                        • <strong>Weak reference created</strong><br>
                        • Parent refCount stays at 1<br>
                        • No retain cycle!<br><br>
                        Child can access parent, but doesn't own it
                    `, {
                        key: 'childToParent',
                        style: { border: '2px solid #ff00ff' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);

                    const refs = createReference(this.stage, this.child, this.parent, 'weak', 'weak', { yOffset: 20 });
                    refs.arrow.classList.add('show');
                    if (refs.label) refs.label.style.opacity = '1';
                    anim.registerElement('childToParentArrow', refs.arrow);
                    if (refs.label) anim.registerElement('childToParentLabel', refs.label);

                    await anim.sleep(500);

                    const checkmark = document.createElement('div');
                    checkmark.className = 'animation-element';
                    checkmark.style.cssText = `
                        position: absolute;
                        top: 100px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 48px;
                        animation: fadeIn 0.5s;
                    `;
                    checkmark.textContent = '✅';
                    this.stage.appendChild(checkmark);
                    anim.registerElement('checkmark', checkmark);
                },
                show: ['childToParent', 'childToParentArrow', 'childToParentLabel', 'checkmark'],
                hide: ['parentToChild'],
                persist: ['parentToChildArrow', 'parentToChildLabel']
            },
            {
                status: '<strong>REMOVING EXTERNAL REFERENCES</strong> - Parent can now be deallocated',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffaa00">External Refs Removed</strong><br><br>
                        <code>parent = nil</code><br>
                        <code>child = nil</code><br><br>
                        • Parent refCount: 1 → 0<br>
                        • Child refCount: 2 → 1<br><br>
                        <strong>Parent can deallocate!</strong><br>
                        (weak ref doesn't count)
                    `, {
                        key: 'removeExternal',
                        style: { border: '2px solid #ffaa00' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    updateRefCount(this.parentCount, 0, { decrement: true });
                    await anim.sleep(300);
                    updateRefCount(this.childCount, 1, { decrement: true });

                    await anim.sleep(500);
                    markObjectDeallocating(this.parent);
                },
                show: ['removeExternal'],
                hide: ['childToParent', 'checkmark'],
                persist: ['parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel']
            },
            {
                status: '<strong>PARENT DEALLOCATES</strong> - This breaks parent→child reference',
                create: async (anim) => {
                    await anim.sleep(500);
                    markObjectDeallocated(this.parent);

                    const explosion = document.createElement('div');
                    explosion.className = 'animation-element';
                    explosion.style.cssText = `
                        position: absolute;
                        left: 20%;
                        top: 250px;
                        transform: translate(-50%, -50%);
                        font-size: 48px;
                        z-index: 200;
                        animation: fadeIn 0.5s;
                    `;
                    explosion.textContent = '💥';
                    this.stage.appendChild(explosion);
                    anim.registerElement('explosionParent', explosion);

                    await anim.sleep(800);

                    const childToParentArrow = anim.getElement('childToParentArrow');
                    const childToParentLabel = anim.getElement('childToParentLabel');
                    if (childToParentArrow) childToParentArrow.style.opacity = '0.3';
                    if (childToParentLabel) {
                        childToParentLabel.style.opacity = '0.3';
                        childToParentLabel.innerHTML = 'nil';
                    }

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">Parent Deallocated!</strong><br><br>
                        • Parent refCount reached 0<br>
                        • ARC deallocated Parent<br>
                        • Child's weak ref → nil<br>
                        • Parent→Child ref released<br><br>
                        Child refCount: 1 → 0
                    `, {
                        key: 'parentDealloc',
                        style: { border: '2px solid #00ff88' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    updateRefCount(this.childCount, 0, { decrement: true });
                    markObjectDeallocating(this.child);

                    const parentToChildArrow = anim.getElement('parentToChildArrow');
                    const parentToChildLabel = anim.getElement('parentToChildLabel');
                    if (parentToChildArrow) parentToChildArrow.style.opacity = '0.3';
                    if (parentToChildLabel) parentToChildLabel.style.opacity = '0.3';
                },
                show: ['parentDealloc', 'explosionParent'],
                hide: ['removeExternal'],
                persist: ['parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel']
            },
            {
                status: '✅ <strong>CHILD DEALLOCATES</strong> - No memory leak! Perfect cleanup',
                create: async (anim) => {
                    await anim.sleep(500);
                    markObjectDeallocated(this.child);

                    const explosion = document.createElement('div');
                    explosion.className = 'animation-element';
                    explosion.style.cssText = `
                        position: absolute;
                        right: 20%;
                        top: 250px;
                        transform: translate(50%, -50%);
                        font-size: 48px;
                        z-index: 200;
                        animation: fadeIn 0.5s;
                    `;
                    explosion.textContent = '💥';
                    this.stage.appendChild(explosion);
                    anim.registerElement('explosionChild', explosion);

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">✅ Child Deallocated!</strong><br><br>
                        • Child refCount reached 0<br>
                        • ARC deallocated Child<br>
                        • All memory freed<br><br>
                        <strong style="color: #f093fb">Perfect cleanup!</strong>
                    `, {
                        key: 'childDealloc',
                        style: { border: '2px solid #00ff88' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });
                },
                show: ['childDealloc', 'explosionChild'],
                hide: ['parentDealloc'],
                persist: ['explosionParent', 'parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel']
            },
            {
                status: '🎉 <strong>PROBLEM SOLVED</strong> - Weak reference prevents retain cycles',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #f093fb">🎉 Retain Cycle Solved!</strong><br><br>
                        <strong style="color: #00ffff">The Fix:</strong><br>
                        Changed Child's reference from:<br>
                        <code style="color: #ff4444">var parent: Parent?</code><br>
                        to:<br>
                        <code style="color: #00ff88">weak var parent: Parent?</code><br><br>
                        <strong>Result:</strong><br>
                        ✅ No retain cycle<br>
                        ✅ Both objects deallocated<br>
                        ✅ No memory leak<br>
                        ✅ Child's weak ref became nil safely<br><br>
                        <strong style="color: #ffaa00">Golden Rule:</strong><br>
                        Parent → Child: <code>strong</code><br>
                        Child → Parent: <code>weak</code>
                    `, {
                        key: 'summary',
                        style: {
                            border: '2px solid #f093fb',
                            maxWidth: '450px'
                        },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '400px' }
                    });
                },
                show: ['summary'],
                hide: ['childDealloc', 'explosionParent', 'explosionChild', 'parentToChildArrow', 'parentToChildLabel', 'childToParentArrow', 'childToParentLabel'],
                persist: []
            }
        ]);
    }
}