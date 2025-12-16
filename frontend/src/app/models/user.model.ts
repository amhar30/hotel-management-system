export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'staff';
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  id_proof?: string;
  id_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  user: User | Customer;
  token: string;
  user_type: 'user' | 'customer';
  role: 'admin' | 'staff' | 'customer';
}