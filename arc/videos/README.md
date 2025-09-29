# ARC Animation Videos

This folder contains pre-recorded videos of the ARC animations for mobile users.

## Recording Videos

To record the animations, use the automated recording script:

```bash
npm run record
```

Or manually record each animation and save them as:

- `arc-strong-refs.mp4` - Strong References animation
- `arc-weak-refs.mp4` - Weak References animation
- `arc-retain-cycle.mp4` - Retain Cycle animation
- `arc-cycle-fix.mp4` - Cycle Fix animation

## Manual Recording Steps

If recording manually:

1. Open the animation page in a browser
2. Set browser window to 1400x900
3. Use screen recording tool (QuickTime, OBS, etc.)
4. Click the Play button for the animation
5. Let it run completely
6. Save as MP4 or WebM
7. Compress if needed: `ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow output.mp4`

## Mobile Behavior

On mobile devices (≤768px width):
- The interactive stage is hidden
- Video player is shown instead
- Play button starts the video
- Step button is hidden
- Reset button resets the video to start