import { test, expect } from '@playwright/test';

const pages = ['/', '/data', '/games', '/tools', '/nope'];

for (const width of [1440, 390]) {
  for (const p of pages) {
    test(`no sideways scroll on ${p} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(p);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}

test('reduced motion: no running animations on any page, even while hovering', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const p of pages) {
    await page.goto(p);
    if (p === '/') await page.hover('.obj-games');
    await page.waitForTimeout(300);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running, p).toBe(0);
  }
});

test('every page has a title, a description, the build id and one h1', async ({ page }) => {
  for (const p of pages) {
    await page.goto(p);
    expect(await page.title(), p).toMatch(/KazooKat/);
    await expect(page.locator('meta[name="description"]'), p).toHaveAttribute('content', /.{30,}/);
    await expect(page.locator('meta[name="build"]'), p).toHaveAttribute('content', /^\d{8}T\d{6}Z-/);
    await expect(page.locator('h1'), p).toHaveCount(1);
  }
});
