import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface MathMarkdownRendererProps {
  /** The markdown content to render, possibly containing LaTeX expressions */
  content: string;
  /** Optional additional className for the wrapper div */
  className?: string;
}

/**
 * A reusable Markdown renderer with support for tables, syntax highlighting, and LaTeX.
 */
const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({ content, className }) => {
  const processedContent = useMemo(() => {
    if (!content) return content;

    let processed = content;

    // 将 \( \) 转换为 $ $
    processed = processed.replace(/\\\((.*?)\\\)/g, '$$$1$$');

    // 将 \[ \] 转换为 $$ $$
    processed = processed.replace(/\\\[(.*?)\\\]/gs, '$$$$\n$1\n$$$$');

    // 处理常见的LaTeX数学环境
    const mathEnvironments = ['equation', 'align', 'gather', 'multline', 'split', 'cases'];
    mathEnvironments.forEach(env => {
      const regex = new RegExp(`\\\\begin\\{${env}\\}(.*?)\\\\end\\{${env}\\}`, 'gs');
      processed = processed.replace(regex, `$$\n\\\\begin{${env}}$1\\\\end{${env}}\n$$`);
    });

    return processed;
  }, [content]);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className: langClass, children, ...props }) {
            const match = /language-(\w+)/.exec(langClass || '');
            if (inline || !match) {
              return <code className={langClass} {...props}>{children}</code>;
            }
            return (
              <SyntaxHighlighter
                style={materialDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          table({ children }) {
            return (
              <div className="table-container">
                <table className="markdown-table">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="table-header">{children}</th>;
          },
          td({ children }) {
            return <td className="table-cell">{children}</td>;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MathMarkdownRenderer;
