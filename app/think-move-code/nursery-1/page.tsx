import { redirect } from "next/navigation";

// The book's first address now forwards to the Think • Move • Code! home, where Nursery 1 lives.
export default function Nursery1Page() {
  redirect("/think-move-code");
}
