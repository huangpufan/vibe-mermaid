import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateSelector from '@/components/TemplateSelector';
import { useAppStore } from '@/lib/store';
import { DIAGRAM_TEMPLATES } from '@/lib/templates';
import { en } from '@/lib/i18n/en';
import { zh } from '@/lib/i18n/zh';

// Mock the store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

describe('TemplateSelector', () => {
  const mockSetCode = vi.fn();
  const mockOnClose = vi.fn();

  const createMockStore = (locale: 'en' | 'zh' = 'en') => {
    const t = locale === 'en' ? en : zh;
    const storeState = {
      locale,
      t,
      setCode: mockSetCode,
    };
    return (selector?: (state: typeof storeState) => unknown) => {
      if (typeof selector === 'function') {
        return selector(storeState);
      }
      return storeState;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(createMockStore('en'));
  });

  it('should render template selector modal', () => {
    render(<TemplateSelector onClose={mockOnClose} />);
    expect(screen.getByText('Diagram Templates')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<TemplateSelector onClose={mockOnClose} />);
    const searchInput = screen.getByPlaceholderText('Search templates...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should display category filters', () => {
    render(<TemplateSelector onClose={mockOnClose} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Flowchart')).toBeInTheDocument();
    expect(screen.getByText('Sequence')).toBeInTheDocument();
    expect(screen.getByText('Class')).toBeInTheDocument();
  });

  it('should display all templates by default', () => {
    render(<TemplateSelector onClose={mockOnClose} />);
    // Should show at least some templates
    const templates = screen.getAllByRole('button').filter((btn) => {
      const text = btn.textContent || '';
      return DIAGRAM_TEMPLATES.some((t) => text.includes(t.name));
    });
    expect(templates.length).toBeGreaterThan(0);
  });

  it('should filter templates by category', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    // Click on Flowchart category
    const flowchartButton = screen.getByText('Flowchart');
    fireEvent.click(flowchartButton);

    // Should only show flowchart templates
    const templates = screen.getAllByRole('button').filter((btn) => {
      const text = btn.textContent || '';
      return DIAGRAM_TEMPLATES.some((t) => text.includes(t.name));
    });

    // Verify all visible templates are flowcharts
    templates.forEach((template) => {
      const text = template.textContent || '';
      const matchingTemplate = DIAGRAM_TEMPLATES.find((t) => text.includes(t.name));
      if (matchingTemplate) {
        expect(matchingTemplate.category).toBe('flowchart');
      }
    });
  });

  it('should filter templates by search query', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'basic' } });

    // Should show templates matching "basic"
    const templates = screen.getAllByRole('button').filter((btn) => {
      const text = btn.textContent || '';
      return DIAGRAM_TEMPLATES.some((t) => text.includes(t.name));
    });
    expect(templates.length).toBeGreaterThan(0);
  });

  it('should show no results message when search has no matches', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } });

    expect(screen.getByText('No templates found')).toBeInTheDocument();
  });

  it('should apply template and close modal when template is clicked', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    // Find first template button
    const templates = screen.getAllByRole('button').filter((btn) => {
      const text = btn.textContent || '';
      return DIAGRAM_TEMPLATES.some((t) => text.includes(t.name));
    });

    expect(templates.length).toBeGreaterThan(0);
    fireEvent.click(templates[0]);

    expect(mockSetCode).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when close button is clicked', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display template count in footer', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    const footer = screen.getByText(/Showing \d+ templates/);
    expect(footer).toBeInTheDocument();
  });

  it('should display template tags', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    // Find a template with tags
    const templateWithTags = DIAGRAM_TEMPLATES.find((t) => t.tags.length > 0);
    if (templateWithTags) {
      const templateElement = screen.getByText(templateWithTags.name).closest('button');
      expect(templateElement).toBeInTheDocument();

      // Check if at least one tag is displayed
      const firstTag = templateWithTags.tags[0];
      expect(templateElement?.textContent).toContain(firstTag);
    }
  });

  it('should use Chinese locale when locale is zh', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(createMockStore('zh'));

    render(<TemplateSelector onClose={mockOnClose} />);

    expect(screen.getByText('图表模板')).toBeInTheDocument();
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('流程图')).toBeInTheDocument();
  });

  it('should display Chinese template names when locale is zh', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(createMockStore('zh'));

    render(<TemplateSelector onClose={mockOnClose} />);

    // Find a template and check if Chinese name is displayed
    const template = DIAGRAM_TEMPLATES[0];
    expect(screen.getByText(template.nameZh)).toBeInTheDocument();
  });

  it('should highlight selected category', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    const allButton = screen.getByText('All');
    expect(allButton).toHaveClass('bg-blue-500');

    const flowchartButton = screen.getByText('Flowchart');
    fireEvent.click(flowchartButton);

    expect(flowchartButton).toHaveClass('bg-blue-500');
  });

  it('should combine category and search filters', () => {
    render(<TemplateSelector onClose={mockOnClose} />);

    // Select flowchart category
    const flowchartButton = screen.getByText('Flowchart');
    fireEvent.click(flowchartButton);

    // Search for "basic"
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'basic' } });

    // Should show "Basic Flowchart" template
    expect(screen.getByText('Basic Flowchart')).toBeInTheDocument();

    // Should NOT show "Basic Sequence" since we filtered by flowchart category
    expect(screen.queryByText('Basic Sequence')).not.toBeInTheDocument();
  });
});
