import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

// Prose classes lifted from morroo's blog article so the reading style matches.
const PROSE =
  "prose prose-lg max-w-none " +
  "prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:text-foreground " +
  "prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl " +
  "prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-xl " +
  "prose-p:leading-8 prose-p:text-foreground/85 " +
  "prose-a:text-brand prose-a:font-medium prose-a:no-underline hover:prose-a:underline " +
  "prose-li:my-1 prose-li:text-foreground/85 " +
  "prose-strong:text-foreground " +
  "prose-blockquote:border-brand prose-blockquote:text-foreground/80 " +
  "prose-img:rounded-xl prose-img:border prose-img:border-border " +
  "prose-table:my-6 prose-table:text-sm " +
  "prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-semibold " +
  "prose-td:border prose-td:border-border prose-td:p-2";

export default function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn(PROSE, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
