export interface Room {
  id: number;
  room_number: string;
  type: 'single' | 'double' | 'deluxe' | 'suite';
  price_per_night: number;
  description?: string;
  status: 'available' | 'booked' | 'maintenance';
  capacity: number;
  amenities?: string[];
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomFilter {
  status?: string;
  type?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  order_by?: string;
  order_dir?: string;
}