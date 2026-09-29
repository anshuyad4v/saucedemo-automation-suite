# Bug Reports — SauceDemo

Five defects were found while executing the cases in [TEST_PLAN.md](TEST_PLAN.md). Each one was reproduced on the live site on 29 September 2026 with Playwright 1.63 on Chromium (Windows 11) and the evidence screenshots in [screenshots/](screenshots/) were captured during that run.

Every entry below is also filed as a GitHub Issue and tracked on the Kanban board of this repository.

| ID | Title | Severity | Priority | Module | Account |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | All product images fall back to the same 404 placeholder | High | High | Inventory | `problem_user` |
| BUG-002 | Last Name field on checkout cannot be filled, purchase is blocked | Critical | High | Checkout | `problem_user` |
| BUG-003 | Sort dropdown selection is discarded and resets to Name (A to Z) | High | Medium | Inventory | `problem_user` |
| BUG-004 | An order can be placed with an empty cart for a total of $0.00 | High | High | Checkout | `standard_user` |
| BUG-005 | Login takes about 5 seconds, roughly 75 times slower than a normal login | Medium | Medium | Authentication | `performance_glitch_user` |

Severity scale: Critical (feature unusable, no workaround), High (major function broken or wrong data shown), Medium (noticeable degradation with a workaround), Low (cosmetic).

---

## BUG-001 — All product images fall back to the same 404 placeholder

| Field | Value |
| --- | --- |
| Severity | High |
| Priority | High |
| Module | Inventory |
| Environment | Chromium 1280 x 720, Windows 11, `https://www.saucedemo.com/` |
| Evidence | [screenshots/bug-01-problem-user-broken-images.png](screenshots/bug-01-problem-user-broken-images.png) |
| Related test case | TC-13 |

### Steps to reproduce

1. Open `https://www.saucedemo.com/`.
2. Log in with `problem_user` / `secret_sauce`.
3. Look at the six product cards on the inventory page.

### Expected result

Each product card shows its own product image (backpack, bike light, bolt t-shirt, fleece jacket, onesie, red t-shirt).

### Actual result

All six cards render the same placeholder image. The `src` of every `img.inventory_item_img` is `/assets/sl-404-Cq1a9k9X.jpg`, so the catalogue is visually unusable and a customer cannot tell the products apart.

### Notes

The same broken source is served on the product detail pages, so the defect is in the image mapping for this account rather than in a single card.

---

## BUG-002 — Last Name field on checkout cannot be filled, purchase is blocked

| Field | Value |
| --- | --- |
| Severity | Critical |
| Priority | High |
| Module | Checkout, step one (customer information) |
| Environment | Chromium 1280 x 720, Windows 11 |
| Evidence | [screenshots/bug-02-problem-user-lastname-locked.png](screenshots/bug-02-problem-user-lastname-locked.png) |
| Related test case | TC-26 |

### Steps to reproduce

1. Log in with `problem_user` / `secret_sauce`.
2. Add "Sauce Labs Backpack" to the cart and open the cart.
3. Click Checkout.
4. Type `Anshu` into First Name, then type `Yadav` into Last Name and `400001` into Zip/Postal Code.
5. Click Continue.

### Expected result

Last Name accepts the typed text and, with all three fields filled, Continue moves the user to the order summary (step two).

### Actual result

The Last Name field stays empty and the text typed into it overwrites the First Name field instead: after step 4 the field values read First Name `Yadav`, Last Name empty, Zip `400001`. Clicking Continue keeps the user on `checkout-step-one.html` with the error "Error: Last Name is required", so the purchase can never be completed with this account.

### Notes

This is the highest-impact defect found: it blocks the revenue path completely and there is no workaround from the UI.

---

## BUG-003 — Sort dropdown selection is discarded and resets to Name (A to Z)

| Field | Value |
| --- | --- |
| Severity | High |
| Priority | Medium |
| Module | Inventory, sort control |
| Environment | Chromium 1280 x 720, Windows 11 |
| Evidence | [screenshots/bug-03-problem-user-sorting-no-effect.png](screenshots/bug-03-problem-user-sorting-no-effect.png) |
| Related test case | TC-10 |

