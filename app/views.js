// Deal Beacon — rendering.
// Builds the HTML for the deals list and for one deal's detail page, from the
// data in deals.js and the state in filters.js. All text that comes from the
// data is escaped before it reaches the page.

import { CHECKED_LABEL, VERDICTS, deals, discountPct, money, savings } from "./deals.js";

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function verdictBadge(deal) {
  const v = VERDICTS[deal.verdict];
  return `<span class="verdict verdict-${escapeHtml(deal.verdict)}">${escapeHtml(v.label)}</span>`;
}

function priceLine(deal) {
  const pct = discountPct(deal);
  return `<p class="prices">
    <span class="sale">${money(deal.price)}</span>
    <span class="was"><s>${money(deal.was)}</s></span>
    <span class="pct">−${pct}%</span>
  </p>
  <p class="save">You save ${money(savings(deal))}</p>`;
}

export function dealCard(deal) {
  return `<article class="card">
    <header class="card-top">
      <span class="category">${escapeHtml(deal.category)}</span>
      ${verdictBadge(deal)}
    </header>
    <h3><a href="#/deal/${escapeHtml(deal.id)}">${escapeHtml(deal.title)}</a></h3>
    <p class="store">${escapeHtml(deal.store)}</p>
    ${priceLine(deal)}
    <p class="checked">Checked ${escapeHtml(CHECKED_LABEL)}</p>
    <p class="actions">
      <a class="btn-store" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} ↗</a>
      <a class="btn-detail" href="#/deal/${escapeHtml(deal.id)}">Details</a>
    </p>
  </article>`;
}

export function listHtml(list) {
  if (list.length === 0) {
    return `<div class="empty">
      <h2>No deals match those filters</h2>
      <p>Try a different search word, or clear the category, store or discount filter.</p>
    </div>`;
  }
  return `<p class="result-count">${list.length} deal${list.length === 1 ? "" : "s"} found</p>
  <div class="grid">${list.map(dealCard).join("")}</div>`;
}

export function detailHtml(deal) {
  const pct = discountPct(deal);
  const v = VERDICTS[deal.verdict];
  return `<article class="detail">
    <p class="back"><a href="#/">← All deals</a></p>
    <header class="card-top">
      <span class="category">${escapeHtml(deal.category)}</span>
      ${verdictBadge(deal)}
    </header>
    <h2>${escapeHtml(deal.title)}</h2>
    <p class="store">Sold by ${escapeHtml(deal.store)}</p>
    ${priceLine(deal)}
    <dl class="facts">
      <div><dt>Sale price</dt><dd>${money(deal.price)}</dd></div>
      <div><dt>Usual price</dt><dd>${money(deal.was)}</dd></div>
      <div><dt>Discount</dt><dd>−${pct}% (save ${money(savings(deal))})</dd></div>
      <div><dt>Verdict</dt><dd>${escapeHtml(v.label)} — ${escapeHtml(v.blurb)}</dd></div>
      <div><dt>Checked</dt><dd>${escapeHtml(CHECKED_LABEL)}</dd></div>
      <div><dt>Price read at</dt><dd><a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(deal.source)}</a></dd></div>
    </dl>
    <section class="evidence">
      <h3>Is it really a deal?</h3>
      <p>${escapeHtml(deal.evidence)}</p>
      <p class="note">${escapeHtml(deal.note)}</p>
    </section>
    ${compareHtml(deal)}
    <p class="actions">
      <a class="btn-store" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">Buy at ${escapeHtml(deal.store)} ↗</a>
      <a class="btn-detail" href="#/">Back to all deals</a>
    </p>
  </article>`;
}

export function findDeal(id) {
  return deals.find((d) => d.id === id) ?? null;
}

// Same product, other stores: a short price comparison, only where another
// store's price for the same product was actually seen in today's sources.
export function compareHtml(deal) {
  if (!deal.alsoAt || deal.alsoAt.length === 0) return "";
  const rows = deal.alsoAt
    .map(
      (other) =>
        `<li><a href="${escapeHtml(other.url)}" target="_blank" rel="noopener">${escapeHtml(other.store)}</a> — ${money(other.price)}</li>`,
    )
    .join("");
  return `<section class="compare">
    <h3>Same product elsewhere</h3>
    <ul>${rows}</ul>
    <p class="note">Prices seen in the same Nov 27 roundups; check before you buy.</p>
  </section>`;
}
