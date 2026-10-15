"use client";

import { useState } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = "",
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  function toggleItem(id: string) {
    setOpenItems((current) => {
      const isOpen = current.includes(id);

      if (isOpen) {
        return current.filter((itemId) => itemId !== id);
      }

      if (allowMultiple) {
        return [...current, id];
      }

      return [id];
    });
  }

  return (
    <div className={`rx-accordion ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div
            key={item.id}
            className={`rx-accordion-item ${
              isOpen ? "is-open" : ""
            }`}
          >
            <button
              type="button"
              className="rx-accordion-trigger"
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
              onClick={() => toggleItem(item.id)}
            >
              <span className="rx-accordion-index">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="rx-accordion-title">
                {item.title}
              </span>

              <span
                className="rx-accordion-icon"
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              id={`accordion-panel-${item.id}`}
              className="rx-accordion-panel"
              role="region"
              aria-hidden={!isOpen}
            >
              <div className="rx-accordion-panel-inner">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}