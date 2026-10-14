import { test, expect } from '@playwright/test';

const cats = [
  { path: '/data', title: 'Data & Finance', first: 'Equity DCF', last: 'Hiking Game Research', n: 7 },
  { path: '/games', title: 'Games', first: 'Long Dives', last: 'Chequered Flag', n: 3 },
  { path: '/tools', title: 'Tools & Mods', first: 'Tarkov Quest Router', last: 'Spaceship Generator', n: 3 },
];

for (const c of cats) {
  test(`${c.path} lists its ${c.n} projects in order`, async ({ page }) => {
    await page.goto(c.path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(c.title);
    const titles = page.locator('.case h2');
    await expect(titles).toHaveCount(c.n);
    await expect(titles.first()).toHaveText(c.first);
    await expect(titles.last()).toHaveText(c.last);
  });

  test(`${c.path} header marks the current tab and links home`, async ({ page }) => {
    await page.goto(c.path);
    await expect(page.locator('.site-header a[aria-current="page"]')).toHaveAttribute('href', c.path);
    await expect(page.locator('.site-header .logo')).toHaveAttribute('href', '/');
  });

  test(`${c.path} has no broken images`, async ({ page }) => {
    await page.goto(c.path);
    await page.evaluate(async () => {
      for (const img of document.images) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); }
    });
    const imgs = await page.evaluate(() => [...document.images].map((i) => ({ src: i.src, ok: i.naturalWidth > 0 })));
    expect(imgs.filter((i) => i.src.includes('/_astro/')).length).toBeGreaterThan(0);
    expect(imgs.filter((i) => !i.ok)).toEqual([]);
  });
}

test('case-file rows alternate sides', async ({ page }) => {
  await page.goto('/data');
  const flips = await page.locator('.case').evaluateAll((els) => els.map((e) => e.classList.contains('flip')));
  expect(flips).toEqual([false, true, false, true, false, true, false]);
});

test('shizuoka shows a number panel, a private badge and no links', async ({ page }) => {
  await page.goto('/data');
  const row = page.locator('.case', { hasText: 'Shizuoka' });
  await expect(row.locator('.panel')).toContainText('¥3.97bn');
  await expect(row.locator('.status')).toHaveText('Private engagement, not published');
  await expect(row.locator('.links a')).toHaveCount(0);
});

test('first link is the main button and wake notes show under demos', async ({ page }) => {
  await page.goto('/data');
  const row = page.locator('.case', { hasText: 'Credit Default Prediction' });
  await expect(row.locator('.links a').first()).toHaveClass(/pri/);
  await expect(row.locator('.links a').first()).toHaveText('Live demo');
  await expect(row.locator('.note')).toHaveText('May take 30 seconds to wake up');
});

test('external links open safely in a new tab', async ({ page }) => {
  await page.goto('/tools');
  const links = await page.locator('.case .links a').all();
  expect(links.length).toBeGreaterThan(0);
  for (const a of links) {
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('unknown path gets the 404 page', async ({ page }) => {
  const res = await page.goto('/nope');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Back to the desk' })).toHaveAttribute('href', '/');
});

test('desk counts come from the collection', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.obj-data small')).toHaveText('7 projects');
  await expect(page.locator('.obj-games small')).toHaveText('3 projects · 2 on Steam');
  await expect(page.locator('.obj-tools small')).toHaveText('3 projects');
});
