import { redirect } from "next/navigation";

import { N1_BASE } from "@/lib/tmc/nursery-1";

// Nursery 1 is the first book with week pages; the series page comes later.
export default function ThinkMoveCodePage() {
  redirect(N1_BASE);
}
