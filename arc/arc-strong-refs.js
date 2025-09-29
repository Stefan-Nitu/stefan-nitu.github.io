class StrongReferencesAnimation extends DeclarativeAnimation {
    constructor() {
        const stage = document.getElementById('strong-stage');
        const status = document.getElementById('strong-status');
        super(stage, status);

        this.obj = document.getElementById('strong-obj');
        this.objCount = document.getElementById('strong-obj-count');

        this.setupButtons('strong-play', 'strong-step', 'strong-reset');

        this.onReset = () => {
            this.obj.className = 'arc-object';
            this.objCount.textContent = '0';
            this.objCount.className = 'ref-count';
            this.statusEl.textContent = 'Watch how reference counting tracks object lifetime';
        };

        this.defineAnimationSteps();
    }

    defineAnimationSteps() {
        this.defineSteps([
            {
                status: '<strong>CREATING OBJECT</strong> - Object is allocated in memory with initial refCount = 1',
                create: async (anim) => {
                    showObject(this.obj);
                    await anim.sleep(500);
                    updateRefCount(this.objCount, 1, { increment: true });

                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">Object Created!</strong><br><br>
                        <code>let person = Person()</code><br><br>
                        • Memory allocated on heap<br>
                        • Strong reference created<br>
                        • refCount: 0 → 1<br><br>
                        Object stays alive because refCount > 0
                    `, {
                        key: 'createDetail',
                        style: { border: '2px solid #00ff88' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });
                },
                show: ['createDetail'],
                persist: []
            },
            {
                status: '<strong>ADDING STRONG REFERENCE</strong> - Another variable holds the object',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ffff">Second Strong Reference</strong><br><br>
                        <code>let anotherRef = person</code><br><br>
                        • New strong reference created<br>
                        • refCount increments: 1 → 2<br>
                        • Object has 2 owners now<br><br>
                        Both must be released to deallocate
                    `, {
                        key: 'secondRef',
                        style: { border: '2px solid #00ffff' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    updateRefCount(this.objCount, 2, { increment: true });
                },
                show: ['secondRef'],
                hide: ['createDetail'],
                persist: []
            },
            {
                status: '<strong>REMOVING ONE REFERENCE</strong> - First variable goes out of scope',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ffaa00">Reference Removed</strong><br><br>
                        <code>person = nil</code><br>
                        or variable goes out of scope<br><br>
                        • Strong reference released<br>
                        • refCount decrements: 2 → 1<br>
                        • Object still alive<br><br>
                        One owner remains
                    `, {
                        key: 'removeOne',
                        style: { border: '2px solid #ffaa00' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    updateRefCount(this.objCount, 1, { decrement: true });
                },
                show: ['removeOne'],
                hide: ['secondRef'],
                persist: []
            },
            {
                status: '<strong>REMOVING LAST REFERENCE</strong> - refCount reaches 0, object deallocates!',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #ff4444">Last Reference Removed!</strong><br><br>
                        <code>anotherRef = nil</code><br><br>
                        • Last strong reference released<br>
                        • refCount: 1 → 0<br>
                        • <strong>No more owners!</strong><br><br>
                        🔥 ARC automatically deallocates object
                    `, {
                        key: 'removeLast',
                        style: { border: '2px solid #ff4444' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '450px' }
                    });

                    await anim.sleep(500);
                    markObjectDeallocating(this.obj);
                    updateRefCount(this.objCount, 0, { decrement: true });

                    await anim.sleep(1000);
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
                },
                show: ['removeLast', 'explosion'],
                hide: ['removeOne'],
                persist: []
            },
            {
                status: '✅ <strong>MEMORY FREED</strong> - Object successfully deallocated, memory reclaimed',
                create: async (anim) => {
                    await anim.createDetailBox(`
                        <strong style="color: #00ff88">✅ Proper Memory Management</strong><br><br>
                        <strong>What happened:</strong><br>
                        1. Object created (refCount: 1)<br>
                        2. Second reference added (refCount: 2)<br>
                        3. References removed one by one<br>
                        4. refCount reached 0<br>
                        5. ARC deallocated automatically<br><br>
                        <strong style="color: #f093fb">Key Takeaway:</strong><br>
                        Objects live as long as they have owners<br>
                        (refCount > 0). When all owners release<br>
                        their references, ARC frees the memory.
                    `, {
                        key: 'summary',
                        style: { border: '2px solid #00ff88', maxWidth: '400px' },
                        position: { left: '50%', transform: 'translateX(-50%)', top: '420px' }
                    });
                },
                show: ['summary'],
                hide: ['removeLast', 'explosion'],
                persist: []
            }
        ]);
    }
}