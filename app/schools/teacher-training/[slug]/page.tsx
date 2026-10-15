import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TeacherTrainingPage({
  params,
}: PageProps) {
  const { slug } = await params;

  return (
    <main>
      <section className="rx-section">
        <div className="rx-container">
          <p className="rx-content-meta-type">
            Teacher Training
          </p>

          <h1>{slug.replace(/-/g, " ")}</h1>

          <p>
            Practical professional development and STEM training
            for educators.
          </p>

          <Link
            href="/schools/teacher-training"
            className="rx-button rx-button-primary"
          >
            Back to Teacher Training
          </Link>
        </div>
      </section>
    </main>
  );
}