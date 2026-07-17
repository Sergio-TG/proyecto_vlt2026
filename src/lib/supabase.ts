import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing! Check .env.local")
}

const url = supabaseUrl || ""
const anonKey = supabaseAnonKey || ""

/**
 * En el navegador usa createBrowserClient (@supabase/ssr) para persistir
 * la sesión en cookies y alinear auth con el middleware.
 * En el servidor mantiene createClient para lecturas públicas.
 */
export const supabase =
  typeof window === "undefined"
    ? createClient(url, anonKey)
    : createBrowserClient(url, anonKey)
