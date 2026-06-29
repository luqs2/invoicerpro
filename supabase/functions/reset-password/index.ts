// Supabase Edge Function: reset-password
// Allows unauthenticated password reset with rate limiting
// Deploy: supabase functions deploy reset-password
// Env vars needed: SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiter (per IP)
// Resets on cold start, but good enough for basic protection
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 3
const WINDOW_MS = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false
  }

  record.count++
  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown'

    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      throw new Error('Email and new password are required')
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format')
    }

    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    // Use service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!,
    )

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const user = userData.users.find(u => u.email === email)

    // Always return success — don't reveal if user exists
    if (!user) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )
    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? 'Failed to reset password' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
