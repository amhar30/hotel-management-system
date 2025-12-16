export interface Booking {
  id: number;
  customer_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out' | 'completed';
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
  room?: any;
  customer?: any;
  services?: any[];
  payment?: any;
  checkInOut?: any;
}

export interface BookingRequest {
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  services?: { service_id: number; quantity: number }[];
  special_requests?: string;
}

export interface AvailabilityCheck {
  check_in_date: string;
  check_out_date: string;
  room_type?: string;
  guests?: number;
}