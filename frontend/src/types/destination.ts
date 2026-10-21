export interface Destination {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  map_x: number | null;
  map_y: number | null;
  building_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DestinationListResponse {
  items: Destination[];
  total: number;
  limit: number;
  offset: number;
}

export interface DestinationQueryParams {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export type CategoryFilter = 
  | 'all'
  | 'hospital'
  | 'accommodation'
  | 'yoga'
  | 'wellness'
  | 'administrative'
  | 'amenity'
  | 'entrance'
  | 'utility';
