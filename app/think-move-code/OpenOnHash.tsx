"use client";

import { useEffect } from "react";

// A link such as /think-move-code#term-2 should open that term's accordion, not just scroll to it.
export default function OpenOnHash() {
  useEffect(() => {
    function openTarget() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
        target.scrollIntoView();
      }
    }
    openTarget();
    window.addEventListener("hashchange", openTarget);
    return () => window.removeEventListener("hashchange", openTarget);
  }, []);
  return null;
}
