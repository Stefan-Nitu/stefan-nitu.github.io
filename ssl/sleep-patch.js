// Patch the global sleep function to be interruptible
// This overrides the sleep function to check if animations should stop

(function() {
    const originalSleep = window.sleep;

    window.sleep = async function(ms) {
        // If no animations are running, use original sleep
        if (!window.activeAnimation || !window.activeAnimation.state) {
            return originalSleep(ms);
        }

        const state = window.activeAnimation.state;

        // Interruptible sleep that checks shouldStop
        const checkInterval = 50; // Check every 50ms
        const endTime = Date.now() + ms;

        while (Date.now() < endTime) {
            if (state.shouldStop) {
                // Just return early instead of throwing
                // This allows graceful cancellation
                return;
            }

            const remaining = endTime - Date.now();
            const sleepTime = Math.min(checkInterval, remaining);

            if (sleepTime > 0) {
                await originalSleep(sleepTime);
            }
        }
    };
})();