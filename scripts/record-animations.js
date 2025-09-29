#!/usr/bin/env node

/**
 * Automated Animation Recorder
 *
 * Records animations as videos using Playwright browser automation.
 * Requires: playwright, @playwright/test
 *
 * Usage: node scripts/record-animations.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ANIMATIONS = [
    {
        name: 'arc-strong-refs',
        url: 'arc/index.html',
        playButtonId: 'strong-play',
        duration: 25000,
        description: 'ARC Strong References'
    },
    {
        name: 'arc-weak-refs',
        url: 'arc/index.html',
        playButtonId: 'weak-play',
        duration: 30000,
        description: 'ARC Weak References'
    },
    {
        name: 'arc-retain-cycle',
        url: 'arc/index.html',
        playButtonId: 'cycle-play',
        duration: 35000,
        description: 'ARC Retain Cycle'
    },
    {
        name: 'arc-cycle-fix',
        url: 'arc/index.html',
        playButtonId: 'fix-play',
        duration: 40000,
        description: 'ARC Cycle Fix'
    },
    {
        name: 'ssl-simplified',
        url: 'ssl/index.html',
        playButtonId: 'tls-simple-play',
        duration: 35000,
        description: 'SSL Simplified'
    },
    {
        name: 'ssl-mitm',
        url: 'ssl/index.html',
        playButtonId: 'mitm-play',
        duration: 30000,
        description: 'SSL MITM Attack'
    },
    {
        name: 'ssl-pinning',
        url: 'ssl/index.html',
        playButtonId: 'pin-play',
        duration: 30000,
        description: 'SSL Certificate Pinning'
    },
    {
        name: 'ssl-tls13',
        url: 'ssl/index.html',
        playButtonId: 'tls13-play',
        duration: 40000,
        description: 'TLS 1.3 Handshake'
    },
    {
        name: 'ssl-tls12',
        url: 'ssl/index.html',
        playButtonId: 'tls12-play',
        duration: 45000,
        description: 'TLS 1.2 Handshake'
    }
];

async function recordAnimation(animation) {
    console.log(`\n🎬 Recording: ${animation.description}...`);

    const browser = await chromium.launch({
        headless: false,
        args: ['--window-size=1400,900']
    });

    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 },
        recordVideo: {
            dir: path.join(__dirname, '..', 'videos', 'temp'),
            size: { width: 1400, height: 900 }
        }
    });

    const page = await context.newPage();

    const filePath = path.join(__dirname, '..', animation.url);
    await page.goto(`file://${filePath}`);

    await page.waitForTimeout(2000);

    const playButton = await page.$(`#${animation.playButtonId}`);
    if (!playButton) {
        console.error(`❌ Play button #${animation.playButtonId} not found`);
        await browser.close();
        return;
    }

    await playButton.click();

    await page.waitForTimeout(animation.duration);

    await page.close();
    await context.close();

    const videoPath = await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const tempDir = path.join(__dirname, '..', 'videos', 'temp');
            if (fs.existsSync(tempDir)) {
                const files = fs.readdirSync(tempDir);
                const videoFile = files.find(f => f.endsWith('.webm'));
                if (videoFile) {
                    clearInterval(checkInterval);
                    resolve(path.join(tempDir, videoFile));
                }
            }
        }, 500);
    });

    await browser.close();

    const outputDir = path.join(__dirname, '..', animation.url.split('/')[0], 'videos');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${animation.name}.webm`);
    fs.renameSync(videoPath, outputPath);

    const tempDir = path.join(__dirname, '..', 'videos', 'temp');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }

    console.log(`✅ Saved: ${outputPath}`);
}

async function main() {
    console.log('🎥 Automated Animation Recorder');
    console.log('================================\n');

    const videosDir = path.join(__dirname, '..', 'videos');
    if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
    }

    for (const animation of ANIMATIONS) {
        try {
            await recordAnimation(animation);
        } catch (error) {
            console.error(`❌ Error recording ${animation.name}:`, error.message);
        }
    }

    console.log('\n✨ All animations recorded!');
    console.log('\nNext steps:');
    console.log('1. Review videos in arc/videos/ and ssl/videos/');
    console.log('2. Optionally compress with: ffmpeg -i input.webm -c:v libvpx-vp9 -b:v 500k output.webm');
    console.log('3. Update HTML to show videos on mobile');
}

main().catch(console.error);