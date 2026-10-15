import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VirtualLabDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  return (
    <main>
      <section className="rx-section">
        <div className="rx-container">
          <p className="rx-content-meta-type">
            Virtual Lab
          </p>

          <h1>{slug.replace(/-/g, " ")}</h1>

          <p>
            This interactive virtual laboratory experience is
            being prepared by Rhinox Scientifica.
          </p>

          <Link
            href="/explore/virtual-lab"
            className="rx-button rx-button-primary"
          >
            Back to Virtual Labs
          </Link>
        </div>
      </section>
    </main>
  );
}