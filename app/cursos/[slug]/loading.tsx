import { CourseCardSkeleton } from "@/components/catalog/CourseCardSkeleton";

export default function CourseLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <CourseCardSkeleton />
    </div>
  );
}
