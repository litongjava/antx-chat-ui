// MermaidRenderer.tsx
import React, {useEffect, useRef, useState} from 'react';
import mermaid from 'mermaid';
import {saveAs} from 'file-saver';
import './MermaidRenderer.css';
import {Check, Copy} from "lucide-react";

interface MermaidRendererProps {
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({chart}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({x: 0, y: 0});
  const [showModal, setShowModal] = useState(false);
  const [currentSvg, setCurrentSvg] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({x: 0, y: 0});

  // 重置视图
  const resetView = () => {
    setScale(1);
    setTranslate({x: 0, y: 0});
  };

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = '<div class="loading">渲染中...</div>';
          const id = 'mmd-' + Math.random().toString(36).slice(2, 9);
          const {svg} = await mermaid.render(id, chart);
          containerRef.current.innerHTML = svg;
          setCurrentSvg(svg);

          // 重置视图
          resetView();
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

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y
    };
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setTranslate({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  // 缩放功能
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(chart)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
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
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) throw new Error('找不到 SVG 元素');

      const svgWithBackground = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${svgElement.clientWidth}" 
           height="${svgElement.clientHeight}" 
           viewBox="0 0 ${svgElement.clientWidth} ${svgElement.clientHeight}">
        <rect width="100%" height="100%" fill="white" />
        ${currentSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}
      </svg>
    `;

      const img = new Image();
      const base64 = btoa(unescape(encodeURIComponent(svgWithBackground)));
      const url = `data:image/svg+xml;base64,${base64}`;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法获取 Canvas 上下文');

      const scale = 4;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
        <button onClick={resetView} title="重置视图">⌂</button>
        <button onClick={copyCode} title="复制代码">
          {copied ? <Check size={16}/> : <Copy size={16}/>}
        </button>
        <button onClick={() => setShowModal(true)} title="弹出层查看">⛶</button>
        <button onClick={openInNewTab} title="新标签页打开">↗️</button>
        <button onClick={downloadSVG} title="下载SVG">⬇️SVG</button>
        <button onClick={downloadPNG} title="下载PNG">⬇️PNG</button>
      </div>

      <div
        className="chart-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'grab' }}
      >
        <div
          ref={containerRef}
          className="mermaid-container"
          style={{
            transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
            transformOrigin: 'top left'
          }}
        />
      </div>

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