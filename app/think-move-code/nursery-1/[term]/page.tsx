import { notFound, redirect } from "next/navigation";

import { N1_BASE, NURSERY_1_TERMS } from "@/lib/tmc/nursery-1";

interface TermPageProps {
  params: Promise<{ term: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return NURSERY_1_TERMS.map((term) => ({ term: `term-${term.term}` }));
}

// A term has no page of its own: it is a section of the week list.
export default async function TermPage({ params }: TermPageProps) {
  const { term } = await params;
  if (!/^term-[1-3]$/.test(term)) notFound();
  redirect(`${N1_BASE}#${term}`);
}
