export type UserRole = 'warehouse' | 'business_owner' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
}

export interface SidebarTab {
  title: string;
  route: string;
  icon?: React.ReactNode;
}
