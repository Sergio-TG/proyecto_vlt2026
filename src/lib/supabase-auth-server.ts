import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cliente Supabase para Server Components / layouts.
 * Usa cookies de sesión (SSR) — no confiar en getSession del cliente.
 */
export async function createAuthServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll puede fallar en Server Components de solo lectura; el middleware refresca la sesión.
          }
        },
      },
    },
  )
}
