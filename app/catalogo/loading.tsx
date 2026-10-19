import { CourseCardSkeleton } from "@/components/catalog/CourseCardSkeleton";

export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-10 w-48 animate-pulse rounded bg-line" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <CourseCardSkeleton />
        <CourseCardSkeleton />
      </div>
    </div>
  );
}
