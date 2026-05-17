'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function setPlayerPassword(playerId: string, password: string): Promise<{ success?: boolean; email?: string; error?: string }> {
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  const admin = createAdminClient();

  const { data: player, error: playerError } = await admin
    .from('players')
    .select('full_name, email, phone')
    .eq('id', playerId)
    .single();

  if (playerError || !player) return { error: 'Player not found' };

  const email = player.email || (player.phone ? `${player.phone}@futsal.local` : null);
  if (!email) return { error: 'Player has no email or phone number' };

  // Try to find existing user
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = users.find(u => u.email === email);

  if (existing) {
    // Update password
    const { error } = await admin.auth.admin.updateUserById(existing.id, { password });
    if (error) return { error: error.message };
  } else {
    // Create new auth account
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: player.full_name },
    });
    if (error) return { error: error.message };

    // Create profile row if trigger didn't fire
    if (created.user) {
      await admin.from('profiles').upsert({
        user_id: created.user.id,
        email,
        full_name: player.full_name,
        role: 'player',
        status: 'active',
      }, { onConflict: 'user_id' });
    }
  }

  return { success: true, email };
}
