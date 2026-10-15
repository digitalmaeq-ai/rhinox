"use client";

import type { ChangeEvent } from "react";

interface FilterBarProps {
  value?: string;
  options: string[];
  onChange?: (value: string) => void;
  label?: string;
}

export default function FilterBar({
  value = "",
  options,
  onChange,
  label = "Filter",
}: FilterBarProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="rx-filter-bar">
      <label>
        {label}
        <select value={value} onChange={handleChange}>
          <option value="">All</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
