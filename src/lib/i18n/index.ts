import { zh, TranslationKeys } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';

export const translations: Record<Locale, TranslationKeys> = {
  zh,
  en,
};

export { zh, en };
export type { TranslationKeys };

// 辅助函数：获取嵌套的翻译值
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` | K : K) : never }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

// 获取翻译值的辅助函数
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let result: unknown = translations[locale];

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key; // 返回原始 key 作为 fallback
    }
  }

  return typeof result === 'string' ? result : key;
}

// 带参数替换的翻译函数
export function formatTranslation(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
