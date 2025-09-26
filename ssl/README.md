# SSL/TLS Animation Visualizations

Interactive visualizations demonstrating SSL/TLS security concepts including handshakes, MITM attacks, and certificate pinning.

## 🏗️ Structure

```
ssl/
├── index.html          # Main animation page
├── styles.css          # Visual styles
│
├── shared.js           # Base animation framework
├── config.js           # Timing and positioning config
├── animations.js       # Reusable animation patterns
├── sleep-patch.js      # Interruptible sleep for clean resets
│
├── handshake.js        # SSL handshake animation
├── mitm.js            # Man-in-the-middle attack demo
├── pinning.js         # Certificate pinning protection
│
└── tests/
    ├── animations.test.js  # Unit tests for reset behavior
    └── handshake.test.js   # Integration tests
```

## 🚀 Running

Open `ssl/index.html` in a browser to view the animations.

## 🧪 Testing

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🔑 Key Features

### Proper Reset Handling
- Animations can be cleanly stopped mid-execution
- State is preserved across resets (no new object creation)
- Sleep operations check `shouldStop` flag frequently
- UI updates correctly after interruption

### Organized Animation System
- **BaseAnimation**: Core animation lifecycle
- **AnimationSequence**: Reusable packet movements and detail boxes
- **EnhancedAnimationState**: Extended state with timing controls
- **Standardized positioning**: Consistent bubble placement zones

### Test Coverage
- Unit tests for reset behavior and state management
- Integration tests for actual animation classes
- Tests verify animations stop immediately when reset
- Ensures UI elements clean up properly

## 📐 Animation Zones

Detail boxes use standardized positioning zones for consistency:

- `main-center` (350px from top, centered)
- `main-left` (350px from top, left side)
- `main-right` (350px from top, right side)
- `bottom-center` (480px from top, centered)
- `bottom-left` (480px from top, left side)
- `bottom-right` (480px from top, right side)

## 🎯 Reset Behavior

The reset functionality ensures animations stop immediately:

1. Sets `shouldStop = true` on shared state
2. Sleep operations check flag every 50ms and exit early
3. Waits for animation promise to complete
4. Cleans up DOM elements
5. Resets state (except `shouldStop`)
6. Updates UI buttons
7. Finally clears `shouldStop`

This prevents animations from continuing after reset is clicked.