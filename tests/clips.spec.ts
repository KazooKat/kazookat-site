import { test, expect } from '@playwright/test';

const clips = [
  { title: 'Long Dives', src: '/media/long-dives.mp4' },
  { title: 'John Whisk', src: '/media/john-whisk.mp4' },
];

for (const c of clips) {
  test(`${c.title} has a muted looping clip with a poster`, async ({ page }) => {
    await page.goto('/games');
    const video = page.locator('.case', { hasText: c.title }).locator('video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('poster', /\/_astro\//);
  });

  test(`${c.title} clip file is small enough`, async ({ request }) => {
    const res = await request.get(c.src);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('video/mp4');
    expect((await res.body()).length).toBeLessThanOrEqual(4 * 1024 * 1024);
  });
}

test('clips play once scrolled into view', async ({ page }) => {
  await page.goto('/games');
  const video = page.locator('.case', { hasText: 'John Whisk' }).locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0), { timeout: 8000 }).toBe(true);
});

test('clips stay paused with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/games');
  const video = page.locator('.case', { hasText: 'Long Dives' }).locator('video');
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});
