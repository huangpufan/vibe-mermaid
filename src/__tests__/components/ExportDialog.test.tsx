import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportDialog } from '@/components/ExportDialog';
import { zh } from '@/lib/i18n/zh';

describe('ExportDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnExport = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onExport: mockOnExport,
    t: zh,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ExportDialog {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render dialog when isOpen is true', () => {
    render(<ExportDialog {...defaultProps} />);
    expect(screen.getByText(zh.export.title)).toBeInTheDocument();
  });

  it('should close dialog when clicking close button', () => {
    render(<ExportDialog {...defaultProps} />);
    const closeButton = screen.getByLabelText(zh.common.close);
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close dialog when clicking backdrop', () => {
    render(<ExportDialog {...defaultProps} />);
    const backdrop = screen.getByText(zh.export.title).closest('div')?.parentElement?.parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should not close when clicking dialog content', () => {
    render(<ExportDialog {...defaultProps} />);
    const dialogContent = screen.getByText(zh.export.title).closest('div');
    if (dialogContent) {
      fireEvent.click(dialogContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should select PNG format by default', () => {
    render(<ExportDialog {...defaultProps} />);
    const pngButton = screen.getByText('PNG').closest('button');
    expect(pngButton).toHaveClass('border-cyan-500');
  });

  it('should switch to PDF format when clicked', () => {
    render(<ExportDialog {...defaultProps} />);
    const pdfButton = screen.getByText('PDF').closest('button');
    if (pdfButton) {
      fireEvent.click(pdfButton);
      expect(pdfButton).toHaveClass('border-cyan-500');
    }
  });

  it('should show quality options for PNG format', () => {
    render(<ExportDialog {...defaultProps} />);
    expect(screen.getByText(zh.export.quality)).toBeInTheDocument();
    expect(screen.getByText(zh.export.qualityStandard)).toBeInTheDocument();
    expect(screen.getByText(zh.export.qualityHigh)).toBeInTheDocument();
  });

  it('should hide quality options for PDF format', () => {
    render(<ExportDialog {...defaultProps} />);
    const pdfButton = screen.getByText('PDF').closest('button');
    if (pdfButton) {
      fireEvent.click(pdfButton);
      expect(screen.queryByText(zh.export.quality)).not.toBeInTheDocument();
    }
  });

  it('should show PDF notice when PDF format is selected', () => {
    render(<ExportDialog {...defaultProps} />);
    const pdfButton = screen.getByText('PDF').closest('button');
    if (pdfButton) {
      fireEvent.click(pdfButton);
      expect(screen.getByText(zh.export.pdfNotice)).toBeInTheDocument();
    }
  });

  it('should select quality scale', () => {
    render(<ExportDialog {...defaultProps} />);
    const ultraQualityButton = screen.getByText(zh.export.qualityUltra).closest('button');
    if (ultraQualityButton) {
      fireEvent.click(ultraQualityButton);
      expect(ultraQualityButton).toHaveClass('border-cyan-500');
    }
  });

  it('should call onExport with PNG format and default scale', async () => {
    mockOnExport.mockResolvedValue(undefined);
    render(<ExportDialog {...defaultProps} />);
    
    const exportButton = screen.getByText(zh.export.export);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith('png', 2);
    });
  });

  it('should call onExport with PDF format', async () => {
    mockOnExport.mockResolvedValue(undefined);
    render(<ExportDialog {...defaultProps} />);
    
    const pdfButton = screen.getByText('PDF').closest('button');
    if (pdfButton) {
      fireEvent.click(pdfButton);
    }

    const exportButton = screen.getByText(zh.export.export);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith('pdf', 2);
    });
  });

  it('should call onExport with custom scale', async () => {
    mockOnExport.mockResolvedValue(undefined);
    render(<ExportDialog {...defaultProps} />);
    
    const maxQualityButton = screen.getByText(zh.export.qualityMax).closest('button');
    if (maxQualityButton) {
      fireEvent.click(maxQualityButton);
    }

    const exportButton = screen.getByText(zh.export.export);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith('png', 4);
    });
  });

  it('should show loading state during export', async () => {
    mockOnExport.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ExportDialog {...defaultProps} />);
    
    const exportButton = screen.getByText(zh.export.export);
    fireEvent.click(exportButton);

    expect(screen.getByText(zh.export.exporting)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should disable buttons during export', async () => {
    mockOnExport.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ExportDialog {...defaultProps} />);
    
    const exportButton = screen.getByText(zh.export.export);
    const cancelButton = screen.getByText(zh.common.cancel);
    
    fireEvent.click(exportButton);

    expect(exportButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should close dialog after successful export', async () => {
    mockOnExport.mockResolvedValue(undefined);
    render(<ExportDialog {...defaultProps} />);
    
    const exportButton = screen.getByText(zh.export.export);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle export error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnExport.mockRejectedValue(new Error('Export failed'));
    render(<ExportDialog {...defaultProps} />);
    
    const exportButton = screen.getByText(zh.export.export);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
