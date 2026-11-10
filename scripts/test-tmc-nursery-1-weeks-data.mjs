/**
 * Data checks for the Nursery 1 week list (lib/tmc/nursery-1-weeks.ts).
 * Every week must point at a real children's page and Teacher Guide page, in order.
 * Page limits are the final books: Activity Book 110 pages, Teacher Guide 84 pages.
 */
import assert from "node:assert/strict";
import { NURSERY_1_WEEKS } from "../lib/tmc/nursery-1-weeks.ts";

const AB_PAGES = 110;
const TG_PAGES = 84;
let previousAb = 0;
let previousTg = 0;

assert.equal(NURSERY_1_WEEKS.length, 39, "39 weeks");
for (const week of NURSERY_1_WEEKS) {
  const label = `Term ${week.term} Week ${week.week}`;
  assert.ok(Number.isInteger(week.activityBookPage), `${label}: Activity Book page is set`);
  assert.ok(week.activityBookPage >= 6 && week.activityBookPage <= AB_PAGES, `${label}: Activity Book page in range`);
  assert.ok(Number.isInteger(week.teacherGuidePage), `${label}: Teacher Guide page is set`);
  assert.ok(week.teacherGuidePage >= 8 && week.teacherGuidePage <= TG_PAGES, `${label}: Teacher Guide page in range`);
  assert.ok(week.activityBookPage > previousAb, `${label}: Activity Book pages increase through the year`);
  assert.ok(week.teacherGuidePage > previousTg, `${label}: Teacher Guide pages increase through the year`);
  previousAb = week.activityBookPage;
  previousTg = week.teacherGuidePage;
}
const pageOf = (term, week) => NURSERY_1_WEEKS.find((w) => w.term === term && w.week === week).activityBookPage;
assert.deepEqual([pageOf(1, 12), pageOf(2, 12), pageOf(3, 12)], [38, 73, 108], "Week 12 'My stars' pages");
assert.deepEqual([pageOf(1, 13), pageOf(2, 13), pageOf(3, 13)], [39, 74, 109], "Week 13 badge pages");
console.log("Nursery 1 week data checks passed (39 weeks, page references set and ordered).");
