import Link from "next/link";

export default function HomePage() {
  return (
    <main className="calix-home">
      <section className="calix-home__hero">
        <p className="calix-home__eyebrow"><span>&lt;/&gt;</span> Headless by design. Built for React.</p>
        <h1>Dates, without<br />constraints.</h1>
        <p className="calix-home__lede">
          A production-grade DatePicker for React — accessible, typed, and ready for every calendar your product needs.
        </p>
        <div className="calix-home__actions">
          <Link href="/docs" className="calix-home__primary">Get started</Link>
          <Link href="/docs/playground" className="calix-home__secondary">Open playground <span aria-hidden>&lt;/&gt;</span></Link>
        </div>
        <dl className="calix-home__details">
          <div><dt>Framework</dt><dd>React 19</dd></div>
          <div><dt>Calendars</dt><dd>Gregorian · Jalali</dd></div>
          <div><dt>Rendering</dt><dd>SSR-safe</dd></div>
        </dl>
      </section>
    </main>
  );
}
