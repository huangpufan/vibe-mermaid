import mermaid from 'mermaid';
import { ThemeConfig, THEME_PRESETS } from './store';

// Track if mermaid has been initialized
let initialized = false;

// Initialize mermaid once with base configuration (no theme-specific settings)
const ensureInitialized = () => {
  if (initialized) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
    },
    sequence: {
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
    },
  });

  initialized = true;
};

// Build theme directive string
const buildThemeDirective = (theme: ThemeConfig): string => {
  const config = {
    theme: theme.base,
    themeVariables: theme.themeVariables,
  };
  return `%%{init: ${JSON.stringify(config)}}%%`;
};

// Inject theme directive into mermaid code
const injectThemeDirective = (code: string, themeId?: string): string => {
  const theme = themeId
    ? THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0]
    : THEME_PRESETS[0];

  // Remove any existing init directive from the code (case insensitive, multiline)
  const codeWithoutDirective = code.replace(/%%\{init:[\s\S]*?\}%%\s*/gi, '');

  // Prepend the theme directive
  return `${buildThemeDirective(theme)}\n${codeWithoutDirective}`;
};

// Initialize mermaid (kept for backward compatibility, themeId is now handled per-render)
export const initMermaid = () => {
  ensureInitialized();
};

// Get current theme config
export const getThemeConfig = (themeId: string): ThemeConfig => {
  return THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
};

// Validate mermaid code and return error if any
export const validateMermaidCode = async (
  code: string
): Promise<{ valid: boolean; error?: string }> => {
  ensureInitialized();
  try {
    await mermaid.parse(code);
    return { valid: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: errorMessage };
  }
};

// Render mermaid code to SVG
export const renderMermaid = async (
  code: string,
  containerId: string,
  themeId?: string
): Promise<{ svg: string } | { error: string }> => {
  // Ensure mermaid is initialized
  ensureInitialized();

  // Inject theme directive into the code for reliable theme application
  const themedCode = injectThemeDirective(code, themeId);

  try {
    const { svg } = await mermaid.render(containerId, themedCode);
    return { svg };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { error: errorMessage };
  }
};
