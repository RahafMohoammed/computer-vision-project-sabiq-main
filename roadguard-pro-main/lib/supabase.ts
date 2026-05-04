import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://anakeuilmixaezeyzgiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RDsLGsz_TISDhPdQUcu8gw_v24jCSFF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Detection {
  id: string;
  created_at: string;
  damage_type: 'crack' | 'pothole' | 'other';
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  latitude: number;
  longitude: number;
  status: 'pending' | 'fixed' | 'in_review';
  reported_to: string | null;
  google_maps_url: string | null;
}
