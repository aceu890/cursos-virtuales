export function CourseCardSkeleton() {
  return (
    <div className="neu rounded-[28px] p-5">
      <div className="neu-inset mb-4 h-28 animate-pulse rounded-[22px]" />
      <div className="neu-inset h-7 w-3/4 animate-pulse rounded" />
      <div className="neu-inset mt-3 h-16 animate-pulse rounded" />
      <div className="neu-inset mt-4 h-4 w-1/2 animate-pulse rounded" />
    </div>
  );
}
