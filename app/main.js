// Deal Beacon — wiring.
// Owns the page state (search text, filters, sort, hash route), builds the
// filter controls once, and re-renders the list or one deal's page whenever
// the state or the hash changes. The deals themselves live in deals.js, the
// filtering in filters.js and the markup in views.js.

import { CHECKED_LABEL, deals } from "./deals.js";
import { SORTS, countsBy, emptyState, stats, uniqueValues, visibleDeals } from "./filters.js";
import { detailHtml, findDeal, listHtml } from "./views.js";

const state = emptyState();
const app = document.getElementById("app");
const searchBox = document.getElementById("search");
const categoryBox = document.getElementById("category");
const storeBox = document.getElementById("store");
const discountBox = document.getElementById("min-discount");
const sortBox = document.getElementById("sort");
const toolbar = document.getElementById("toolbar");
const summary = document.getElementById("summary");

function option(value, label, count) {
  const suffix = count === undefined ? "" : ` (${count})`;
  return `<option value="${value}">${label}${suffix}</option>`;
}

function buildControls() {
  const catCounts = countsBy("category", state);
  const storeCounts = countsBy("store", state);
  categoryBox.innerHTML =
    option("All", "All categories") +
    uniqueValues("category")
      .map((c) => option(c, c, catCounts.get(c) ?? 0))
      .join("");
  storeBox.innerHTML =
    option("All", "All stores") +
    uniqueValues("store")
      .map((s) => option(s, s, storeCounts.get(s) ?? 0))
      .join("");
  discountBox.innerHTML = [0, 20, 30, 40, 50]
    .map((n) => option(String(n), n === 0 ? "Any discount" : `${n}% off or more`))
    .join("");
  sortBox.innerHTML = Object.entries(SORTS)
    .map(([key, s]) => option(key, s.label))
    .join("");
  categoryBox.value = state.category;
  storeBox.value = state.store;
  discountBox.value = String(state.minDiscount);
  sortBox.value = state.sort;
}

function refreshCounts() {
  const catCounts = countsBy("category", state);
  const storeCounts = countsBy("store", state);
  for (const el of categoryBox.options) {
    if (el.value !== "All") el.textContent = `${el.value} (${catCounts.get(el.value) ?? 0})`;
  }
  for (const el of storeBox.options) {
    if (el.value !== "All") el.textContent = `${el.value} (${storeCounts.get(el.value) ?? 0})`;
  }
}

function renderSummary() {
  const s = stats();
  summary.innerHTML = `<strong>${s.total} verified deals</strong> · ${s.newLows} new lows · ` +
    `<strong>$${s.totalSaved.toLocaleString("en-US")} total savings</strong> · ` +
    `biggest cut: ${s.biggest.title} −${Math.round(((s.biggest.was - s.biggest.price) / s.biggest.was) * 100)}% · ` +
    `all prices checked ${CHECKED_LABEL}`;
}

function render() {
  const hash = location.hash;
  const match = hash.match(/^#\/deal\/([\w-]+)$/);
  window.scrollTo(0, 0);
  if (match) {
    const deal = findDeal(match[1]);
    toolbar.hidden = true;
    app.innerHTML = deal
      ? detailHtml(deal)
      : `<div class="empty"><h2>Deal not found</h2><p><a href="#/">Back to all deals</a></p></div>`;
    document.title = deal ? `${deal.title} — Deal Beacon` : "Deal Beacon";
    return;
  }
  toolbar.hidden = false;
  document.title = "Deal Beacon — Black Friday deals, checked today";
  const list = visibleDeals(state);
  app.innerHTML = listHtml(list);
  refreshCounts();
}

searchBox.addEventListener("input", () => {
  state.query = searchBox.value;
  render();
});
categoryBox.addEventListener("change", () => {
  state.category = categoryBox.value;
  render();
});
storeBox.addEventListener("change", () => {
  state.store = storeBox.value;
  render();
});
discountBox.addEventListener("change", () => {
  state.minDiscount = Number(discountBox.value);
  render();
});
sortBox.addEventListener("change", () => {
  state.sort = sortBox.value;
  render();
});
document.getElementById("clear-filters").addEventListener("click", () => {
  Object.assign(state, emptyState());
  searchBox.value = "";
  buildControls();
  render();
});
window.addEventListener("hashchange", render);

// Pressing / anywhere on the page jumps to the search box, so a shopper can
// start typing a product name without reaching for the mouse.
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchBox) {
    event.preventDefault();
    searchBox.focus();
  }
  if (event.key === "Escape" && document.activeElement === searchBox) {
    searchBox.value = "";
    state.query = "";
    render();
  }
});

buildControls();
renderSummary();
render();
