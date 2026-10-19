import type { LessonReadingBlock } from "@/lib/simulation/flowTypes";

export function LessonReading({ blocks }: { blocks: LessonReadingBlock[] }) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="neu max-w-2xl space-y-3 rounded-[28px] p-5 leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              className="font-display pt-1 text-xl tracking-tight"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="list-disc space-y-1.5 pl-5 text-base">
              {(block.items ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-base text-muted">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
