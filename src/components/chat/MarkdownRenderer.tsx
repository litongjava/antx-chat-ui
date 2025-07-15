///MarkdownRenderer.tsx
import React, {useMemo} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import './CodeBlock.css';
import './MarkdownRenderer.css'
import CodeBlock from "./CodeBlock.tsx";

interface MarkdownRendererImplProps {
  /** The markdown content to render, possibly containing LaTeX expressions */
  content: string;
  /** Optional additional className for the wrapper div */
  className?: string;
  loading: boolean;
  onRunCode?: (code: string, language: string) => void;
}

const MarkdownRendererImpl: React.FC<MarkdownRendererImplProps> = ({content, className, loading, onRunCode}) => {
  const processedContent = useMemo(() => {
    if (!content) return content;
    return content.replace(/\\\((.+?)\\\)/g, '$$$1$$').replace(/\\\[(.+?)\\\]/gs, '$$$$\n$1\n$$$$');
  }, [content]);


  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({href, children, ...props}) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          code: ({node, inline, className: langClass, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(langClass || '');
            if (inline || !match) {
              return <code className={langClass} {...props}>{children}</code>;
            }
            return (
              <CodeBlock
                code={String(children)}
                language={match[1]}
                loading={loading}
                onRunCode={onRunCode}
              />
            );
          },
          table: ({children}: { children?: React.ReactNode }) => (
            <div className="table-container">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          th: ({children}: { children?: React.ReactNode }) => (
            <th className="table-header">{children}</th>
          ),
          td: ({children}: { children?: React.ReactNode }) => (
            <td className="table-cell">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(
  MarkdownRendererImpl,
  (prev, next) => {
    const result = prev.content === next.content
      && prev.loading === next.loading;
    return result;
  }
);
