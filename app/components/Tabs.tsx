"use client";

import { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({
  items,
  defaultTab,
  className = "",
}: TabsProps) {
  const initialTab = defaultTab || items[0]?.id || "";
  const [activeTab, setActiveTab] = useState(initialTab);

  const activeItem = items.find(
    (item) => item.id === activeTab
  );

  if (!items.length) {
    return null;
  }

  return (
    <div className={`rx-tabs ${className}`}>
      <div
        className="rx-tabs-list"
        role="tablist"
        aria-label="Content sections"
      >
        {items.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${item.id}`}
              id={`tab-${item.id}`}
              className={`rx-tab ${
                isActive ? "is-active" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`tab-panel-${activeItem?.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeItem?.id}`}
        className="rx-tabs-panel"
        tabIndex={0}
      >
        {activeItem?.content}
      </div>
    </div>
  );
}