import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSafeOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "");

  let host = forwardedHost || hostHeader || request.nextUrl.host;
  const hostname = host.split(":")[0];

  // En desarrollo puede llegar 0.0.0.0, que el navegador no acepta para redirigir.
  if (hostname === "0.0.0.0" || hostname === "::" || hostname === "[::]") {
    const port = host.includes(":") ? host.split(":")[1] : request.nextUrl.port;
    host = port ? `localhost:${port}` : "localhost";
  }

  return `${protocol}://${host}`;
}

function getSafeNextPath(raw: string | null, fallback: string) {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = getSafeOrigin(request);
  const code = searchParams.get("code");
  const type = (searchParams.get("type") || "").toLowerCase();
  const isRecovery = type === "recovery";

  const fallbackNext = isRecovery ? "/actualizar-clave" : "/socios/portal";
  let next = getSafeNextPath(searchParams.get("next"), fallbackNext);

  // Recuperación de contraseña: siempre al formulario, nunca al portal/home.
  if (isRecovery || next.startsWith("/actualizar-clave")) {
    next = "/actualizar-clave";
  }

  if (!code) {
    const failPath = isRecovery
      ? "/actualizar-clave?error=recovery-failed"
      : "/login?error=auth-callback-failed";
    return NextResponse.redirect(`${origin}${failPath}`);
  }

  let redirectResponse = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          redirectResponse = NextResponse.redirect(`${origin}${next}`);
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("auth/callback exchangeCodeForSession:", error.message);
    const failPath = isRecovery || next === "/actualizar-clave"
      ? "/actualizar-clave?error=recovery-failed"
      : "/login?error=auth-callback-failed";
    return NextResponse.redirect(`${origin}${failPath}`);
  }

  return redirectResponse;
}
