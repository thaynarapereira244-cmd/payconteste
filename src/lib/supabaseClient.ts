import { createClient } from "@supabase/supabase-js";
import { payconLandingContent } from "../content/payconLandingContent";

const { supabaseUrl, supabaseAnonKey } = payconLandingContent.form.integration;

/**
 * Mesmo backend da LP original (ver README, seção "Integrações"): Supabase Edge
 * Function `submit-lead`. A anon key é pública por design do Supabase (é a mesma
 * exposta no bundle JS do site em produção) e não concede acesso a dados —
 * apenas invoca a function, que faz a validação/gravação no servidor.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
