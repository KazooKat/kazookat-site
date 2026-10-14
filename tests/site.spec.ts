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

// Mid widths between the phone stack and full desktop: tablets, landscape phones, half-screen windows.
for (const width of [700, 768, 820, 880, 881, 900, 960, 999, 1000, 1120, 1199, 1200]) {
  test(`landing desk fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const box = await page.locator('.items').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  });
}

test('focus outline has at least 3:1 contrast against the page', async ({ page }) => {
  await page.goto('/data');
  await page.focus('.site-header .logo');
  const ratio = await page.evaluate(() => {
    const rgb = (s: string) => s.match(/\d+/g)!.slice(0, 3).map(Number);
    const lum = (c: number[]) => {
      const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const el = document.activeElement as HTMLElement;
    const fg = lum(rgb(getComputedStyle(el).outlineColor));
    const bg = lum(rgb(getComputedStyle(document.querySelector('.site-header')!).backgroundColor));
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(3);
});
