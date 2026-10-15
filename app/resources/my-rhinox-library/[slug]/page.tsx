import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LibraryItemPage({
  params,
}: PageProps) {
  const { slug } = await params;

  return (
    <main>
      <section className="rx-section">
        <div className="rx-container">
          <p className="rx-content-meta-type">
            My Rhinox Library
          </p>

          <h1>{slug.replace(/-/g, " ")}</h1>

          <p>
            Personal library functionality will be connected
            in a future platform phase.
          </p>

          <Link
            href="/resources/my-rhinox-library"
            className="rx-button rx-button-primary"
          >
            Back to My Rhinox Library
          </Link>
        </div>
      </section>
    </main>
  );
}