'use client';

import { useAppStore, THEME_PRESETS, DiagramReference } from '@/lib/store';
import { translations, type TranslationKeys } from '@/lib/i18n';
import { renderMermaid } from '@/lib/mermaid';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { createMermaidError } from '@/lib/errorUtils';
import ErrorDisplay from './ErrorDisplay';
import { ExportDialog } from './ExportDialog';

// Map theme ID to translation keys
const themeTranslationMap: Record<string, keyof TranslationKeys['themes']> = {
  'default': 'default',
  'forest': 'forest',
  'dark': 'dark',
  'dark-blue': 'darkBlue',
  'dark-purple': 'darkPurple',
  'neutral': 'neutral',
  'tech-blue': 'techBlue',
  'ocean-teal': 'oceanTeal',
  'sunset-orange': 'sunsetOrange',
  'purple-dream': 'purpleDream',
  'rose-pink': 'rosePink',
  'emerald-green': 'emeraldGreen',
  'amber-gold': 'amberGold',
  'slate-modern': 'slateModern',
};

function getThemeTranslation(themeId: string, t: TranslationKeys) {
  const key = themeTranslationMap[themeId];
  if (!key) return { name: themeId, description: '' };
  return {
    name: t.themes[key] as string,
    description: t.themes[`${key}Desc` as keyof TranslationKeys['themes']] as string,
  };
}

