import { test, expect, type Page } from '@playwright/test';

// Sprite frames are read from computed styles: headless screenshots lag a frame behind.
const bgX = (page: Page, sel: string) =>
  page.evaluate((s) => getComputedStyle(document.querySelector(s)!).backgroundPositionX, sel);

test('title, subtitle and the 3 desk links are there', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('KazooKat');
  await expect(page.locator('.sub')).toHaveText('BS Data Science & BBA Finance Grad. Open to Employment');
  for (const [cls, href] of [['.obj-data', '/data'], ['.obj-games', '/games'], ['.obj-tools', '/tools']]) {
    await expect(page.locator(cls)).toHaveAttribute('href', href);
  }
});

test('monitor ends on the full chart frame on hover', async ({ page }) => {
  await page.goto('/');
  await page.hover('.obj-data');
  await page.waitForTimeout(700);
  expect(await bgX(page, '.mon')).toBe('-864px'); // frame 5 of 5 at 36 art px * 6px
});

test('toolbox ends open on keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.focus('.obj-tools');
  await page.waitForTimeout(700);
  expect(await bgX(page, '.box')).toBe('-684px'); // frame 4 of 4 at 38 * 6px
});

test('gamepad cycles its 4 loop frames and only moves in whole art pixels', async ({ page }) => {
  await page.goto('/');
  await page.hover('.obj-games');
  const frames = new Set<string>();
  const ys = new Set<number>();
  for (let i = 0; i < 16; i++) {
    frames.add(await bgX(page, '.pad'));
    ys.add(await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.pad')!).transform).f));
    await page.waitForTimeout(60);
  }
  expect([...frames].sort()).toEqual(['-240px', '-480px', '-720px', '-960px']);
  for (const y of ys) expect(Math.abs(y) % 6).toBe(0);
});

test('character stands still when nothing is selected', async ({ page }) => {
  await page.goto('/');
  const anims = await page.locator('.me').evaluate((el) => el.getAnimations().length);
  expect(anims).toBe(0);
  const seen = new Set<string>();
  for (let i = 0; i < 10; i++) { seen.add(await bgX(page, '.me')); await page.waitForTimeout(100); }
  expect([...seen]).toEqual(['0px']);
});

for (const obj of ['.obj-data', '.obj-games', '.obj-tools']) {
  test(`character points and holds still while ${obj} is selected`, async ({ page }) => {
    await page.goto('/');
    await page.hover(obj);
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) { seen.add(await bgX(page, '.me')); await page.waitForTimeout(80); }
    expect([...seen]).toEqual(['-174px']); // pointing frame (29 art px * 6px), no flicker back
  });
}

test('character points while an object has keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.focus('.obj-tools');
  const seen = new Set<string>();
  for (let i = 0; i < 10; i++) { seen.add(await bgX(page, '.me')); await page.waitForTimeout(80); }
  expect([...seen]).toEqual(['-174px']);
});

test('enter on the focused gamepad opens /games', async ({ page }) => {
  await page.goto('/');
  await page.focus('.obj-games');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/games$/);
});

test('phone width stacks the desk with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const xs = await page.locator('.obj').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(new Set(xs).size).toBe(1); // one column
});
