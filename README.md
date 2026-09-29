# SauceDemo Automation Suite — Manual Test Plan, Bug Reports and Playwright Tests

[![Automation Suite CI](https://github.com/anshuyad4v/saucedemo-automation-suite/actions/workflows/playwright.yml/badge.svg)](https://github.com/anshuyad4v/saucedemo-automation-suite/actions/workflows/playwright.yml)

QA assignment deliverable covering one full testing cycle: a manual test plan, the defects found while executing it, and an automated regression suite that runs both UI and API tests in CI.

| Part | Deliverable | Where |
| --- | --- | --- |
| 1 | Test plan and 30 manual test cases | [TEST_PLAN.md](TEST_PLAN.md) |
| 2 | 5 defects with severity, priority and screenshots | [BUG_REPORTS.md](BUG_REPORTS.md), GitHub Issues and the project board |
| 3 | 8 automated UI tests (Playwright) | [tests/ui/e2e.spec.js](tests/ui/e2e.spec.js) |
| 4 | 4 automated API tests (reqres.in) | [tests/api/reqres.spec.js](tests/api/reqres.spec.js) |
| Bonus | GitHub Actions pipeline on every push | [.github/workflows/playwright.yml](.github/workflows/playwright.yml) |

Applications under test:

- UI — [www.saucedemo.com](https://www.saucedemo.com/)
- API — [reqres.in](https://reqres.in/)

Live run of the suite: the **Automation Suite CI** badge above links to the latest GitHub Actions run, and every run uploads the Playwright HTML report as a downloadable artifact.

## Project structure

```text
saucedemo-automation-suite/
├── .github/workflows/playwright.yml   CI pipeline (push, pull request, manual)
├── screenshots/                       Evidence images referenced by the bug reports
├── tests/
│   ├── api/reqres.spec.js             4 API tests against reqres.in
│   └── ui/e2e.spec.js                 8 UI tests against SauceDemo
├── BUG_REPORTS.md                     5 reported defects
├── TEST_PLAN.md                       Test plan and 30 manual test cases
├── package.json                       Scripts and the single dev dependency
└── playwright.config.js               Runner configuration (timeouts, reporters, browser)
```

## Prerequisites

- Node.js 18 or higher and npm
- Internet access (both targets are public sites)

## Setup and execution

```bash
git clone https://github.com/anshuyad4v/saucedemo-automation-suite.git
cd saucedemo-automation-suite
npm install
npm test
```

`npm install` also downloads the Chromium build that Playwright needs, through the `postinstall` script, so no extra install step is required.

| Command | What it does |
| --- | --- |
| `npm test` | Runs the full suite — 8 UI plus 4 API tests — headless |
| `npm run test:ui` | Runs only the SauceDemo UI tests |
| `npm run test:api` | Runs only the reqres.in API tests |
| `npm run test:headed` | Runs the UI tests with a visible browser, useful for watching the flows |
| `npm run report` | Opens the HTML report of the last run |

Expected result of `npm test` is 12 passed. Console output uses the `list` reporter and a full HTML report is written to `playwright-report/`.

## What each automated test covers

### UI tests — `tests/ui/e2e.spec.js`

| Test | Covers | Plan case |
| --- | --- | --- |
| TC-01 | Happy-path login with `standard_user`: URL, page title and that all 6 products render | TC-01 |
| TC-02 | Negative login with `locked_out_user`: the locked-out error is shown and the inventory is not reached | TC-02 |
| TC-03 | Submitting the login form with both fields empty returns "Username is required" | TC-04 |
| TC-04 | Sorting by "Price (low to high)" really reorders the catalogue, asserted on the parsed prices | TC-11 |
| TC-05 | Adding an item sets the cart badge to 1 and swaps the button to "Remove" | TC-16 |
| TC-06 | Removing the item hides the badge again and restores "Add to cart" | TC-18 |
| TC-07 | Checkout validation: with no first name, Continue is refused and the user stays on step one | TC-25 |
| TC-08 | Full purchase: item total $29.99, tax $2.40, total $32.39, then "Thank you for your order!" | TC-28 |

### API tests — `tests/api/reqres.spec.js`

| Test | Request | Asserts |
| --- | --- | --- |
| API-01 | `GET /api/users/2` | Status 200, `data` object with the expected id, email, first and last name, an absolute avatar URL and a `support.url` field |
| API-02 | `POST /api/users` with name and job | Status 201, the sent fields echoed back, a string `id` and a parsable `createdAt` timestamp |
| API-03 | `POST /api/register` without a password | Status 400 and body exactly `{ "error": "Missing password" }` |
| API-04 | `GET /api/users/23` (unknown id) | Status 404 and an empty JSON body |

Each API test checks the status code and the body shape, not only the status.

## Runner configuration

Set in [playwright.config.js](playwright.config.js):

- `baseURL` `https://www.saucedemo.com`, so UI tests navigate with `page.goto('/')`
- 60 s test timeout, 10 s assertion timeout, 15 s action timeout, 30 s navigation timeout
- Headless Chromium with the Desktop Chrome viewport, tests run in parallel
- `list` plus `html` reporters; trace on first retry and a screenshot on failure
- In CI only: one retry, a single worker and `forbidOnly`, for stable and reproducible runs

## Continuous integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs on every push and pull request to `main`, and can also be started manually from the Actions tab. The job checks out the repository, sets up Node.js 20 with an npm cache, installs dependencies with `npm ci`, installs Chromium with its system dependencies, runs `npm test` and uploads `playwright-report/` as an artifact — including when tests fail, so a failure can be investigated from the report.

## Notes on reliability

- Elements are located by the application's own `data-test` attributes, so the tests survive styling changes.
- Only `standard_user` is used for the automated flows; the seeded-defect accounts are covered in the manual plan and in the bug reports, so a known product defect does not turn the regression suite red.
- The API tests send the documented free key header `x-api-key: reqres-free-v1`, which keeps reqres.in reachable from shared CI IP addresses.
