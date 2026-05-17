'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function setPlayerPassword(
  playerId: string,
  password: string
): Promise<{ success?: boolean; email?: string; error?: string }> {
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  const admin = createAdminClient();

  // Get player details
  const { data: player, error: playerError } = await admin
    .from('players')
    .select('full_name, email, phone')
    .eq('id', playerId)
    .single();

  if (playerError || !player) return { error: 'Player not found' };

  // Try to find an existing profile linked to this player
  // The profiles table has the real Supabase Auth email
  let existingUserId: string | null = null;
  let authEmail: string | null = null;

  if (player.email) {
    const { data: profile } = await admin
      .from('profiles')
      .select('user_id, email')
      .eq('email', player.email)
      .single();
    if (profile) {
      existingUserId = profile.user_id;
      authEmail = profile.email;
    }
  }

  // If not found by email, try phone@futsal.local
  if (!existingUserId && player.phone) {
    const phoneEmail = `${player.phone}@futsal.local`;
    const { data: profile } = await admin
      .from('profiles')
      .select('user_id, email')
      .eq('email', phoneEmail)
      .single();
    if (profile) {
      existingUserId = profile.user_id;
      authEmail = profile.email;
    }
  }

  if (existingUserId) {
    // Update password for existing user
    const { error } = await admin.auth.admin.updateUserById(existingUserId, { password });
    if (error) return { error: error.message };
    return { success: true, email: authEmail! };
  }

  // No existing account — create one
  const email = player.email || (player.phone ? `${player.phone}@futsal.local` : null);
  if (!email) return { error: 'Player has no email or phone number' };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: player.full_name },
  });

  if (createError) return { error: createError.message };

  // Create profile row
  if (created.user) {
    await admin.from('profiles').upsert({
      user_id: created.user.id,
      email,
      full_name: player.full_name,
      role: 'player',
      status: 'active',
    }, { onConflict: 'user_id' });
  }

  return { success: true, email };
}
