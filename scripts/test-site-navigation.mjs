#!/usr/bin/env node
import assert from "node:assert/strict";
import { navigation, menuTaxonomy, EXPLORE_MENUS, getPageForTaxonomy } from "../lib/site-navigation.ts";

// Every menu the Explore "Site menu" view lists must exist in the header.
for (const label of EXPLORE_MENUS) assert.ok(navigation.some((item) => item.label === label), `Explore lists a menu that the header lacks: ${label}`);

// No link appears twice inside one dropdown.
for (const menu of navigation) {
  const hrefs = (menu.megaMenu?.columns ?? []).flatMap((column) => column.items.map((item) => item.href));
  assert.equal(new Set(hrefs).size, hrefs.length, `Duplicate link inside the ${menu.label} menu`);
}

// Code Studio is in the Coding & Robotics dropdown and maps to its own explore branch.
const coding = navigation.find((item) => item.label === "CODING & ROBOTICS");
const codeStudio = coding?.megaMenu?.columns.flatMap((column) => column.items).find((item) => item.href === "/coding-robotics/code-studio");
assert.ok(codeStudio, "Code Studio must be in the CODING & ROBOTICS dropdown.");
assert.deepEqual(menuTaxonomy["/coding-robotics/code-studio"], { category: "educational", path: ["technology", "rhinox-code-studio"] });
assert.equal(getPageForTaxonomy("educational", ["technology", "rhinox-code-studio"]), "/coding-robotics/code-studio",
  "The Code Studio explore branch must lead to the Code Studio page, not the broader Coding & Robotics page.");
assert.equal(getPageForTaxonomy("educational", ["technology"]), "/education/coding-robotics");

// Every mapped page must be a link that really appears in a menu.
const menuHrefs = new Set(navigation.flatMap((item) => [item.href, ...(item.megaMenu?.columns ?? []).flatMap((column) => column.items.map((entry) => entry.href))]));
for (const href of Object.keys(menuTaxonomy)) assert.ok(menuHrefs.has(href) || href.startsWith("/shop/"), `Explore maps a page that no menu links to: ${href}`);
console.log("Site navigation checks passed: header, Explore menus and taxonomy agree.");
