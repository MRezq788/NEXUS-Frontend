export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          item_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          item_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          item_count?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category_id: string | null;
          price: number;
          image_url: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id?: string | null;
          price: number;
          image_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string | null;
          price?: number;
          image_url?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      restaurant_tables: {
        Row: {
          id: string;
          table_number: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_number: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_number?: string;
          status?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string | null;
          table_id: string | null;
          order_type: string;
          status: string;
          subtotal: number;
          tax: number;
          discount: number;
          total: number;
          promo_code: string | null;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_name?: string | null;
          table_id?: string | null;
          order_type?: string;
          status?: string;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          promo_code?: string | null;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string | null;
          table_id?: string | null;
          order_type?: string;
          status?: string;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          promo_code?: string | null;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          product_id: string | null;
          quantity: number;
          price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          price: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          price?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
