import React, {useMemo} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import CopyButton from "../CopyButton.tsx";
import {Terminal} from "lucide-react";

interface MathMarkdownRendererProps {
  /** The markdown content to render, possibly containing LaTeX expressions */
  content: string;
  /** Optional additional className for the wrapper div */
  className?: string;
}

/**
 * A reusable Markdown renderer with support for tables, syntax highlighting, and LaTeX.
 */
const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({content, className}) => {
// 在您的 PlayerPage.tsx 文件顶部添加预处理函数

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
          pre: ({ children }) => <pre className="not-prose">{children}</pre>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            if (match?.length) {
              const id = Math.random().toString(36).substr(2, 9);
              return (
                <div className="not-prose rounded-md border">
                  <div className="flex h-12 items-center justify-between bg-zinc-100 px-4 dark:bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <Terminal size={18} />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {node?.data?.meta}
                      </p>
                    </div>
                    <CopyButton id={id} />
                  </div>
                  <div className="overflow-x-auto">
                    <div id={id} className="p-4">
                      {children}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <code
                  {...props}
                  className="not-prose rounded bg-gray-100 px-1 dark:bg-zinc-900"
                >
                  {children}
                </code>
              );
            }
          },
          table({children}) {
            return (
              <div className="table-container">
                <table className="markdown-table">{children}</table>
              </div>
            );
          },
          th({children}) {
            return <th className="table-header">{children}</th>;
          },
          td({children}) {
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
