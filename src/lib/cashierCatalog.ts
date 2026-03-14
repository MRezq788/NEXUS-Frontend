import type { Category } from './database.types';
import { buildVariantLabel } from './cashierVariantLabels';

export interface CashierApiProductVariant {
  id: string;
  quantity: number;
  price?: number;
  [key: string]: unknown;
}

export interface CashierApiProductRecord {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  images?: string[];
  active?: boolean;
  createdAt?: string | { _seconds?: number; seconds?: number };
  attributes?: Array<{ name: string; values?: string[] }>;
  variants?: CashierApiProductVariant[];
}

export interface CashierCatalogVariant {
  id: string;
  key: string;
  label: string;
  price: number;
  availableQuantity: number;
  sourceProductId: string;
  sourceVariantId: string;
}

export interface CashierCatalogProduct {
  id: string;
  name: string;
  category_id: string | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
  minPrice: number;
  maxPrice: number;
  variants: CashierCatalogVariant[];
}

export interface CashierCartProduct {
  id: string;
  catalogProductId: string;
  sourceProductId: string;
  sourceVariantId: string;
  name: string;
  variantLabel: string;
  category_id: string | null;
  price: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
  maxQuantity: number;
}

export interface CashierCatalogData {
  products: CashierCatalogProduct[];
  categories: Category[];
}

function toIsoDate(value: CashierApiProductRecord['createdAt']) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  const seconds = typeof value.seconds === 'number' ? value.seconds : value._seconds;
  return seconds ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
}

function toCategoryId(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function mapCashierCatalogProducts(
  data: CashierApiProductRecord[],
): CashierCatalogData {
  const products: CashierCatalogProduct[] = [];

  data.forEach((product) => {
    if (product.active === false) return;

    const attributeNames = (product.attributes || [])
      .map((attribute) => attribute?.name)
      .filter((name): name is string => Boolean(name));

    const variants = (product.variants || [])
      .map((variant) => {
        const availableQuantity = Number(variant.quantity) || 0;
        if (availableQuantity <= 0) return null;

        const price = typeof variant.price === 'number'
          ? variant.price
          : (typeof product.basePrice === 'number' ? product.basePrice : 0);
        const fallbackLabel =
          typeof variant.sourceVariantId === 'string' && variant.sourceVariantId.trim().length > 0
            ? variant.sourceVariantId
            : variant.id;
        const label = buildVariantLabel(variant, attributeNames) || fallbackLabel;

        return {
          id: variant.id,
          key: `${product.id}__${variant.id}`,
          label,
          price,
          availableQuantity,
          sourceProductId: product.id,
          sourceVariantId: variant.id,
        } satisfies CashierCatalogVariant;
      })
      .filter((variant): variant is CashierCatalogVariant => variant !== null);

    if (variants.length === 0) return;

    const prices = variants.map((variant) => variant.price);

    products.push({
      id: product.id,
      name: product.name,
      category_id: toCategoryId(product.category || 'Uncategorized'),
      image_url: product.images?.[0] || null,
      description: product.description || 'Allocated product ready for sale.',
      created_at: toIsoDate(product.createdAt),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      variants,
    });
  });

  const groupedCategories = products.reduce<Map<string, Category>>((map, product) => {
    const categoryKey = product.category_id || 'uncategorized';
    const existing = map.get(categoryKey);
    if (existing) {
      existing.item_count += 1;
      return map;
    }

    const categoryName = categoryKey
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Uncategorized';

    map.set(categoryKey, {
      id: categoryKey,
      name: categoryName,
      icon: 'package',
      item_count: 1,
      created_at: new Date().toISOString(),
    });
    return map;
  }, new Map());

  return {
    products,
    categories: [
      {
        id: 'all-menu',
        name: 'All Menu',
        icon: 'layout-grid',
        item_count: products.length,
        created_at: new Date().toISOString(),
      },
      ...Array.from(groupedCategories.values()),
    ],
  };
}

export const createCashierCartProduct = (
  product: CashierCatalogProduct,
  variant: CashierCatalogVariant,
): CashierCartProduct => {
  return {
    id: variant.key,
    catalogProductId: product.id,
    sourceProductId: variant.sourceProductId,
    sourceVariantId: variant.sourceVariantId,
    name: product.name,
    variantLabel: variant.label,
    category_id: product.category_id,
    price: variant.price,
    image_url: product.image_url,
    description: product.description,
    created_at: product.created_at,
    maxQuantity: variant.availableQuantity,
  };
}
