import type { Metadata } from "next";
import { LessonView } from "@/components/lesson/LessonView";

export const metadata: Metadata = {
  title: "Lección",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  return (
    <div className="py-4">
      <LessonView slug={slug} lessonSlug={lessonSlug} />
    </div>
  );
}
