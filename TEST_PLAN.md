# Test Plan — SauceDemo Web Application

| Field | Value |
| --- | --- |
| Application under test | [www.saucedemo.com](https://www.saucedemo.com/) |
| Document version | 1.0 |
| Prepared by | Anshu Yadav (QA Tester Intern assignment) |
| Related documents | [BUG_REPORTS.md](BUG_REPORTS.md), [README.md](README.md) |

---

## 1. Objective

Verify that the SauceDemo e-commerce demo application allows a registered user to log in, browse and sort the product catalogue, manage a cart and complete a checkout, and that the application handles invalid input and edge cases gracefully.

## 2. Scope

### In scope

| Module | Covered functionality |
| --- | --- |
| Authentication | Login, negative login, field validation, protected routes, logout |
| Inventory | Product listing, sorting (name / price), product detail page, images |
| Cart | Add, remove, badge count, cart page contents, state persistence |
| Checkout | Customer information validation, order summary, totals and tax, order confirmation |
| Cross-cutting | Side menu (Reset App State), login response time, basic input security |

### Out of scope

- Payment gateway integration (SauceDemo has no real payment step)
- Cross-browser and mobile-device matrix (execution is limited to Chromium desktop)
- Load / stress testing, penetration testing and accessibility audit
- Back-end database and infrastructure verification (no access provided)

## 3. Test environment

| Item | Detail |
| --- | --- |
| OS | Windows 11 |
| Browser | Chromium, Desktop Chrome viewport (1280 x 720) |
| Automation stack | Playwright Test 1.63, Node.js 18 or higher |
| Execution modes | Local (`npm test`) and GitHub Actions on every push / pull request to `main` |
| API under test (Part 4) | [reqres.in/api](https://reqres.in/) |

## 4. Test data

All accounts use the password `secret_sauce`.

| User | Purpose |
| --- | --- |
| `standard_user` | Positive / happy-path flows |
| `locked_out_user` | Blocked-account negative flow |
| `problem_user` | Seeded UI defects (images, sorting, checkout fields) |
| `performance_glitch_user` | Seeded latency on login |
| `error_user`, `visual_user` | Additional seeded-defect accounts, used for exploratory checks |

Checkout data used throughout: first name `Anshu`, last name `Yadav`, postal code `400001`.

## 5. Test approach

1. Functional testing — each module is tested against its expected business behaviour (login, cart maths, order confirmation).
2. UI testing — labels, images, badges, button state changes and navigation are verified visually and through assertions.
3. Negative testing — invalid credentials, blank mandatory fields, protected-route access and unsafe input strings.
4. Edge-case testing — empty-cart checkout, browser Back after order completion, refresh with items in the cart, latency account.
5. Regression — the 12 automated Playwright tests (8 UI and 4 API) run in CI on every push, so the covered paths are re-verified continuously.

## 6. Priority definitions

| Priority | Meaning |
| --- | --- |
| High | Blocks the core purchase journey or a validation / security rule; must pass in every cycle |
| Medium | Important supporting behaviour; a defect degrades usability but a workaround exists |
| Low | Cosmetic or convenience behaviour with low business impact |

## 7. Entry and exit criteria

Entry criteria: the application URL is reachable, the test accounts are valid, Node.js and the Playwright browsers are installed, and this plan has been reviewed.

Exit criteria: all 30 test cases executed, every defect logged as a GitHub Issue with severity and priority, no open Critical defect in the happy path, and the automated suite green in GitHub Actions.

## 8. Risks and assumptions

- SauceDemo is a public demo site, so data resets and site-side changes can affect results. Automation therefore locates elements by `data-test` attributes instead of positions.
- Several defects are intentionally seeded into the demo accounts. They are still reported, because the task is to detect and document them.
- reqres.in is a third-party mock API and can rate-limit. The API tests send the documented free key header `x-api-key: reqres-free-v1`.

## 9. Test cases

Total: 30 cases — Functional 14, UI 5, Negative 7, Edge 4. The last column links a case to its automated test or to the defect it exposed.

| ID | Type | Module | Title | Preconditions | Steps | Expected Result | Priority | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Functional | Auth | Valid login with standard user | On the login page, logged out | 1. Enter `standard_user` <br> 2. Enter `secret_sauce` <br> 3. Click Login | User lands on `/inventory.html`, the page title reads "Products" and 6 items are listed | High | Automated TC-01 |
| TC-02 | Negative | Auth | Locked-out account is rejected | On the login page | 1. Enter `locked_out_user` <br> 2. Enter `secret_sauce` <br> 3. Click Login | Error banner "Sorry, this user has been locked out." and the user stays on the login page | High | Automated TC-02 |
| TC-03 | Negative | Auth | Wrong password is rejected | On the login page | 1. Enter `standard_user` <br> 2. Enter `wrong_pass` <br> 3. Click Login | Error "Username and password do not match any user in this service" | High | — |
| TC-04 | Negative | Auth | Both credential fields empty | On the login page, fields blank | 1. Click Login without typing anything | Error "Username is required" | Medium | Automated TC-03 |
| TC-05 | Negative | Auth | Password empty | On the login page | 1. Enter `standard_user` <br> 2. Leave the password blank <br> 3. Click Login | Error "Password is required" | Medium | — |
| TC-06 | Negative | Auth | Unknown username | On the login page | 1. Enter `no_such_user` <br> 2. Enter `secret_sauce` <br> 3. Click Login | Error "Username and password do not match any user in this service", with no hint about which field is wrong | Medium | — |
| TC-07 | Negative | Auth | Direct access to a protected page | Logged out, no session | 1. Open `https://www.saucedemo.com/inventory.html` directly in the address bar | Redirected to the login page with the error "You can only access '/inventory.html' when you are logged in." | High | — |
| TC-08 | Functional | Auth | Logout clears the session | Logged in as `standard_user` | 1. Open the burger menu <br> 2. Click Logout | The login page is shown again and pressing browser Back does not restore the inventory page | High | — |
| TC-09 | UI | Inventory | Default sort is Name (A to Z) | Logged in as `standard_user` | 1. Read the sort dropdown <br> 2. Read the product order | The dropdown reads "Name (A to Z)" and items are alphabetical, starting with "Sauce Labs Backpack" | Low | — |
| TC-10 | Functional | Inventory | Sort by Name (Z to A) | On the inventory page | 1. Select "Name (Z to A)" in the sort dropdown | Products reorder in descending alphabetical order, starting with "Test.allTheThings() T-Shirt (Red)" | Medium | Defect BUG-003 with `problem_user` |
| TC-11 | Functional | Inventory | Sort by Price (low to high) | On the inventory page | 1. Select "Price (low to high)" <br> 2. Read every price | Prices ascend and the first item is the $7.99 Sauce Labs Onesie | High | Automated TC-04 |
| TC-12 | Functional | Inventory | Sort by Price (high to low) | On the inventory page | 1. Select "Price (high to low)" <br> 2. Read every price | Prices descend and the first item is the $49.99 Sauce Labs Fleece Jacket | High | — |
| TC-13 | UI | Inventory | Product images load correctly | On the inventory page | 1. Inspect each of the 6 product images | Every card shows its own product image, with no placeholder or broken image | High | Defect BUG-001 with `problem_user` |
| TC-14 | Functional | Inventory | Open the product detail page | On the inventory page | 1. Click a product name <br> 2. Compare the detail page with the card | The detail page opens for the clicked product with the same name, description and price | Medium | — |
| TC-15 | UI | Inventory | Price format on every card | On the inventory page | 1. Read every price label | Each price is rendered as `$` plus two decimals, for example `$29.99` | Low | — |
| TC-16 | Functional | Cart | Add a single item | On the inventory page, cart empty | 1. Click "Add to cart" on Sauce Labs Backpack | The cart badge shows 1 and the button changes to "Remove" | High | Automated TC-05 |
| TC-17 | Functional | Cart | Add multiple items | On the inventory page, cart empty | 1. Add three different products | The cart badge shows 3 and all three buttons read "Remove" | High | — |
| TC-18 | Functional | Cart | Remove an item from the inventory page | One item in the cart | 1. Click "Remove" on that product | The badge disappears and the button reverts to "Add to cart" | Medium | Automated TC-06 |
| TC-19 | Functional | Cart | Remove an item from the cart page | Two items in the cart | 1. Open the cart <br> 2. Click "Remove" on one line | That line is removed, the other line remains and the badge shows 1 | High | — |
| TC-20 | Functional | Cart | Cart line details are correct | One item in the cart | 1. Open the cart | Name, description, unit price and quantity 1 match the inventory card | High | — |
| TC-21 | Edge | Cart | Cart survives a page refresh | Two items in the cart | 1. Press F5 on the cart page | Both lines and the badge count 2 are still shown | Medium | — |
| TC-22 | Functional | Cart | Continue Shopping returns to the catalogue | On the cart page | 1. Click "Continue Shopping" | The inventory page opens and the cart contents are unchanged | Low | — |
| TC-23 | Functional | Cart | Reset App State clears the cart | Two items in the cart | 1. Open the burger menu <br> 2. Click "Reset App State" | The cart badge is cleared and the product buttons return to "Add to cart" | Medium | — |
| TC-24 | Edge | Checkout | Checkout with an empty cart | Logged in as `standard_user`, cart empty | 1. Open the cart <br> 2. Click Checkout | The application blocks checkout and tells the user the cart is empty | High | Defect BUG-004 |
| TC-25 | Negative | Checkout | First name missing | On checkout step one | 1. Fill last name and postal code <br> 2. Click Continue | Error "Error: First Name is required" and the user stays on step one | High | Automated TC-07 |
| TC-26 | Negative | Checkout | Last name missing | On checkout step one | 1. Fill first name and postal code <br> 2. Click Continue | Error "Error: Last Name is required" | High | Defect BUG-002 with `problem_user` |
| TC-27 | Negative | Checkout | Postal code missing | On checkout step one | 1. Fill both names <br> 2. Click Continue | Error "Error: Postal Code is required" | High | — |
| TC-28 | Functional | Checkout | Totals and tax on the summary | One $29.99 item in the cart, step two open | 1. Read Item total, Tax and Total | Item total $29.99, Tax $2.40 (8 per cent) and Total $32.39, where Total equals Item total plus Tax | High | Automated TC-08 |
| TC-29 | Edge | Checkout | Browser Back after a completed order | An order has just been completed | 1. Click the browser Back button | The order must not be re-submitted and a second "Finish" must not be offered | Medium | Observed: Back returns to step two with an active Finish button |
| TC-30 | Edge | Performance | Login response time for the latency account | On the login page | 1. Log in as `performance_glitch_user` <br> 2. Measure the time until the inventory list is rendered | The inventory page renders within the agreed budget of 1.5 seconds | Medium | Defect BUG-005 |

## 10. Traceability summary

| Coverage | Count |
| --- | --- |
| Manual test cases | 30 |
| Automated UI tests in `tests/ui/e2e.spec.js` | 8 |
| Automated API tests in `tests/api/reqres.spec.js` | 4 |
| Defects raised | 5, see [BUG_REPORTS.md](BUG_REPORTS.md) |

The API test cases for the reqres.in endpoints are documented in the "What each automated test covers" table in [README.md](README.md).
