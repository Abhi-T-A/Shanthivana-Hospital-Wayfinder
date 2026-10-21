export interface RouteNode {
  id: number;
  name: string;
  node_type: string;
  map_x: number | null;
  map_y: number | null;
  is_verified: boolean;
  created_at: string;
}

export interface RouteEdge {
  id: number;
  from_node_id: number;
  to_node_id: number;
  distance_meters: number | null;
  travel_mode: string;
  is_accessible: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface RouteFindRequest {
  source_node_id: number;
  destination_node_id: number;
  travel_mode?: string;
}

export interface RouteFindResponse {
  source_node_id: number;
  destination_node_id: number;
  travel_mode: string;
  total_distance_meters: number;
  path_node_ids: number[];
  path_nodes: RouteNode[];
  verified: boolean;
}

export interface RouteNodeListResponse {
  items: RouteNode[];
  total: number;
}

export interface RouteEdgeListResponse {
  items: RouteEdge[];
  total: number;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export type GeolocationStatus = 
  | 'idle'
  | 'prompt'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'
  | 'skipped';
