import { getDestinationItems } from "@/lib/menu-destinations";
import { navigation } from "@/lib/site-navigation";

// Item count for every catalogue page in the menus, from the same
// definition the pages and the homepage Explore section use.
export function getMenuCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const menu of navigation) {
    for (const column of menu.megaMenu?.columns ?? []) {
      for (const item of column.items) {
        const items = getDestinationItems(item.href);
        if (items) counts[item.href] = items.length;
      }
    }
  }
  return counts;
}
