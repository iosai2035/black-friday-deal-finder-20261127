# black-friday-deal-finder-20261127

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/iosai2035/black-friday-deal-finder-20261127/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/iosai2035/black-friday-deal-finder-20261127/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Deal Beacon is a static Black Friday deal finder: 36 real deals checked by hand on Friday, November 27, 2026, each with its store, sale price, usual price, discount, check time, the source where the price was read, and an honest verdict — new low, strong price, or routine sale — with the evidence behind it. Search, category, store and discount filters all work, deals sort by biggest discount, lowest price, best verdict or biggest saving, and every deal opens its own detail page. It runs from plain static files with no build step and no network loads.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.

## How the deals were checked

Every deal was read on Friday, November 27, 2026 from a live deals roundup or
a retailer's own Black Friday release that names the store and the price:
BeeBulletin, Benzinga/TradingView, NBC Select, Tom's Guide/TechRadar, CNN
Underscored, 9to5Toys and Gizmodo. Each deal in `app/deals.js` records the
store, sale price, usual price, the UTC check time, the source and its URL,
plus an honest verdict (new low / strong price / routine sale) with the
evidence. Discounts are computed from the two prices, never typed. No price
was invented: anything that could not be verified was left out.

## Files

- `app/index.html`, `app/style.css` — the page shell and the look.
- `app/deals.js` — the 36 verified deals and the price helpers.
- `app/filters.js` — search, category/store/discount filtering and sorting.
- `app/views.js` — the deal cards and the deal detail page.
- `app/main.js` — page state, hash routing and the filter controls.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and
  writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — three real renders of the running site (desktop list,
  desktop detail, phone list); `shots.json` says which is which.

---

<sub>Entered on [make.fun](https://make.fun/?ref=57z043hx&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
