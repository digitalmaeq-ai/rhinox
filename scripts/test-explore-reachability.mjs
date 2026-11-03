#!/usr/bin/env node
// Explore reachability snapshot.
//
// The homepage Explore "By site menu" view is built from the same navigation
// data as the header menu. This test records every menu, link and Explore
// taxonomy mapping that exists today and fails if any of them is lost, so a
// menu change can never silently remove something from Explore.
//
// Adding new entries is allowed. Removing or changing an existing one fails
// until the change is made on purpose with: node scripts/test-explore-reachability.mjs --update
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { navigation, menuTaxonomy, EXPLORE_MENUS } from "../lib/site-navigation.ts";

const SNAPSHOT = new URL("./snapshots/explore-reachability.json", import.meta.url);

const current = {
  exploreMenus: [...EXPLORE_MENUS],
  menus: Object.fromEntries(
    navigation.map((item) => [
      item.label,
      {
        href: item.href,
        links: (item.megaMenu?.columns ?? []).flatMap((column) => column.items.map((entry) => entry.href)),
      },
    ]),
  ),
  taxonomy: JSON.parse(JSON.stringify(menuTaxonomy)),
};

if (process.argv.includes("--update")) {
  writeFileSync(SNAPSHOT, JSON.stringify(current, null, 2) + "\n");
  console.log("Explore reachability snapshot updated.");
  process.exit(0);
}

const saved = JSON.parse(readFileSync(SNAPSHOT, "utf8"));

for (const label of saved.exploreMenus) {
  assert.ok(current.exploreMenus.includes(label), `Explore no longer lists the menu: ${label}`);
}
for (const [label, menu] of Object.entries(saved.menus)) {
  const now = current.menus[label];
  assert.ok(now, `The menu "${label}" is gone.`);
  assert.equal(now.href, menu.href, `The menu "${label}" now points to ${now.href}, not ${menu.href}.`);
  for (const href of menu.links) {
    assert.ok(now.links.includes(href), `The link ${href} was removed from the "${label}" menu.`);
  }
}
for (const [href, target] of Object.entries(saved.taxonomy)) {
  assert.deepEqual(current.taxonomy[href], target, `The Explore mapping for ${href} was removed or changed.`);
}

const links = Object.values(saved.menus).reduce((n, menu) => n + menu.links.length, 0);
console.log(`Explore reachability checks passed: ${Object.keys(saved.menus).length} menus, ${links} links, ${Object.keys(saved.taxonomy).length} Explore mappings all still reachable.`);
