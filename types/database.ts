export interface DeployedObject {
  id: string;
  user_id: string;
  object_type: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  created_at?: string;
  name?: string;
  description?: string;
  preciselatitude?: number;
  preciselongitude?: number;
  precisealtitude?: number;
  accuracy?: number;
  correctionapplied?: boolean;
  is_active?: boolean;
  model_url?: string;
  model_type?: string;
  scale_x?: number;
  scale_y?: number;
  scale_z?: number;
  rotation_x?: number;
  rotation_y?: number;
  rotation_z?: number;
  visibility_radius?: number;
  updated_at?: string;
  distance_meters?: number;
  interaction_fee_usdfc?: number;
  agent_wallet_address?: string;
  agent_wallet_type?: string;
  interaction_fee_usdfc?: number;
  payment_required?: boolean;
  payment_token?: string;
  payment_address?: string;
}

export interface DatabaseStats {
  totalObjects: number;
  activeObjects: number;
  correctedObjects: number;
  averageAccuracy: number;
}