/**
 * Accessibility Helper Functions
 * WCAG 2.1 AA Compliance Utilities
 */

/**
 * Generate accessible label for screen readers
 */
export function getAccessibilityLabel(
  element: string,
  action?: string,
  context?: string
): string {
  const parts = [element];
  if (action) parts.push(action);
  if (context) parts.push(context);
  return parts.join(', ');
}

/**
 * Get accessibility hint for complex interactions
 */
export function getAccessibilityHint(instruction: string): string {
  return `Double tap to ${instruction}`;
}

/**
 * Get accessibility role for component
 */
export function getAccessibilityRole(
  componentType: 'button' | 'link' | 'header' | 'text' | 'image' | 'search' | 'menu'
): string {
  const roleMapping: { [key: string]: string } = {
    button: 'button',
    link: 'link',
    header: 'header',
    text: 'text',
    image: 'image',
    search: 'search',
    menu: 'menu',
  };
  return roleMapping[componentType] || 'none';
}

/**
 * Calculate color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generate ARIA properties for form input
 */
export function getFormInputAccessibility(
  label: string,
  isRequired: boolean = false,
  errorMessage?: string
) {
  return {
    accessibilityLabel: label,
    accessibilityRequired: isRequired,
    accessibilityInvalid: !!errorMessage,
    accessibilityErrorMessage: errorMessage,
  };
}

/**
 * Format number for screen readers
 */
export function formatNumberForScreenReader(value: number, unit?: string): string {
  const formatted = value.toLocaleString();
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Announce to screen reader (for live regions)
 */
export function announceToScreenReader(message: string, assertive: boolean = false): void {
  // In React Native, this would use AccessibilityInfo.announceForAccessibility
  // For web, this would use a live region
  console.log(`[Screen Reader ${assertive ? 'Assertive' : 'Polite'}]: ${message}`);
}

/**
 * Check if device has screen reader enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  // Platform-specific implementation would go here
  // For web: check for screen reader hints
  // For mobile: use AccessibilityInfo.isScreenReaderEnabled()
  return false;
}

/**
 * Focus management - set focus to element
 */
export function setFocus(elementRef: any): void {
  if (elementRef && elementRef.current) {
    elementRef.current.focus();
  }
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardNavigation = {
  isEnterKey: (event: KeyboardEvent) => event.key === 'Enter',
  isSpaceKey: (event: KeyboardEvent) => event.key === ' ' || event.key === 'Spacebar',
  isEscapeKey: (event: KeyboardEvent) => event.key === 'Escape' || event.key === 'Esc',
  isTabKey: (event: KeyboardEvent) => event.key === 'Tab',
  isArrowKey: (event: KeyboardEvent) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key),
};

export default {
  getAccessibilityLabel,
  getAccessibilityHint,
  getAccessibilityRole,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getFormInputAccessibility,
  formatNumberForScreenReader,
  formatDateForScreenReader,
  announceToScreenReader,
  isScreenReaderEnabled,
  setFocus,
  KeyboardNavigation,
};
