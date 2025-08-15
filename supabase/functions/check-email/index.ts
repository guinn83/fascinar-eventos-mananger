import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const { email } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email obrigatório' }), { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // 1. Buscar usuário pelo email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users || !users.users) {
    return new Response(JSON.stringify({ exists: false, firstAccess: false }), { status: 200, headers: corsHeaders });
  }
  const user = users.users.find((u: any) => u.email === email);
  if (!user) {
    return new Response(JSON.stringify({ exists: false, firstAccess: false }), { status: 200, headers: corsHeaders });
  }
  // 2. Buscar perfil pelo user_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, has_password')
    .eq('user_id', user.id)
    .maybeSingle();
  if (profileError || !profile) {
    // Usuário existe, mas não tem perfil ainda
    return new Response(JSON.stringify({ exists: true, firstAccess: true }), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ exists: true, firstAccess: !profile.has_password }), { status: 200, headers: corsHeaders });
});