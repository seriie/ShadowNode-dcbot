import { supabase } from '../config/supabase.js';

export async function getAllPlayers(client, region, limit = 100) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq("region", region)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error(client, "error", 'Error fetching unranked users:', error);
    return [];
  }
  return data || [];
}
