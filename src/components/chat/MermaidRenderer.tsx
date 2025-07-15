// MermaidRenderer.tsx
import React, {useEffect, useRef} from 'react';
import mermaid, {RenderResult} from 'mermaid';
import './MermaidRenderer.css';

interface MermaidRendererProps {
  /** 你的 mermaid 源码（不含 ```mermaid 标记） */
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({chart}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. 初始化（只要一次即可）
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    // 2. 调用 render，传入 containerRef.current 作为第三个参数
    if (containerRef.current) {
      const id = 'mmd-' + Math.random().toString(36).slice(2, 9);
      // 这里也可以用 mermaidAPI.render(...)，两者底层等价
      mermaid.render(id, chart, containerRef.current)
        .then((res: RenderResult) => {
          // res.svg 是生成的 <svg> 字符串
          containerRef.current!.innerHTML = res.svg;
        })
        .catch((err) => {
          console.error('Mermaid 渲染出错：', err);
          containerRef.current!.innerText = '⚠️ Mermaid 渲染失败';
        });
    }
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      // 为了防止 React 在第一次 render 时插入“[Object Promise]”
      dangerouslySetInnerHTML={{__html: ''}}
    />
  );
};

export default MermaidRenderer;