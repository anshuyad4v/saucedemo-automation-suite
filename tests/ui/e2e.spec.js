const { test, expect } = require('@playwright/test');

const PASSWORD = 'secret_sauce';

/** Logs in on the page that is already open and waits for the product list. */
async function login(page, username, password = PASSWORD) {
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
}

/** Adds the backpack to the cart and opens checkout step one. */
async function startCheckout(page) {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
}

test.describe('SauceDemo UI end-to-end flows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-01: standard user can log in and reach the product list', async ({ page }) => {
    await login(page, 'standard_user');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('TC-02: locked out user is rejected with an explanatory error', async ({ page }) => {
    await login(page, 'locked_out_user');

    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('TC-03: empty credentials trigger field validation', async ({ page }) => {
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
  });

  test('TC-04: products can be sorted by price from low to high', async ({ page }) => {
    await login(page, 'standard_user');

    await page.locator('.product_sort_container').selectOption('lohi');

    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numbers = prices.map((price) => parseFloat(price.replace('$', '')));
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  test('TC-05: adding an item increments the cart badge', async ({ page }) => {
    await login(page, 'standard_user');

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('TC-06: removing an item clears the cart badge', async ({ page }) => {
    await login(page, 'standard_user');

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('.shopping_cart_badge')).toBeHidden();
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  });

  test('TC-07: checkout is blocked when the first name is missing', async ({ page }) => {
    await login(page, 'standard_user');
    await startCheckout(page);

    await page.locator('[data-test="lastName"]').fill('Yadav');
    await page.locator('[data-test="postalCode"]').fill('400001');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('TC-08: a complete order shows the correct totals and confirmation', async ({ page }) => {
    await login(page, 'standard_user');
    await startCheckout(page);

    await page.locator('[data-test="firstName"]').fill('Anshu');
    await page.locator('[data-test="lastName"]').fill('Yadav');
    await page.locator('[data-test="postalCode"]').fill('400001');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('.summary_subtotal_label')).toContainText('$29.99');
    await expect(page.locator('.summary_tax_label')).toContainText('$2.40');
    await expect(page.locator('.summary_total_label')).toContainText('$32.39');

    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});
