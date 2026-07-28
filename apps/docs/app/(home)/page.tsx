"use client";

import { Calendar } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import Link from "next/link";

const features = [
  [
    "Calendar-native",
    "Gregorian, Jalali, Hijri, and Buddhist adapters share one predictable API.",
  ],
  [
    "Own the interface",
    "Start with a ready-made picker or compose the headless primitives into your system.",
  ],
  [
    "Accessible by default",
    "Keyboard navigation, focus restoration, ARIA grid semantics, and reduced motion are built in.",
  ],
  [
    "Ready for real flows",
    "Single, range, multiple, holiday, business-day, and date-time selection in one layer.",
  ],
];

const proof = ["React 18 / 19", "TypeScript", "SSR-safe", "RTL / LTR", "Four calendars"];

function CalixMark() {
  return (
    <svg className="calix-home__mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.5 7.25a7.5 7.5 0 1 0 0 9.5" />
      <circle className="calix-home__mark-accent" cx="18.25" cy="12" r="2" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="calix-home">
      <nav className="calix-home__nav" aria-label="Primary navigation">
        <Link href="/" className="calix-home__brand" aria-label="Calix home">
          <CalixMark />
          <span>Calix</span>
        </Link>
        <div className="calix-home__nav-links">
          <Link href="/docs">Docs</Link>
          <Link href="/docs/playground">Playground</Link>
          <a href="https://github.com/ualiyou/calix-datepicker" target="_blank" rel="noreferrer">
            GitHub <span aria-hidden>↗</span>
          </a>
        </div>
        <a className="calix-home__nav-cta" href="#install">
          Install
        </a>
      </nav>

      <section className="calix-home__hero">
        <div className="calix-home__copy">
          <h1>Every calendar. One date layer.</h1>
          <p className="calix-home__lede">
            Accessible date primitives for React products that need more than a single locale,
            a single calendar, or a fragile popup.
          </p>
          <div className="calix-home__actions">
            <Link href="/docs" className="calix-home__primary">
              Read the docs <span aria-hidden>→</span>
            </Link>
            <Link href="/docs/playground" className="calix-home__secondary">
              Open playground <span aria-hidden>↗</span>
            </Link>
          </div>
          <dl className="calix-home__details">
            <div>
              <dt>Framework</dt>
              <dd>React 18 / 19</dd>
            </div>
            <div>
              <dt>Calendars</dt>
              <dd>Four adapters</dd>
            </div>
            <div>
              <dt>Rendering</dt>
              <dd>SSR-safe</dd>
            </div>
          </dl>
        </div>

        <aside className="calix-home__preview" aria-label="Interactive calendar preview">
          <div className="calix-home__preview-header">
            <p>Live component</p>
            <span>Keyboard-ready</span>
          </div>
          <Calendar adapter={gregorian} locale="en-US" showToday showClear />
          <span>Use the component, or own every element.</span>
        </aside>
      </section>

      <section className="calix-home__proof" aria-label="Calix capabilities">
        {proof.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </section>

      <section className="calix-home__section" aria-labelledby="features-title">
        <div className="calix-home__section-heading">
          <p>Designed for product teams</p>
          <h2 id="features-title">Stop rebuilding dates in every product.</h2>
          <p>
            Calix keeps calendar logic, locale behavior, and accessible interactions in one
            tested layer—without forcing a design system on your app.
          </p>
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
        id="install"
        className="calix-home__section calix-home__code-section"
        aria-labelledby="install-title"
      >
        <div className="calix-home__section-heading">
          <p>Start in one command</p>
          <h2 id="install-title">The interface is yours. The hard parts are not.</h2>
          <p>
            Use the styled components or compose the headless primitives into your existing design
            system.
          </p>
        </div>
        <div className="calix-home__code-card">
          <div className="calix-home__code-tabs">
            <span>Terminal</span>
            <span>npm</span>
          </div>
          <code>npm install @alydev/datepicker @alydev/adapter-gregorian</code>
          <pre>{`import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";

<DatePicker adapter={gregorian} locale="en-US" />;`}</pre>
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
