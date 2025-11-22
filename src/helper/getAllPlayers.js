// db/getUnrankedUsers.js
import { supabase } from '../config/supabase.js';

export async function getAllPlayers(client, limit = 100) {
  // note: select top `limit` users (select menu limit = 25)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error(client, "error", 'Error fetching unranked users:', error);
    return [];
  }
  return data || [];
}
