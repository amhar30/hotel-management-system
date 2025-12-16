export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  type: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}