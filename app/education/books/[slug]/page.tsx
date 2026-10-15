import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Books are products (see content/books/think-move-code.ts) with exactly
// one canonical detail page at /shop/books/[slug]. This route stays live
// only so existing /education/books/... links keep working.
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/shop/books/${slug}`);
}
