export type CashierVariantLike = {
  id: string;
  quantity: number;
  price?: number;
} & Record<string, unknown>;

const INTERNAL_VARIANT_KEYS = new Set([
  'id',
  'price',
  'quantity',
  'sourceOwnerId',
  'sourceProductId',
  'sourceVariantId',
  'sourceProductRef',
  'sourceVariantRef',
  'createdAt',
  'updatedAt',
]);

function isDisplayValue(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export const buildVariantLabel = (
  variant: CashierVariantLike,
  attributeNames: string[],
) => {
  const preferredValues = attributeNames
    .map((name) => variant[name])
    .filter((value) => isDisplayValue(value) && String(value).trim().length > 0)
    .map((value) => String(value));

  if (preferredValues.length > 0) return preferredValues.join(' / ');

  const fallbackValues = Object.entries(variant)
    .filter(([key, value]) => {
      if (INTERNAL_VARIANT_KEYS.has(key)) return false;
      if (!isDisplayValue(value)) return false;
      return String(value).trim().length > 0;
    })
    .map(([, value]) => String(value));

  return fallbackValues.join(' / ');
};
