const { test, expect } = require('/usr/local/lib/node_modules/playwright/test');

test.use({ viewport: { width: 390, height: 844 }, acceptDownloads: true });

test('couple questionnaire saves, resumes, reviews and exports', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/questionnaire/');
  await page.locator('[name="workingTitle"]').fill('Japan food and design trip');
  await page.locator('[name="origin"]').fill('Los Angeles');
  await page.locator('[name="destinations"]').fill('Tokyo, Kyoto');
  await page.locator('[name="dateFlexibility"]').selectOption({ label: 'Destination is fixed' });
  await page.locator('[name="startDate"]').fill('2027-04-05');
  await page.locator('[name="endDate"]').fill('2027-04-14');
  await page.locator('#next-step').click();
  await expect(page.locator('[data-step="travelers"]')).toBeVisible();
  await page.locator('[name="travelerOnePriorities"]').fill('Food, architecture, markets');
  await page.locator('[name="travelerTwoPriorities"]').fill('Shopping, gardens, local neighborhoods');
  await page.reload();
  await expect(page.locator('[data-step="travelers"]')).toBeVisible();
  await expect(page.locator('[name="travelerOnePriorities"]')).toHaveValue('Food, architecture, markets');
  for (let i = 0; i < 6; i++) await page.locator('#next-step').click();
  await expect(page.locator('[data-step="review"]')).toBeVisible();
  await expect(page.locator('#review-summary')).toContainText('Tokyo, Kyoto');
  await page.locator('[name="privacyConfirmed"]').check();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-handoff').click();
  const download = await downloadPromise;
  const filePath = await download.path();
  const exported = JSON.parse(require('fs').readFileSync(filePath, 'utf8'));
  expect(exported.schemaVersion).toBe(2);
  expect(exported.trip.destinations).toEqual(['Tokyo', 'Kyoto']);
  expect(exported.travelers.preferenceComparison[0].travelerLabel).toBe('Traveler 1');
  expect(JSON.stringify(exported)).not.toContain('email');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
});

test('solo traveler hides comparison and sensitive text blocks export', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/questionnaire/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('[name="destinations"]').fill('Paris');
  await page.locator('[name="startDate"]').fill('2027-05-01');
  await page.locator('[name="endDate"]').fill('2027-05-05');
  await page.locator('#next-step').click();
  await page.locator('[name="travelerCount"]').fill('1');
  await page.locator('[name="groupType"]').selectOption('solo');
  await expect(page.locator('#traveler-comparison')).toBeHidden();
  for (let i = 0; i < 6; i++) await page.locator('#next-step').click();
  await page.locator('[name="dreamTripDescription"]').evaluate((node) => { node.value = 'confirmation number ABC123456'; });
  await page.locator('[name="privacyConfirmed"]').check();
  await page.locator('#download-handoff').click();
  await expect(page.locator('#form-error')).toContainText('Possible sensitive information');
});
