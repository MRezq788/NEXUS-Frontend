export interface Variant {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  images?: string[];
  variants?: Variant[];
  [key: string]: unknown;
}

export interface AiAssistantSettings {
  enabled?: boolean;
  systemPrompt?: string;
  updatedAt?: unknown;
}

export interface SiteSettings {
  siteName: string;
  store?: {
    name?: string;
    currency?: string;
    shippingFee?: number;
    aiAssistant?: AiAssistantSettings;
    [key: string]: unknown;
  };
}

export interface PuckData {
  content: Array<{
    type: string;
    props: Record<string, unknown> & { id?: string };
    content?: Array<unknown>;
  }>;
  root: { props?: Record<string, unknown> };
  zones?: Record<
    string,
    Array<{
      type: string;
      props: Record<string, unknown> & { id?: string };
      content?: Array<unknown>;
    }>
  >;
  [key: string]: unknown;
}

export interface SitePage {
  id: string;
  siteName: string;
  pageName: string;
  pageSlug: string;
  isHomepage: boolean;
  puckData: PuckData;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: string;
}

export interface SiteAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  notes: string;
  isDefault: boolean;
}

export interface SiteUser {
  id: string;
  email: string;
  name: string;
  siteName: string;
  cart?: {
    items: CartItem[];
  };
  wishlist?: string[];
  savedAddresses?: SiteAddress[];
}

export interface SiteOrder {
  id: string;
  orderId: string;
  siteName: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: SiteAddress;
  items: Array<{
    productId: string;
    productName: string;
    variantId?: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  notes?: string;
}
