import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const mdComponents: Components = {
  h1: ({ children }) => (
    <h2 className="font-display mt-8 text-[1.2rem] font-bold text-apple-ink sm:text-[1.35rem]">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="font-display mt-6 text-[1.05rem] font-bold text-apple-ink sm:text-[1.15rem]">{children}</h3>
  ),
  h3: ({ children }) => <h4 className="mt-4 text-[15px] font-bold text-apple-ink">{children}</h4>,
  p: ({ children }) => <p className="mt-2 text-[14px] leading-relaxed text-apple-subtle sm:text-[15px]">{children}</p>,
  ul: ({ children }) => <ul className="mt-2 list-inside list-disc space-y-1.5 text-[14px] text-apple-ink">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-inside list-decimal space-y-1.5 text-[14px] text-apple-ink">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[4px] hover:text-apple"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => (
    <code className={`rounded bg-u-lavender/40 px-1 py-0.5 font-mono text-[13px] text-apple-ink ${className ?? ""}`}>{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-orange-100/90 bg-white/95 p-3 text-[13px]">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-l-4 border-apple/40 bg-apple/5 px-3 py-2 text-[14px] text-apple-ink">{children}</blockquote>
  ),
  hr: () => <hr className="my-8 border-orange-100/90" />,
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto rounded-xl border border-orange-100/90 bg-white shadow-sm">
      <table className="min-w-full text-left text-[13px] text-apple-ink">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-orange-100/90 bg-u-lavender/20 text-[11px] font-bold uppercase tracking-[0.08em] text-apple">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 sm:px-4">{children}</th>,
  td: ({ children }) => <td className="border-t border-orange-100/70 px-3 py-2 text-apple-subtle sm:px-4">{children}</td>,
};

type Props = { markdown: string; className?: string };

export function ProgramMarkdownBlock({ markdown, className = "" }: Props) {
  const t = markdown.trim();
  if (!t) return null;
  return (
    <div className={`rounded-2xl border border-orange-100/80 bg-white/80 px-4 py-4 sm:px-5 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {t}
      </ReactMarkdown>
    </div>
  );
}
