import type { SupabaseClient } from "@supabase/supabase-js";
import { payconLandingContent } from "../content/payconLandingContent";

const { supabaseUrl, supabaseAnonKey } = payconLandingContent.form.integration;

/**
 * Cliente Supabase carregado SOB DEMANDA.
 *
 * O SDK `@supabase/supabase-js` só é necessário quando o usuário envia o
 * formulário — que fica abaixo da dobra e raramente é a primeira interação.
 * Mantê-lo em `import` estático o colocava no bundle inicial, competindo com o
 * carregamento da hero. Aqui ele é buscado por `import()` dinâmico na hora do
 * submit (Vite o separa num chunk próprio) e memoizado para envios seguintes.
 *
 * O `import type` acima é só tipagem — apagado na compilação, não puxa o SDK
 * para o bundle inicial.
 */
let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    );
  }
  return clientPromise;
}
