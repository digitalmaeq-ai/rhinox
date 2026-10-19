import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="rx-section">
        <div className="rx-container">
          <p className="rx-content-meta-type">Rhinox Scientifica</p>
          <h1>Page not found</h1>
          <p>We could not find the page you were looking for. It may have moved.</p>
          <Link href="/" className="rx-button rx-button-primary">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
