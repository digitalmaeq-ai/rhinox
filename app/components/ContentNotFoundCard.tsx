import Link from "next/link";

interface ContentNotFoundCardProps {
  label: string;
}

// Shared "not found" state for the generic content engine (app/[...path]).
// Every content section used to duplicate this exact markup (only the
// heading text differed) across ~14 separate [slug]/page.tsx files.
export default function ContentNotFoundCard({
  label,
}: ContentNotFoundCardProps) {
  return (
    <main>
      <section className="rx-section">
        <div className="rx-container">
          <p className="rx-content-meta-type">Rhinox Scientifica</p>
          <h1>{label}</h1>

          <p>The requested content could not be found.</p>

          <Link href="/" className="rx-button rx-button-primary">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
