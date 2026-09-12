import daJson from './locales/da.json';
import enJson from './locales/en.json';
import type { Lang } from '@/lib/utils';

// --- Deep Key Comparison & Assertion ---
function getDeepKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const current = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getDeepKeys(value, current));
    } else {
      keys.push(current);
    }
  }
  return keys;
}

const daKeys = getDeepKeys(daJson);
const enKeys = getDeepKeys(enJson);

const missingInEn = daKeys.filter(k => !enKeys.includes(k));
const missingInDa = enKeys.filter(k => !daKeys.includes(k));

if (missingInEn.length > 0 || missingInDa.length > 0) {
  const errMsg = `Translation keys mismatch! Missing in EN: ${missingInEn.join(', ')}; Missing in DA: ${missingInDa.join(', ')}`;
  console.error(errMsg);
  throw new Error(errMsg);
}

// --- Flat Map Alias Generator ---
function generateFlatMap(categories: any): Record<string, string> {
  const flat: Record<string, string> = {};
  
  for (const [categoryKey, categoryValue] of Object.entries(categories)) {
    if (typeof categoryValue !== 'object' || categoryValue === null) continue;
    for (const [entryKey, entryValue] of Object.entries(categoryValue)) {
      if (typeof entryValue !== 'string') continue;
      flat[`${categoryKey}.${entryKey}`] = entryValue;
    }
  }
  
  for (const [categoryKey, categoryValue] of Object.entries(categories)) {
    if (typeof categoryValue !== 'object' || categoryValue === null) continue;
    const singularCategoryKey = categoryKey.endsWith('s') ? categoryKey.slice(0, -1) : categoryKey;
    
    for (const [entryKey, entryValue] of Object.entries(categoryValue)) {
      if (typeof entryValue !== 'string') continue;
      
      if (flat[entryKey] === undefined) {
        flat[entryKey] = entryValue;
      }
      
      const categoryAlias = `${categoryKey}_${entryKey}`;
      if (flat[categoryAlias] === undefined) {
        flat[categoryAlias] = entryValue;
      }
      
      const singularAlias = `${singularCategoryKey}_${entryKey}`;
      if (flat[singularAlias] === undefined) {
        flat[singularAlias] = entryValue;
      }
      
      if (categoryKey === 'categories') {
        const categoryItemAlias = `cat_${entryKey}`;
        if (flat[categoryItemAlias] === undefined) {
          flat[categoryItemAlias] = entryValue;
        }
      }
    }
  }
  
  if (flat.no_search_results === undefined && flat.search_no_results !== undefined) {
    flat.no_search_results = flat.search_no_results;
  }
  
  return flat;
}

const daFlat = generateFlatMap(daJson);
const enFlat = generateFlatMap(enJson);

function buildNestedTranslations(flat: Record<string, string>) {
  const obj: any = { ...flat };
  for (const [key, value] of Object.entries(flat)) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] === 'string') {
          current[part] = {};
        }
        current = current[part];
      }
      current[parts[parts.length - 1]] = value;
    }
  }
  return obj;
}

export const translations = {
  da: buildNestedTranslations(daFlat),
  en: buildNestedTranslations(enFlat),
};

export function getTranslation(key: string, lang: Lang, replacements?: Record<string, string | number>): string {
  const flatDict = lang === 'en' ? enFlat : daFlat;
  let text = flatDict[key] as string | undefined;
  
  if (typeof text !== 'string') {
    text = key;
  }
  
  if (replacements && typeof text === 'string') {
    let resultText: string = text;
    Object.entries(replacements).forEach(([k, v]) => {
      resultText = resultText.replace('{' + k + '}', String(v));
    });
    return resultText;
  }
  return text;
}
