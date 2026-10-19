import { SectionArt } from "../ui/SectionArt";

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="neu rounded-[28px] px-6 py-16 text-center">
      <SectionArt section="catalog" size="sm" className="mx-auto mb-4" />
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>
    </div>
  );
}
