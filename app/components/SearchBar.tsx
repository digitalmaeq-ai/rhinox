"use client";

import type { FormEvent } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Search...",
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      className="rx-search-bar"
      onSubmit={handleSubmit}
    >
      <label>
        <span className="sr-only">Search</span>

        <input
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
        />
      </label>

      <button type="submit">
        Search
      </button>
    </form>
  );
}