// 选择框类型
interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function Preview() {
  // Optimized selectors - Group 1: Content (re-renders on code/error change)
  const { code, error } = useAppStore(
    useShallow((state) => ({ code: state.code, error: state.error }))
  );
  
  // Group 2: Theme (re-renders on theme change)
  const themeId = useAppStore((state) => state.themeId);
  
  // Group 3: Reference mode (re-renders on reference changes)
  const { isReferenceMode, pendingReferences } = useAppStore(
    useShallow((state) => ({
      isReferenceMode: state.isReferenceMode,
      pendingReferences: state.pendingReferences
    }))
  );
  
  // Group 4: Triggers (separate selectors for minimal re-renders)
  const triggerDownloadSVG = useAppStore((state) => state.triggerDownloadSVG);
  const triggerDownloadPNG = useAppStore((state) => state.triggerDownloadPNG);
  const triggerCopyMarkdown = useAppStore((state) => state.triggerCopyMarkdown);
  const triggerZoomIn = useAppStore((state) => state.triggerZoomIn);
  const triggerZoomOut = useAppStore((state) => state.triggerZoomOut);
  const triggerResetZoom = useAppStore((state) => state.triggerResetZoom);
  
  // Group 5: Actions (stable references, no re-renders)
  const setError = useAppStore((state) => state.setError);
  const setErrorInfo = useAppStore((state) => state.setErrorInfo);
  const setThemeId = useAppStore((state) => state.setThemeId);
  const setIsReferenceMode = useAppStore((state) => state.setIsReferenceMode);
  const addPendingReference = useAppStore((state) => state.addPendingReference);
  const removePendingReference = useAppStore((state) => state.removePendingReference);
  const setPendingReferences = useAppStore((state) => state.setPendingReferences);
  const setLoadingState = useAppStore((state) => state.setLoadingState);
  
  // Group 6: i18n (rarely changes)
  const { t, tf, locale } = useAppStore(
    useShallow((state) => ({ t: state.t, tf: state.tf, locale: state.locale }))
  );
  
  // Group 7: Loading states
  const loadingState = useAppStore((state) => state.loadingState);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shouldAutoFit, setShouldAutoFit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const renderIdRef = useRef(0);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  // hoveredNode 状态目前只用于内部跟踪，未来可用于显示悬停提示
  const [, setHoveredNode] = useState<string | null>(null);
  
  // 渲染队列管理 - 避免并发渲染
  const isRenderingRef = useRef(false);
  const pendingRenderRef = useRef<{ code: string; themeId: string } | null>(null);

  // 框选相关状态
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  // Track previous trigger values to detect changes
  const prevTriggers = useRef({
    downloadSVG: 0,
    downloadPNG: 0,
    copyMarkdown: 0,
    zoomIn: 0,
    zoomOut: 0,
    resetZoom: 0,
  });

  // 点击外部关闭主题菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取当前主题
  const currentTheme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[0];

  // Listen for keyboard shortcut triggers
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevTriggers.current = {
        downloadSVG: triggerDownloadSVG,
        downloadPNG: triggerDownloadPNG,
        copyMarkdown: triggerCopyMarkdown,
        zoomIn: triggerZoomIn,
        zoomOut: triggerZoomOut,
        resetZoom: triggerResetZoom,
      };
      return;
    }

    if (triggerDownloadSVG !== prevTriggers.current.downloadSVG) {
      handleDownload();
    }
    if (triggerDownloadPNG !== prevTriggers.current.downloadPNG) {
      handleDownloadPNG();
    }
    if (triggerCopyMarkdown !== prevTriggers.current.copyMarkdown) {
      handleCopyMarkdown();
    }
    if (triggerZoomIn !== prevTriggers.current.zoomIn) {
      handleZoomIn();
    }
    if (triggerZoomOut !== prevTriggers.current.zoomOut) {
      handleZoomOut();
    }
    if (triggerResetZoom !== prevTriggers.current.resetZoom) {
      handleResetZoom();
    }

    prevTriggers.current = {
      downloadSVG: triggerDownloadSVG,
      downloadPNG: triggerDownloadPNG,
      copyMarkdown: triggerCopyMarkdown,
      zoomIn: triggerZoomIn,
      zoomOut: triggerZoomOut,
      resetZoom: triggerResetZoom,
    };
  });

  // 计算动态 debounce 时间 - 根据代码复杂度
  const calculateDebounceTime = useCallback((codeStr: string): number => {
    const lineCount = codeStr.split('\n').length;
    const charCount = codeStr.length;
    
    // 根据行数和字符数综合判断复杂度
    if (lineCount > 100 || charCount > 2000) {
      return 800; // 复杂图表，延迟更长
    } else if (lineCount > 50 || charCount > 1000) {
      return 500; // 中等复杂度
    } else if (lineCount > 20 || charCount > 500) {
      return 350; // 简单图表
    }
    return 300; // 最小延迟
  }, []);

  useEffect(() => {
    const render = async () => {
      if (!code.trim()) {
        setSvg('');
        setRenderError(null);
        isRenderingRef.current = false;
        setLoadingState('rendering', false);
        return;
      }

      // 如果正在渲染，保存待渲染的内容
      if (isRenderingRef.current) {
        pendingRenderRef.current = { code, themeId };
        return;
      }

      isRenderingRef.current = true;
      setLoadingState('rendering', true);
      renderIdRef.current += 1;
      const currentId = renderIdRef.current;
      const startTime = performance.now();

      try {
        const result = await renderMermaid(code, `mermaid-${currentId}`, themeId);

        if ('svg' in result) {
          setSvg(result.svg);
          setRenderError(null);
          setError(null);
          setErrorInfo(null);
          // 先重置为 1，再触发自动适配
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          setShouldAutoFit(true);
          
          // 性能监控（仅在开发环境）
          if (process.env.NODE_ENV === 'development') {
            const renderTime = performance.now() - startTime;
            console.log(`[Mermaid Render] Time: ${renderTime.toFixed(2)}ms, Lines: ${code.split('\n').length}, Chars: ${code.length}`);
          }
        } else {
          setRenderError(result.error);
          setErrorInfo(createMermaidError(result.error, locale));
          setSvg('');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : t.preview.renderFailed;
        setRenderError(errorMsg);
        setErrorInfo(createMermaidError(err, locale));
        setSvg('');
      } finally {
        isRenderingRef.current = false;
        setLoadingState('rendering', false);
        
        // 检查是否有待渲染的内容
        if (pendingRenderRef.current) {
          const pending = pendingRenderRef.current;
          pendingRenderRef.current = null;
          
          // 如果待渲染的内容与当前不同，触发新的渲染
          if (pending.code !== code || pending.themeId !== themeId) {
            // 使用 setTimeout 避免同步递归
            setTimeout(() => {
              if (pending.code === code && pending.themeId === themeId) {
                render();
              }
            }, 0);
          }
        }
      }
    };

    // 动态 debounce - 根据代码复杂度调整延迟
    const debounceTime = calculateDebounceTime(code);
    const timer = setTimeout(render, debounceTime);
    
    return () => {
      clearTimeout(timer);
      // 清理时不重置 isRenderingRef，让正在进行的渲染完成
    };
  }, [code, setError, setErrorInfo, themeId, t.preview.renderFailed, locale, calculateDebounceTime, setLoadingState]);

  const handleZoomIn = useCallback((mousePos?: { x: number; y: number }) => {
    if (mousePos) {
      // 以鼠标位置为中心缩放
      const newZoom = zoom * 1.25;
      const zoomRatio = newZoom / zoom;
      const newX = mousePos.x - (mousePos.x - position.x) * zoomRatio;
      const newY = mousePos.y - (mousePos.y - position.y) * zoomRatio;
      setZoom(newZoom);
      setPosition({ x: newX, y: newY });
    } else {
      // 以画布中心缩放（默认行为）
      setZoom((z) => z * 1.25);
    }
  }, [zoom, position]);

  const handleZoomOut = useCallback((mousePos?: { x: number; y: number }) => {
    const newZoom = Math.max(zoom / 1.25, 0.1);
    if (mousePos && newZoom >= 0.1) {
      // 以鼠标位置为中心缩放
      const zoomRatio = newZoom / zoom;
      const newX = mousePos.x - (mousePos.x - position.x) * zoomRatio;
      const newY = mousePos.y - (mousePos.y - position.y) * zoomRatio;
      setZoom(newZoom);
      setPosition({ x: newX, y: newY });
    } else {
      // 以画布中心缩放（默认行为）
      setZoom(newZoom);
    }
  }, [zoom, position]);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 自动适配：当新图表渲染完成后，计算合适的缩放比例
  useEffect(() => {
    if (!shouldAutoFit || !svg) return;

    // 使用 requestAnimationFrame 确保 DOM 完全渲染
    let rafId: number;
    let attempts = 0;
    const maxAttempts = 10;

    const tryAutoFit = () => {
      const previewArea = previewAreaRef.current;
      const svgContainer = containerRef.current?.querySelector('svg');

      if (!previewArea || !svgContainer) {
        attempts++;
        if (attempts < maxAttempts) {
          rafId = requestAnimationFrame(tryAutoFit);
        } else {
          setShouldAutoFit(false);
        }
        return;
      }

      // 获取容器可用空间（只留少量边距）
      const containerRect = previewArea.getBoundingClientRect();
      const containerWidth = containerRect.width - 40;
      const containerHeight = containerRect.height - 40;

      // 获取 SVG 实际渲染尺寸
      const svgRect = svgContainer.getBoundingClientRect();
      const originalWidth = svgRect.width;
      const originalHeight = svgRect.height;

      if (originalWidth <= 0 || originalHeight <= 0) {
        attempts++;
        if (attempts < maxAttempts) {
          rafId = requestAnimationFrame(tryAutoFit);
        } else {
          setShouldAutoFit(false);
        }
        return;
      }

      // 计算适配比例，让图表适配容器
      const scaleX = containerWidth / originalWidth;
      const scaleY = containerHeight / originalHeight;
      let newZoom = Math.min(scaleX, scaleY);

      if (newZoom < 1) {
        // 图表比容器大，需要缩小，再乘以 0.85 留边距
        newZoom = newZoom * 0.85;
      } else {
        // 图表比容器小，需要放大，直接用计算值但限制最大 3 倍
        newZoom = Math.min(newZoom * 0.9, 3);
      }

      // 限制最小缩放为 0.1
      newZoom = Math.max(0.1, newZoom);

      setZoom(newZoom);
      setShouldAutoFit(false);
    };

    // 延时一帧后开始尝试
    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(tryAutoFit);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [shouldAutoFit, svg]);

  // 滚轮缩放 - 以鼠标位置为中心缩放（更直观）
  useEffect(() => {
    const previewArea = previewAreaRef.current;
    if (!previewArea) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const rect = previewArea.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(zoom * delta, 0.1);

      // 计算缩放后的位置偏移，使鼠标位置保持不变
      const zoomRatio = newZoom / zoom;
      const newX = mouseX - (mouseX - position.x) * zoomRatio;
      const newY = mouseY - (mouseY - position.y) * zoomRatio;

      setZoom(newZoom);
      setPosition({ x: newX, y: newY });
    };

    previewArea.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      previewArea.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, position]);

  // 右键拖动
  useEffect(() => {
    const previewArea = previewAreaRef.current;
    if (!previewArea) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          posX: position.x,
          posY: position.y,
        };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsDragging(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    previewArea.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    previewArea.addEventListener('contextmenu', handleContextMenu);

    return () => {
      previewArea.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      previewArea.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isDragging, position.x, position.y]);

  const handleDownload = useCallback(() => {
    if (!svg) return;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svg]);

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleCopyMarkdown = useCallback(async () => {
    const markdown = '```mermaid\n' + code + '\n```';
    await navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  }, [code]);

  const handleDownloadPNG = useCallback(async () => {
    // 打开导出对话框而不是直接导出
    setShowExportDialog(true);
  }, []);

  // 处理导出（从对话框调用）
  const handleExport = useCallback(async (format: 'png' | 'pdf', scale: number) => {
    if (!svg) return;
    setIsExportingPng(true);
    setLoadingState('exporting', true);

    try {
      // 获取 SVG 元素
      const svgContainer = containerRef.current?.querySelector('svg');
      if (!svgContainer) return;

      // 动态导入导出工具
      const { exportHighResPNG, exportPDF, downloadBlob } = await import('@/lib/exportUtils');

      if (format === 'png') {
        // 导出高分辨率 PNG
        const blob = await exportHighResPNG(svgContainer as SVGSVGElement, {
          scale,
          backgroundColor: '#ffffff',
        });
        downloadBlob(blob, 'mermaid-diagram.png');
      } else {
        // 导出 PDF
        try {
          const blob = await exportPDF(svgContainer as SVGSVGElement, {
            backgroundColor: '#ffffff',
          });
          downloadBlob(blob, 'mermaid-diagram.pdf');
        } catch (error) {
          // 如果 jsPDF 未安装，回退到高分辨率 PNG
          console.warn('PDF export failed, falling back to PNG:', error);
          const blob = await exportHighResPNG(svgContainer as SVGSVGElement, {
            scale: 2,
            backgroundColor: '#ffffff',
          });
          downloadBlob(blob, 'mermaid-diagram.png');
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExportingPng(false);
      setLoadingState('exporting', false);
    }
  }, [svg, setLoadingState]);

  // 从节点元素中提取文本内容
  const extractNodeText = useCallback((nodeElement: Element): string => {
    const texts = new Set<string>();

    // 优先从 foreignObject 内的 HTML 元素提取（Mermaid 某些图表类型使用）
    const foreignTextElements = nodeElement.querySelectorAll('foreignObject span, foreignObject div');
    if (foreignTextElements.length > 0) {
      foreignTextElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text) texts.add(text);
      });
      if (texts.size > 0) {
        return Array.from(texts).join(' ');
      }
    }

    // 从 SVG text 元素提取 - 只获取顶层 text 元素，避免 text/tspan 重复
    const textElements = nodeElement.querySelectorAll('text');
    textElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text) texts.add(text);
    });

    return texts.size > 0 ? Array.from(texts).join(' ') : translations[locale].preview.unnamedNode;
  }, [locale]);

  // 从节点元素中推断节点类型
  const inferNodeType = useCallback((nodeElement: Element): string | undefined => {
    // 检查节点的形状类来推断类型
    const hasRhombus = nodeElement.querySelector('polygon, .decision');
    const hasCircle = nodeElement.querySelector('circle');
    const hasRect = nodeElement.querySelector('rect');

    if (hasRhombus) return 'decision';
    if (hasCircle) return 'event';
    if (hasRect) return 'process';

    // 从 class 名称推断
    const classNameAttr = nodeElement.getAttribute('class') || '';
    if (classNameAttr.includes('decision')) return 'decision';
    if (classNameAttr.includes('start') || classNameAttr.includes('end')) return 'event';

    return undefined;
  }, []);

  // 基于节点内容生成稳定的哈希 ID
  const generateStableId = useCallback((nodeElement: Element): string => {
    // 优先使用节点自带的 id
    if (nodeElement.id) {
      return nodeElement.id;
    }

    // 使用多个属性组合生成更可靠的唯一标识
    const textContent = nodeElement.textContent?.trim() || '';
    const className = (nodeElement.getAttribute('class') || '')
      .split(' ')
      .filter(c => !c.startsWith('diagram-node-'))
      .join(' ');
    const tagName = nodeElement.tagName;
    const childCount = nodeElement.children.length;
    
    // 使用更强的哈希算法（FNV-1a）
    const str = `${tagName}:${className}:${textContent}:${childCount}`;
    let hash = 2166136261; // FNV offset basis
    
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    
    // 转换为正数并使用 base36
    const hashStr = (hash >>> 0).toString(36);
    return `node-${hashStr}`;
  }, []);

  // 处理节点点击 - 直接添加/移除引用
  const handleNodeClick = useCallback((nodeElement: Element) => {
    const nodeId = generateStableId(nodeElement);
    const nodeText = extractNodeText(nodeElement);
    const nodeType = inferNodeType(nodeElement);

    // 检查是否已经引用
    const isAlreadyReferenced = pendingReferences.some((r) => r.nodeId === nodeId);

    if (isAlreadyReferenced) {
      // 移除引用
      removePendingReference(nodeId);
      nodeElement.classList.remove('diagram-node-selected');
    } else {
      // 添加引用
      const reference: DiagramReference = {
        nodeId,
        nodeText,
        nodeType,
      };
      addPendingReference(reference);
      nodeElement.classList.add('diagram-node-selected');
    }
  }, [generateStableId, extractNodeText, inferNodeType, pendingReferences, addPendingReference, removePendingReference]);

  // 从点击目标向上查找节点元素
  const findNodeFromTarget = useCallback((target: Element, svgElement: Element): Element | null => {
    let current: Element | null = target;

    // 如果点击的是 foreignObject 内的 HTML 元素，需要先找到 foreignObject
    while (current && current.namespaceURI === 'http://www.w3.org/1999/xhtml') {
      current = current.parentElement;
    }

    // 对于节点，找最外层；对于边标签，找最内层（第一个匹配的）
    let outermostNode: Element | null = null;
    let firstEdgeLabel: Element | null = null;

    while (current && current !== svgElement && current !== document.body) {
      const tagName = current.tagName?.toLowerCase() || '';
      if (tagName === 'g') {
        const id = current.id || '';
        const className = current.getAttribute('class') || '';

        // 边标签 - 找到第一个就记录（不继续向上）
        const isEdgeLabel = className.includes('edgeLabel') ||
                           className.includes('edgePath') ||
                           (className.includes('label') && !className.includes('node'));

        if (isEdgeLabel && !firstEdgeLabel) {
          firstEdgeLabel = current;
        }

        // 节点 - 继续向上找最外层
        // 使用正则匹配单词边界，避免 "nodes" 容器被误匹配
        const isNode =
          /\bnode\b/.test(className) ||
          className.includes('cluster') ||
          className.includes('actor') ||
          className.includes('classGroup') ||
          /\bstate\b/.test(className) ||
          className.includes('entity') ||
          id.includes('flowchart-') ||
          /\bnode\b/.test(id) ||
          /\bstate\b/.test(id) ||
          id.includes('actor');

        if (isNode) {
          outermostNode = current;
        } else if (!isEdgeLabel) {
          // 备选：检查是否包含形状和文本/foreignObject
          // 排除已知的容器类名（nodes, edges, clusters 等）
          const isContainer = /\b(nodes|edges|clusters|edgePaths|edgeLabels|root)\b/.test(className);
          if (!isContainer) {
            const hasShape = current.querySelector('rect, polygon, circle, ellipse');
            const hasContent = current.querySelector('text, tspan, foreignObject');
            if (hasShape && hasContent && (id || className)) {
              outermostNode = current;
            }
          }
        }
      }

      if (current.parentElement) {
        current = current.parentElement;
      } else if (current.parentNode && current.parentNode instanceof Element) {
        current = current.parentNode;
      } else {
        break;
      }
    }

    // 优先返回节点，其次返回边标签
    return outermostNode || firstEdgeLabel;
  }, []);

  // 引用模式下的 SVG 交互 - 使用事件委托
  useEffect(() => {
    if (!isReferenceMode || !svg) return;

    const svgContainer = svgContainerRef.current;
    if (!svgContainer) {
      return;
    }

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) {
      return;
    }

    let hoveredElement: Element | null = null;

    // 添加交互样式
    let styleEl = document.getElementById('diagram-reference-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'diagram-reference-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .diagram-node-hover > rect,
      .diagram-node-hover > polygon,
      .diagram-node-hover > circle,
      .diagram-node-hover > ellipse,
      .diagram-node-hover > path,
      .diagram-node-hover rect,
      .diagram-node-hover polygon,
      .diagram-node-hover circle,
      .diagram-node-hover ellipse {
        stroke: #06b6d4 !important;
        stroke-width: 3px !important;
        filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.5));
      }
      .diagram-node-hover text,
      .diagram-node-hover tspan {
        fill: #0891b2 !important;
      }
      .diagram-node-selected > rect,
      .diagram-node-selected > polygon,
      .diagram-node-selected > circle,
      .diagram-node-selected > ellipse,
      .diagram-node-selected > path,
      .diagram-node-selected rect,
      .diagram-node-selected polygon,
      .diagram-node-selected circle,
      .diagram-node-selected ellipse {
        stroke: #0d9488 !important;
        stroke-width: 3px !important;
        fill-opacity: 0.9;
        filter: drop-shadow(0 0 6px rgba(13, 148, 136, 0.6));
      }
      .diagram-node-selected text,
      .diagram-node-selected tspan {
        fill: #0f766e !important;
        font-weight: 600;
      }
      svg { cursor: crosshair; }
      svg g { cursor: pointer; }
    `;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as Element;
      const node = findNodeFromTarget(target, svgElement);

      if (node !== hoveredElement) {
        // 移除上一个高亮
        if (hoveredElement) {
          hoveredElement.classList.remove('diagram-node-hover');
        }

        // 添加新的高亮
        if (node) {
          node.classList.add('diagram-node-hover');
          setHoveredNode(node.id || 'node');
        } else {
          setHoveredNode(null);
        }

        hoveredElement = node;
      }
    };

    const handleMouseLeave = () => {
      if (hoveredElement) {
        hoveredElement.classList.remove('diagram-node-hover');
        hoveredElement = null;
        setHoveredNode(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const node = findNodeFromTarget(target, svgElement);

      if (node) {
        e.preventDefault();
        e.stopPropagation();
        handleNodeClick(node);
      }
    };

    // 使用事件委托在容器 div 上监听（这样可以捕获 foreignObject 内 HTML 元素的事件）
    svgContainer.addEventListener('mousemove', handleMouseMove);
    svgContainer.addEventListener('mouseleave', handleMouseLeave);
    svgContainer.addEventListener('click', handleClick, true); // 使用捕获阶段

    return () => {
      svgContainer.removeEventListener('mousemove', handleMouseMove);
      svgContainer.removeEventListener('mouseleave', handleMouseLeave);
      svgContainer.removeEventListener('click', handleClick, true);

      if (hoveredElement) {
        hoveredElement.classList.remove('diagram-node-hover');
      }

      const styleElCleanup = document.getElementById('diagram-reference-styles');
      if (styleElCleanup) styleElCleanup.remove();
    };
  }, [isReferenceMode, svg, handleNodeClick, findNodeFromTarget]);

  // ESC 键退出引用模式
  useEffect(() => {
    if (!isReferenceMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsReferenceMode(false);
        setHoveredNode(null);
        setSelectionBox(null);
        setIsSelecting(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isReferenceMode, setIsReferenceMode]);

  // 框选功能
  useEffect(() => {
    if (!isReferenceMode || !svg) return;

    const previewArea = previewAreaRef.current;
    const svgContainer = svgContainerRef.current;
    if (!previewArea || !svgContainer) return;

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    // 获取所有可选节点
    const getAllNodes = (): Element[] => {
      const allG = svgElement.querySelectorAll('g');
      const nodes: Element[] = [];
      allG.forEach((g) => {
        const id = g.id || '';
        const className = g.getAttribute('class') || '';
        // 使用正则匹配单词边界，避免 "nodes" 容器被误匹配
        const isNode =
          /\bnode\b/.test(className) ||
          className.includes('cluster') ||
          className.includes('actor') ||
          className.includes('classGroup') ||
          /\bstate\b/.test(className) ||
          className.includes('entity') ||
          id.includes('flowchart-') ||
          /\bnode\b/.test(id) ||
          /\bstate\b/.test(id) ||
          id.includes('actor');
        if (isNode) {
          nodes.push(g);
        }
      });
      return nodes;
    };

    // 检查元素是否在选择框内
    const isElementInSelectionBox = (element: Element, box: SelectionBox): boolean => {
      const rect = element.getBoundingClientRect();
      const previewRect = previewArea.getBoundingClientRect();

      // 转换为相对于预览区域的坐标
      const elemLeft = rect.left - previewRect.left + previewArea.scrollLeft;
      const elemTop = rect.top - previewRect.top + previewArea.scrollTop;
      const elemRight = elemLeft + rect.width;
      const elemBottom = elemTop + rect.height;

      const boxLeft = Math.min(box.startX, box.endX);
      const boxRight = Math.max(box.startX, box.endX);
      const boxTop = Math.min(box.startY, box.endY);
      const boxBottom = Math.max(box.startY, box.endY);

      // 检查是否有交集
      return !(elemRight < boxLeft || elemLeft > boxRight || elemBottom < boxTop || elemTop > boxBottom);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // 只在左键且不在节点上时开始框选
      if (e.button !== 0) return;

      const target = e.target as Element;
      const node = findNodeFromTarget(target, svgElement);

      // 如果点击在节点上，让原有的点击事件处理
      if (node) return;

      const rect = previewArea.getBoundingClientRect();
      const x = e.clientX - rect.left + previewArea.scrollLeft;
      const y = e.clientY - rect.top + previewArea.scrollTop;

      selectionStartRef.current = { x, y };
      setIsSelecting(true);
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting || !selectionStartRef.current) return;

      const rect = previewArea.getBoundingClientRect();
      const x = e.clientX - rect.left + previewArea.scrollLeft;
      const y = e.clientY - rect.top + previewArea.scrollTop;

      const newBox = {
        startX: selectionStartRef.current.x,
        startY: selectionStartRef.current.y,
        endX: x,
        endY: y,
      };
      setSelectionBox(newBox);

      // 实时更新框选中的节点高亮
      const allNodes = getAllNodes();
      allNodes.forEach((node) => {
        const nodeId = node.id || '';
        const isAlreadyReferenced = pendingReferences.some((r) => r.nodeId === nodeId);
        if (isElementInSelectionBox(node, newBox)) {
          node.classList.add('diagram-node-hover');
        } else if (!isAlreadyReferenced) {
          node.classList.remove('diagram-node-hover');
        }
      });
    };

    const handleMouseUp = () => {
      if (!isSelecting || !selectionBox) {
        setIsSelecting(false);
        return;
      }

      // 获取选择框内的所有节点
      const allNodes = getAllNodes();
      const newRefs: DiagramReference[] = [];

      allNodes.forEach((node) => {
        if (isElementInSelectionBox(node, selectionBox)) {
          // 使用与点击相同的稳定 ID 生成逻辑
          const nodeId = generateStableId(node);
          // 检查是否已经引用
          const isAlreadyReferenced = pendingReferences.some((r) => r.nodeId === nodeId);
          if (!isAlreadyReferenced) {
            const nodeText = extractNodeText(node);
            const nodeType = inferNodeType(node);
            newRefs.push({ nodeId, nodeText, nodeType });
            node.classList.add('diagram-node-selected');
          }
        }
        // 清除悬停样式
        node.classList.remove('diagram-node-hover');
      });

      // 直接添加到引用列表
      if (newRefs.length > 0) {
        setPendingReferences([...pendingReferences, ...newRefs]);
      }

      setIsSelecting(false);
      setSelectionBox(null);
      selectionStartRef.current = null;
    };

    previewArea.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      previewArea.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isReferenceMode, svg, isSelecting, selectionBox, pendingReferences, setPendingReferences, findNodeFromTarget, extractNodeText, inferNodeType, generateStableId]);

  // 退出引用模式时清理状态
  useEffect(() => {
    if (!isReferenceMode) {
      setSelectionBox(null);
      setIsSelecting(false);
      // 清理 SVG 中的选中样式
      const svgContainer = svgContainerRef.current;
      if (svgContainer) {
        const selectedElements = svgContainer.querySelectorAll('.diagram-node-selected');
        selectedElements.forEach((el) => el.classList.remove('diagram-node-selected'));
      }
    }
  }, [isReferenceMode]);

  const displayError = error || renderError;
  const errorInfo = useAppStore((state) => state.errorInfo);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t.preview.title}</span>
          </div>

          {svg && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.preview.renderSuccess}</span>
            </div>
          )}
          
          {loadingState.rendering && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200/50 dark:border-cyan-800/30">
              <svg className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400">{t.preview.rendering || '渲染中...'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={(e) => {
                const rect = previewAreaRef.current?.getBoundingClientRect();
                if (rect) {
                  handleZoomOut({ x: e.clientX, y: e.clientY });
                } else {
                  handleZoomOut();
                }
              }}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
              title={t.preview.zoomOut}
              aria-label={t.preview.zoomOut}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleResetZoom}
              className="h-7 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={t.preview.resetZoom}
              aria-label={`${t.preview.resetZoom} (${Math.round(zoom * 100)}%)`}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={(e) => {
                const rect = previewAreaRef.current?.getBoundingClientRect();
                if (rect) {
                  handleZoomIn({ x: e.clientX, y: e.clientY });
                } else {
                  handleZoomIn();
                }
              }}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
              title={t.preview.zoomIn}
              aria-label={t.preview.zoomIn}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Reference Mode Button */}
          {svg && (
            <>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsReferenceMode(!isReferenceMode)}
                  className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg transition-all duration-200 ${
                    isReferenceMode
                      ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={isReferenceMode ? `${t.preview.escToExit}` : t.preview.referenceHint}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span className="text-xs font-medium hidden sm:inline">
                    {isReferenceMode ? t.preview.selecting : t.preview.reference}
                  </span>
                </button>

                {/* 显示已引用数量 */}
                {pendingReferences.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full">
                    {pendingReferences.length}{t.preview.count}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Theme Selector */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={t.preview.selectTheme}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                style={{
                  background: currentTheme.themeVariables?.primaryColor ||
                    (currentTheme.base === 'default' ? '#4169e1' :
                     currentTheme.base === 'forest' ? '#228b22' :
                     currentTheme.base === 'dark' ? '#1f2937' :
                     '#6b7280'),
                }}
              />
              <span className="text-xs font-medium hidden sm:inline">{getThemeTranslation(currentTheme.id, t).name}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Theme Dropdown Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.preview.selectTheme}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tf(t.preview.themeCount, { count: THEME_PRESETS.length })}</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {THEME_PRESETS.map((theme) => {
                    const themeT = getThemeTranslation(theme.id, t);
                    return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setThemeId(theme.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        themeId === theme.id
                          ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-white/20"
                        style={{
                          background: theme.themeVariables?.primaryColor ||
                            (theme.base === 'default' ? 'linear-gradient(135deg, #4169e1, #6b8dd6)' :
                             theme.base === 'forest' ? 'linear-gradient(135deg, #228b22, #3cb371)' :
                             theme.base === 'dark' ? 'linear-gradient(135deg, #1f2937, #374151)' :
                             theme.base === 'neutral' ? 'linear-gradient(135deg, #6b7280, #9ca3af)' :
                             theme.themeVariables?.primaryColor || '#6b7280'),
                        }}
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            themeId === theme.id
                              ? 'text-cyan-700 dark:text-cyan-300'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {themeT.name}
                          </span>
                          {themeId === theme.id && (
                            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{themeT.description}</span>
                      </div>
                    </button>
                  );})}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Actions */}
          <button
            onClick={handleCopyCode}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            title={t.preview.copyCode}
            aria-label={t.preview.copyCode}
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            title={t.preview.copyMarkdown}
            aria-label={t.preview.copyMarkdown}
          >
            {copiedMarkdown ? (
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h4" />
              </svg>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={!svg}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={t.preview.downloadSvg}
            aria-label={t.preview.downloadSvg}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={!svg || isExportingPng}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={t.preview.downloadPng}
            aria-label={t.preview.downloadPng}
          >
            {isExportingPng ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={previewAreaRef}
        className={`flex-1 overflow-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50 via-gray-100/50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 p-6 relative ${
          isReferenceMode ? 'cursor-crosshair' : ''
        }`}
      >
        {/* Reference Mode Overlay */}
        {isReferenceMode && svg && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <span>{t.preview.selectNodes}</span>
              <span className="text-cyan-200 text-xs ml-1">{t.preview.escToExit}</span>
            </div>
          </div>
        )}

        {/* 框选矩形 */}
        {isReferenceMode && selectionBox && (
          <div
            className="absolute pointer-events-none z-20 border-2 border-cyan-500 bg-cyan-500/10 rounded"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
            }}
          />
        )}
        {errorInfo ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <ErrorDisplay
                error={errorInfo}
                onRetry={() => {
                  // 重新渲染
                  setErrorInfo(null);
                  setRenderError(null);
                  setError(null);
                }}
                onDismiss={() => {
                  setErrorInfo(null);
                  setRenderError(null);
                  setError(null);
                }}
              />
            </div>
          </div>
        ) : displayError ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md w-full">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{t.preview.renderError}</h3>
                      <p className="text-white/70 text-sm">{t.preview.checkSyntax}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                    <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {displayError}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : svg ? (
          <div
            ref={containerRef}
            className={`min-h-full flex items-center justify-center ${isDragging ? '' : 'transition-transform duration-200'}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : (isReferenceMode ? 'crosshair' : 'default'),
            }}
          >
            <div
              ref={svgContainerRef}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              dangerouslySetInnerHTML={{ __html: svg }}
              onClick={isReferenceMode ? (e) => {
                const target = e.target as Element;
                const svgEl = svgContainerRef.current?.querySelector('svg');
                if (!svgEl) {
                  return;
                }
                const node = findNodeFromTarget(target, svgEl);
                if (node) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNodeClick(node);
                }
              } : undefined}
              onMouseMove={isReferenceMode ? (e) => {
                const target = e.target as Element;
                const svgEl = svgContainerRef.current?.querySelector('svg');
                if (!svgEl) return;
                const node = findNodeFromTarget(target, svgEl);

                // 更新高亮
                const prevHovered = svgContainerRef.current?.querySelector('.diagram-node-hover');
                if (prevHovered && prevHovered !== node) {
                  prevHovered.classList.remove('diagram-node-hover');
                }
                if (node && !node.classList.contains('diagram-node-hover')) {
                  node.classList.add('diagram-node-hover');
                }
              } : undefined}
              onMouseLeave={isReferenceMode ? () => {
                const hovered = svgContainerRef.current?.querySelector('.diagram-node-hover');
                if (hovered) hovered.classList.remove('diagram-node-hover');
              } : undefined}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.preview.waitingInput}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {t.preview.waitingInputDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        t={t}
      />
    </div>
  );
}