### Steps to reproduce

1. Log in with `problem_user` / `secret_sauce`.
2. Note the product order, which starts with "Sauce Labs Backpack".
3. Select "Name (Z to A)" in the sort dropdown.
4. Read the product order and the dropdown again.

### Expected result

The list reorders to descending alphabetical order, starting with "Test.allTheThings() T-Shirt (Red)", and the dropdown keeps showing the chosen option.

### Actual result

The product order does not change at all (the list still starts with "Sauce Labs Backpack") and the dropdown silently reverts to "Name (A to Z)" — its value reads `az` after `za` was selected. The user gets no feedback that the sort was rejected. The same happens for the price options.

---

## BUG-004 — An order can be placed with an empty cart for a total of $0.00

| Field | Value |
| --- | --- |
| Severity | High |
| Priority | High |
| Module | Cart and Checkout |
| Environment | Chromium 1280 x 720, Windows 11 |
| Evidence | [screenshots/bug-04a-empty-cart-checkout-enabled.png](screenshots/bug-04a-empty-cart-checkout-enabled.png), [screenshots/bug-04b-empty-cart-total-zero.png](screenshots/bug-04b-empty-cart-total-zero.png), [screenshots/bug-04c-empty-cart-order-placed.png](screenshots/bug-04c-empty-cart-order-placed.png) |
| Related test case | TC-24 |

### Steps to reproduce

1. Log in with `standard_user` / `secret_sauce`.
2. Without adding anything, open the cart (the badge is absent and the cart page lists no items).
3. Click Checkout.
4. Fill First Name `Anshu`, Last Name `Yadav`, Zip `400001` and click Continue.
5. On the summary page click Finish.

### Expected result

Checkout is not offered for an empty cart, or the attempt is stopped with a message such as "Your cart is empty"; no order can be created without items.

### Actual result

The whole checkout flow completes with zero items. Step two shows "Item total: $0.00", "Tax: $0.00", "Total: $0.00", and Finish lands on `checkout-complete.html` with "Thank you for your order!". An empty order is therefore accepted by the application.

### Notes

This one affects the normal `standard_user` account, not only a seeded-defect account, and would create empty orders in a real order pipeline.

---

## BUG-005 — Login takes about 5 seconds, roughly 75 times slower than a normal login

| Field | Value |
| --- | --- |
| Severity | Medium |
| Priority | Medium |
| Module | Authentication |
| Environment | Chromium 1280 x 720, Windows 11, same network session for both measurements |
| Evidence | [screenshots/bug-05a-performance-glitch-frozen-login.png](screenshots/bug-05a-performance-glitch-frozen-login.png) (page still frozen on the login form 1.5 s after the click), [screenshots/bug-05b-performance-glitch-loaded.png](screenshots/bug-05b-performance-glitch-loaded.png) |
| Related test case | TC-30 |

### Steps to reproduce

1. Open `https://www.saucedemo.com/`.
2. Enter `performance_glitch_user` / `secret_sauce`.
3. Start a timer, click Login and stop the timer when the product list is rendered.
4. Repeat the same measurement with `standard_user` as the baseline.

### Expected result

The inventory page renders within the agreed budget of 1.5 seconds, comparable with other accounts.

### Actual result

Measured in the same run:

| Account | Click Login until product list rendered |
| --- | --- |
| `performance_glitch_user` | 5108 ms and 5166 ms in two runs |
| `standard_user` | 67 ms |

During those five seconds the login button stays pressed, the form is unresponsive and no spinner or progress indicator is shown, so the user cannot tell whether the click was registered.

### Notes

Two separate runs produced 5108 ms and 5166 ms, which points to a fixed artificial delay rather than network variance.

---

## Additional observation (not raised as a defect)

With `problem_user`, clicking the second product tile opens "Sauce Labs Bolt T-Shirt" at `inventory-item.html?id=1` instead of the clicked "Sauce Labs Bike Light". It is listed here for completeness; it shares the same root cause as BUG-001 and BUG-003 (wrong item mapping for this account) and is tracked inside BUG-003's issue thread.
