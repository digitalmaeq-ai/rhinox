"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface SliderItem {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  image?: string;
  imageAlt?: string;
  meta?: string;
}

interface SliderProps {
  items: SliderItem[];
  className?: string;
  showControls?: boolean;
}

export default function Slider({
  items,
  className = "",
  showControls = true,
}: SliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) {
    return null;
  }

  const activeItem = items[activeIndex];

  function previous() {
    setActiveIndex((current) =>
      current === 0
        ? items.length - 1
        : current - 1
    );
  }

  function next() {
    setActiveIndex((current) =>
      current === items.length - 1
        ? 0
        : current + 1
    );
  }

  return (
    <section
      className={`rx-slider ${className}`}
      aria-label="Featured content"
    >
      <div className="rx-slider-main">
        {activeItem.image && (
          <div className="rx-slider-media">
            <Image
              src={activeItem.image}
              alt={activeItem.imageAlt || ""}
              width={1800}
              height={1000}
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
        )}

        <div className="rx-slider-content">
          {activeItem.eyebrow && (
            <span className="rx-eyebrow">
              {activeItem.eyebrow}
            </span>
          )}

          <h2>{activeItem.title}</h2>

          {activeItem.description && (
            <p>{activeItem.description}</p>
          )}

          {activeItem.meta && (
            <span className="rx-slider-meta">
              {activeItem.meta}
            </span>
          )}

          {activeItem.href && (
            <div className="rx-slider-action">
              <Link
                href={activeItem.href}
                className="rx-slider-link"
              >
                <span>
                  {activeItem.linkLabel || "Explore"}
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {showControls && (
        <div className="rx-slider-controls">
          <div className="rx-slider-counter">
            <span>
              {String(activeIndex + 1).padStart(2, "0")}
            </span>

            <span className="rx-slider-counter-divider">
              /
            </span>

            <span>
              {String(items.length).padStart(2, "0")}
            </span>
          </div>

          <div className="rx-slider-dots">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`rx-slider-dot ${
                  index === activeIndex
                    ? "is-active"
                    : ""
                }`}
                aria-label={`Show ${item.title}`}
                aria-current={
                  index === activeIndex
                    ? "true"
                    : undefined
                }
                onClick={() =>
                  setActiveIndex(index)
                }
              />
            ))}
          </div>

          <div className="rx-slider-arrows">
            <button
              type="button"
              className="rx-slider-arrow"
              aria-label="Previous slide"
              onClick={previous}
            >
              <span aria-hidden="true">
                ←
              </span>
            </button>

            <button
              type="button"
              className="rx-slider-arrow"
              aria-label="Next slide"
              onClick={next}
            >
              <span aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}