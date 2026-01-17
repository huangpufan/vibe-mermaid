/**
 * 导出工具库
 * 提供高分辨率 PNG 和 PDF 导出功能
 */

/**
 * 导出选项接口
 */
export interface ExportOptions {
  /** 文件名（不含扩展名） */
  filename?: string;
  /** PNG 导出的缩放比例（1-4，默认 2） */
  scale?: number;
  /** 背景颜色（默认白色） */
  backgroundColor?: string;
}

/**
 * 将 SVG 转换为高分辨率 PNG
 * @param svgElement SVG DOM 元素
 * @param options 导出选项
 * @returns Promise<Blob> PNG 图片 Blob
 */
export async function exportHighResPNG(
  svgElement: SVGSVGElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const { scale = 2, backgroundColor = '#ffffff' } = options;

  // 验证缩放比例
  if (scale < 1 || scale > 4) {
    throw new Error('Scale must be between 1 and 4');
  }

  // 获取 SVG 尺寸
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width;
  const height = bbox.height;

  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 设置背景色
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 缩放上下文
  ctx.scale(scale, scale);

  // 将 SVG 转换为图片
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        1.0
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = url;
  });
}

/**
 * 下载 Blob 为文件
 * @param blob 文件 Blob
 * @param filename 文件名
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出 SVG 为 PDF
 * 注意：此功能需要安装 jspdf 库
 * @param svgElement SVG DOM 元素
 * @param options 导出选项
 */
export async function exportPDF(
  svgElement: SVGSVGElement,
  options: ExportOptions = {}
): Promise<Blob> {
  // 检查是否安装了 jspdf
  try {
    // 动态导入 jspdf（如果已安装）
    const jsPDFModule = await import('jspdf').catch(() => null);
    
    if (!jsPDFModule) {
      throw new Error('jsPDF is not installed');
    }

    const jsPDF = jsPDFModule.default;
    const { backgroundColor = '#ffffff' } = options;

    // 获取 SVG 尺寸
    const bbox = svgElement.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // 创建 PDF（A4 横向或根据图表尺寸）
    const orientation = width > height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [width, height],
    });

    // 设置背景色
    if (backgroundColor !== 'transparent') {
      pdf.setFillColor(backgroundColor);
      pdf.rect(0, 0, width, height, 'F');
    }

    // 将 SVG 转换为 PNG 并添加到 PDF
    const pngBlob = await exportHighResPNG(svgElement, {
      scale: 2,
      backgroundColor,
    });
    const pngUrl = URL.createObjectURL(pngBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        pdf.addImage(img, 'PNG', 0, 0, width, height);
        URL.revokeObjectURL(pngUrl);

        // 转换为 Blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      };
      img.onerror = () => {
        URL.revokeObjectURL(pngUrl);
        reject(new Error('Failed to load PNG for PDF'));
      };
      img.src = pngUrl;
    });
  } catch {
    throw new Error(
      'jsPDF is not installed. Run: npm install jspdf'
    );
  }
}

/**
 * 批量导出多个主题的图表
 * @param svgElement SVG DOM 元素
 * @param themeIds 主题 ID 列表
 * @param renderWithTheme 使用指定主题重新渲染的函数
 * @param format 导出格式（png 或 svg）
 * @param options 导出选项
 */
export async function batchExport(
  _svgElement: SVGSVGElement,
  themeIds: string[],
  renderWithTheme: (themeId: string) => Promise<SVGSVGElement>,
  format: 'png' | 'svg' = 'png',
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'diagram', scale = 2 } = options;

  for (const themeId of themeIds) {
    try {
      // 使用指定主题重新渲染
      const themedSvg = await renderWithTheme(themeId);

      if (format === 'png') {
        // 导出 PNG
        const blob = await exportHighResPNG(themedSvg, { scale });
        downloadBlob(blob, `${filename}-${themeId}.png`);
      } else {
        // 导出 SVG
        const svgData = new XMLSerializer().serializeToString(themedSvg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        downloadBlob(blob, `${filename}-${themeId}.svg`);
      }

      // 添加延迟避免浏览器阻止多个下载
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch {
      console.error(`Failed to export theme ${themeId}`);
    }
  }
}
