// Deal Beacon — filtering and sorting.
// Pure functions over the deals list: given a state object they return the
// deals to show, in order. Nothing here touches the DOM, so the same logic
// drives the list view and the counts shown beside each filter.

import { discountPct, deals } from "./deals.js";

export const SORTS = {
  discount: { label: "Biggest discount", key: "discount" },
  price: { label: "Lowest price", key: "price" },
  verdict: { label: "Best verdict first", key: "verdict" },
  savings: { label: "Biggest saving ($)", key: "savings" },
};

const VERDICT_RANK = { "new-low": 0, strong: 1, routine: 2, inflated: 3 };

export function emptyState() {
  return { query: "", category: "All", store: "All", minDiscount: 0, sort: "discount" };
}

export function uniqueValues(field) {
  return [...new Set(deals.map((d) => d[field]))].sort();
}

export function matchesQuery(deal, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [deal.title, deal.store, deal.category, deal.verdict].join(" ").toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

export function filterDeals(all, state) {
  return all.filter((deal) => {
    if (state.category !== "All" && deal.category !== state.category) return false;
    if (state.store !== "All" && deal.store !== state.store) return false;
    if (discountPct(deal) < state.minDiscount) return false;
    return matchesQuery(deal, state.query);
  });
}

export function sortDeals(list, sortKey) {
  const sorted = [...list];
  if (sortKey === "discount") sorted.sort((a, b) => discountPct(b) - discountPct(a) || a.price - b.price);
  else if (sortKey === "price") sorted.sort((a, b) => a.price - b.price || discountPct(b) - discountPct(a));
  else if (sortKey === "verdict")
    sorted.sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || discountPct(b) - discountPct(a));
  else if (sortKey === "savings") sorted.sort((a, b) => b.was - b.price - (a.was - a.price));
  return sorted;
}

export function visibleDeals(state) {
  return sortDeals(filterDeals(deals, state), state.sort);
}

export function countsBy(field, state) {
  // Counts beside a filter reflect every other active filter (store, query,
  // discount), so a number never promises deals the current filters hide.
  const base = filterDeals(deals, { ...state, [field]: "All" });
  const counts = new Map();
  for (const deal of base) counts.set(deal[field], (counts.get(deal[field]) ?? 0) + 1);
  return counts;
}

export function stats() {
  const total = deals.length;
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  const totalSaved = deals.reduce((sum, d) => sum + (d.was - d.price), 0);
  const biggest = sortDeals(deals, "discount")[0];
  return { total, newLows, totalSaved: Math.round(totalSaved), biggest };
}
