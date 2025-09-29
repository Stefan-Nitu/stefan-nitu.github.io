class WeakReferencesAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('weak-stage');
        const status = document.getElementById('weak-status');
        super(stage, status);

        this.obj = document.getElementById('weak-obj');
        this.objCount = document.getElementById('weak-obj-count');

        this.setupButtons('weak-play', 'weak-step', 'weak-reset');

        this.onReset = () => {
            this.obj.className = 'arc-object';
            this.objCount.textContent = '0';
            this.objCount.className = 'ref-count';
            this.statusEl.textContent = "Weak references don't increase retain count and become nil when object deallocates";
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>CREATING OBJECT</strong> - Strong reference holds the object',
                create: async (anim) => {
                    showObject(this.obj);
                    await anim.sleep(500);
                    updateRefCount(this.objCount, 1, { increment: true });

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">Object Created</strong><br><br>
                        <code>let person = Person(name: "John")</code><br><br>
                        • Strong reference created<br>
                        • refCount: 0 → 1<br>
                        • Object is alive
                    `, {
                        key: 'createDetail',
                        style: { border: '2px solid #00ff88' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    const strongRef = document.createElement('div');
                    strongRef.className = 'animation-element';
                    strongRef.style.cssText = `
                        position: absolute;
                        left: 25%;
                        top: 170px;
                        transform: translateX(-50%);
                        padding: 10px 20px;
                        background: rgba(0, 255, 255, 0.2);
                        border: 2px solid #00ffff;
                        border-radius: 10px;
                        font-family: monospace;
                        font-size: 12px;
                        color: #00ffff;
                        z-index: 90;
                    `;
                    strongRef.innerHTML = '<strong>person</strong> (strong ref)';
                    this.stage.appendChild(strongRef);
                    anim.registerElement('strongRef', strongRef);
                },
                show: ['createDetail', 'strongRef'],
                persist: []
            },
            {
                status: '<strong>ADDING WEAK REFERENCE</strong> - Weak ref does NOT increment refCount',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff00ff">Weak Reference Added</strong><br><br>
                        <code>weak var delegate = person</code><br><br>
                        • Weak reference created<br>
                        • <strong>refCount stays at 1</strong><br>
                        • Does NOT prevent deallocation<br>
                        • Will become nil if object deallocates
                    `, {
                        key: 'weakDetail',
                        style: { border: '2px solid #ff00ff' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    const weakRef = document.createElement('div');
                    weakRef.className = 'animation-element';
                    weakRef.style.cssText = `
                        position: absolute;
                        left: 75%;
                        top: 170px;
                        transform: translateX(-50%);
                        padding: 10px 20px;
                        background: rgba(255, 0, 255, 0.2);
                        border: 2px dashed #ff00ff;
                        border-radius: 10px;
                        font-family: monospace;
                        font-size: 12px;
                        color: #ff00ff;
                        z-index: 90;
                    `;
                    weakRef.innerHTML = '<strong>weak delegate</strong> (weak ref)';
                    this.stage.appendChild(weakRef);
                    anim.registerElement('weakRef', weakRef);

                    await anim.sleep(500);

                    const note = document.createElement('div');
                    note.className = 'animation-element';
                    note.style.cssText = `
                        position: absolute;
                        right: 50px;
                        top: 250px;
                        padding: 15px;
                        background: rgba(255, 0, 255, 0.3);
                        border: 2px solid #ff00ff;
                        border-radius: 10px;
                        font-size: 14px;
                        max-width: 200px;
                        animation: pulse 2s infinite;
                    `;
                    note.innerHTML = '👀 Notice!<br>refCount still <strong>1</strong>';
                    this.stage.appendChild(note);
                    anim.registerElement('note', note);
                },
                show: ['weakDetail', 'weakRef', 'note'],
                hide: ['createDetail'],
                persist: ['strongRef']
            },
            {
                status: '<strong>REMOVING STRONG REFERENCE</strong> - Only the weak reference remains',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffaa00">Strong Reference Removed</strong><br><br>
                        <code>person = nil</code><br><br>
                        • Strong reference released<br>
                        • refCount: 1 → 0<br>
                        • Weak reference doesn't count!<br>
                        • Object will deallocate...
                    `, {
                        key: 'removeStrong',
                        style: { border: '2px solid #ffaa00' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    markObjectDeallocating(this.obj);
                    updateRefCount(this.objCount, 0, { decrement: true });

                    const strongRef = anim.getElement('strongRef');
                    if (strongRef) {
                        strongRef.style.opacity = '0';
                        strongRef.style.textDecoration = 'line-through';
                    }
                },
                show: ['removeStrong'],
                hide: ['weakDetail', 'note'],
                persist: ['weakRef']
            },
            {
                status: '<strong>OBJECT DEALLOCATED</strong> - Weak reference automatically becomes nil',
                create: async (anim) => {
                    await anim.sleep(500);
                    markObjectDeallocated(this.obj);

                    const explosion = document.createElement('div');
                    explosion.className = 'animation-element';
                    explosion.style.cssText = `
                        position: absolute;
                        left: 50%;
                        top: 250px;
                        transform: translate(-50%, -50%);
                        font-size: 60px;
                        z-index: 200;
                        animation: fadeIn 0.5s;
                    `;
                    explosion.textContent = '💥';
                    this.stage.appendChild(explosion);
                    anim.registerElement('explosion', explosion);

                    await anim.sleep(800);

                    const weakRef = anim.getElement('weakRef');
                    if (weakRef) {
                        weakRef.style.transition = 'all 0.5s';
                        weakRef.style.background = 'rgba(100, 100, 100, 0.2)';
                        weakRef.style.borderColor = '#666';
                        weakRef.innerHTML = '<strong>weak delegate</strong> = <span style="color: #ff4444">nil</span>';
                    }

                    await anim.createDetailBox(`
                        <strong style="color: #ff00ff">✅ Weak Reference → nil</strong><br><br>
                        When the object deallocated:<br>
                        • ARC automatically set weak ref to nil<br>
                        • No crash when accessing it<br>
                        • Safe to check: <code>if delegate != nil</code><br><br>
                        <strong style="color: #00ff88">This is the magic of weak!</strong>
                    `, {
                        key: 'weakNil',
                        style: { border: '2px solid #ff00ff' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });
                },
                show: ['weakNil', 'explosion'],
                hide: ['removeStrong', 'strongRef'],
                persist: ['weakRef']
            },
            {
                status: '✅ <strong>WEAK REFERENCES EXPLAINED</strong> - Perfect for delegates and avoiding cycles',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #f093fb">🎓 Weak Reference Summary</strong><br><br>
                        <strong>Key Characteristics:</strong><br>
                        • Don't increment refCount<br>
                        • Don't prevent deallocation<br>
                        • Automatically become nil<br>
                        • Safe to access (no crash)<br><br>
                        <strong style="color: #00ffff">Common Use Cases:</strong><br>
                        • Delegate properties<br>
                        • Parent-child relationships<br>
                        • Observer patterns<br>
                        • Avoiding retain cycles<br><br>
                        <code>weak var delegate: Protocol?</code>
                    `, {
                        key: 'summary',
                        style: { border: '2px solid #f093fb', maxWidth: '400px' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['summary'],
                hide: ['weakNil', 'explosion'],
                persist: ['weakRef']
            }
        ]);
    }
}