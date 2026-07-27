"use client";

import { Calendar } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import Link from "next/link";

const features = [
  [
    "Any calendar",
    "Gregorian and Jalali today, with adapters for the calendars your product needs.",
  ],
  [
    "Headless control",
    "Composable primitives give product teams complete control over markup and behavior.",
  ],
  [
    "Accessible by default",
    "Keyboard navigation, focus management, grid semantics, and reduced-motion support.",
  ],
  [
    "Built for real flows",
    "Single, range, multiple, business-day, holiday, and date-time selection.",
  ],
];

export default function HomePage() {
  return (
    <main className="calix-home">
      <section className="calix-home__hero">
        <div className="calix-home__copy">
          <p className="calix-home__eyebrow">
            <span aria-hidden>&lt;/&gt;</span> Headless by design. Built for React.
          </p>
          <h1>Dates, without constraints.</h1>
          <p className="calix-home__lede">
            A production-grade DatePicker for React — accessible, typed, and ready for every
            calendar your product needs.
          </p>
          <div className="calix-home__actions">
            <Link href="/docs" className="calix-home__primary">
              Get started <span aria-hidden>→</span>
            </Link>
            <Link href="/docs/playground" className="calix-home__secondary">
              Open playground <span aria-hidden>↗</span>
            </Link>
          </div>
          <div className="calix-home__links" aria-label="Project links">
            <a href="https://github.com/ualiyou/calix-datepicker" target="_blank" rel="noreferrer">
              GitHub <span aria-hidden>↗</span>
            </a>
            <a
              href="https://www.npmjs.com/package/@alydev/datepicker"
              target="_blank"
              rel="noreferrer"
            >
              npm <span aria-hidden>↗</span>
            </a>
          </div>
          <dl className="calix-home__details">
            <div>
              <dt>Framework</dt>
              <dd>React 19</dd>
            </div>
            <div>
              <dt>Calendars</dt>
              <dd>Gregorian · Jalali</dd>
            </div>
            <div>
              <dt>Rendering</dt>
              <dd>SSR-safe</dd>
            </div>
          </dl>
        </div>

        <aside className="calix-home__preview" aria-label="Interactive calendar preview">
          <p>Live preview</p>
          <Calendar adapter={gregorian} locale="en-US" showToday />
          <span>Keyboard-ready · Fully themeable</span>
        </aside>
      </section>

      <section className="calix-home__section" aria-labelledby="features-title">
        <div className="calix-home__section-heading">
          <p>Designed for product teams</p>
          <h2 id="features-title">The date layer you do not have to rebuild.</h2>
        </div>
        <div className="calix-home__feature-grid">
          {features.map(([title, description], index) => (
            <article key={title} className="calix-home__feature">
              <span aria-hidden>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="calix-home__section calix-home__code-section"
        aria-labelledby="install-title"
      >
        <div className="calix-home__section-heading">
          <p>Start small</p>
          <h2 id="install-title">One package. Your own interface.</h2>
          <p>
            Use the styled components or compose the headless primitives into your existing design
            system.
          </p>
        </div>
        <div className="calix-home__code-card">
          <div>
            <span>Terminal</span>
            <span>npm</span>
          </div>
          <code>npm install @alydev/datepicker @alydev/adapter-gregorian</code>
        </div>
      </section>

      <section className="calix-home__section calix-home__cta" aria-labelledby="cta-title">
        <div>
          <p>Open source, ready to ship</p>
          <h2 id="cta-title">Build the date experience your product deserves.</h2>
        </div>
        <div className="calix-home__actions">
          <a
            className="calix-home__primary"
            href="https://www.npmjs.com/package/@alydev/datepicker"
            target="_blank"
            rel="noreferrer"
          >
            View on npm <span aria-hidden>↗</span>
          </a>
          <a
            className="calix-home__secondary"
            href="https://github.com/ualiyou/calix-datepicker"
            target="_blank"
            rel="noreferrer"
          >
            Star on GitHub <span aria-hidden>↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
