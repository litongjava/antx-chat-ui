// MermaidRenderer.tsx
import React, {useEffect, useRef, useState} from 'react';
import mermaid from 'mermaid';
import {saveAs} from 'file-saver';
import './MermaidRenderer.css';
import {Check, Copy} from "lucide-react";

interface MermaidRendererProps {
  /** 你的 mermaid 源码（不含 ```mermaid 标记） */
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({chart}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentSvg, setCurrentSvg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      if (containerRef.current) {
        try {
          // 清空容器并添加加载指示器
          containerRef.current.innerHTML = '<div class="loading">渲染中...</div>';

          const id = 'mmd-' + Math.random().toString(36).slice(2, 9);
          const {svg} = await mermaid.render(id, chart);
          // 直接设置容器内容
          containerRef.current.innerHTML = svg;
          setCurrentSvg(svg);
        } catch (err) {
          console.error('Mermaid 渲染出错：', err);
          if (containerRef.current) {
            containerRef.current.innerHTML = '<div class="error">⚠️ Mermaid 渲染失败</div>';
          }
        }
      }
    };

    renderChart();
  }, [chart]);

  // 缩放功能
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(chart)
      .then(() => {
        setCopied(true);
        // 1 秒后恢复
        setTimeout(() => {
          setCopied(false);
        }, 1000);
      })
      .catch(err => console.error('复制失败:', err));
  };

  // 新标签页打开
  const openInNewTab = () => {
    if (!currentSvg) return;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mermaid 图表</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: white; }
              svg { max-width: 100%; max-height: 100%; }
            </style>
          </head>
          <body>
            ${currentSvg}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // 下载功能
  const downloadSVG = () => {
    if (!currentSvg) return;
    const blob = new Blob([currentSvg], {type: 'image/svg+xml'});
    saveAs(blob, 'mermaid-diagram.svg');
  };

  const downloadPNG = async () => {
    if (!currentSvg || !containerRef.current) return;

    try {
      // 获取渲染后的 SVG 元素
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) throw new Error('找不到 SVG 元素');

      // 创建新的 SVG 字符串，添加背景矩形
      const svgWithBackground = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${svgElement.clientWidth}" 
           height="${svgElement.clientHeight}" 
           viewBox="0 0 ${svgElement.clientWidth} ${svgElement.clientHeight}">
        <rect width="100%" height="100%" fill="white" />
        ${currentSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}
      </svg>
    `;

      // 创建新的 Image 对象
      const img = new Image();

      // 将 SVG 转换为 Base64 Data URL
      const base64 = btoa(unescape(encodeURIComponent(svgWithBackground)));
      const url = `data:image/svg+xml;base64,${base64}`;

      // 等待图片加载完成
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = url;
      });

      // 创建 Canvas 元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法获取 Canvas 上下文');

      // 设置 Canvas 尺寸（4倍分辨率）
      const scale = 4;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // 填充白色背景（再次确保）
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 转换为 PNG 并下载
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'mermaid-diagram.png');
        }
      }, 'image/png');
    } catch (err) {
      console.error('PNG下载失败:', err);
      alert('PNG下载失败，请尝试下载SVG格式');
    }
  };

  return (
    <div className="mermaid-renderer-container">
      <div className="toolbar">
        <button onClick={zoomIn} title="放大">🔍+</button>
        <button onClick={zoomOut} title="缩小">🔍-</button>
        <button onClick={resetZoom} title="重置缩放">↺</button>
        <button onClick={copyCode} title="复制代码">{copied
          ? <Check size={16}/>
          : <Copy size={16}/>
        }</button>
        <button onClick={() => setShowModal(true)} title="弹出层查看">⛶</button>
        <button onClick={openInNewTab} title="新标签页打开">↗️</button>
        <button onClick={downloadSVG} title="下载SVG">⬇️SVG</button>
        <button onClick={downloadPNG} title="下载PNG">⬇️PNG</button>
      </div>

      <div
        ref={containerRef}
        className="mermaid-container"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          minHeight: '200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mermaid 图表</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div
              className="mermaid-modal-container"
              dangerouslySetInnerHTML={{__html: currentSvg}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MermaidRenderer;