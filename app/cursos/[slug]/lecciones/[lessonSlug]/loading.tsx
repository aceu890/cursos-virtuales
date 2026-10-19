import { CourseCardSkeleton } from "@/components/catalog/CourseCardSkeleton";

export default function LessonLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <CourseCardSkeleton />
    </div>
  );
}