import type { Metadata } from "next";
import { CourseView } from "@/components/course/CourseView";
import { DEMO_COURSE_DETAIL } from "@/lib/courses/demo-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title =
    slug === DEMO_COURSE_DETAIL.slug
      ? DEMO_COURSE_DETAIL.title
      : "Mis cursos";
  return { title };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="py-4">
      <CourseView slug={slug} />
    </div>
  );
}
