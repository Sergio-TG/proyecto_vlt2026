"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";

function hasAuthTokensInHash(hash: string) {
  return hash.includes("access_token=") && hash.includes("refresh_token=");
}

function cleanHashFromUrl() {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
}

export function AuthHashHandler() {
  React.useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash || !hasAuthTokensInHash(hash)) return;

    const parsed = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const accessToken = parsed.get("access_token");
    const refreshToken = parsed.get("refresh_token");
    const type = (parsed.get("type") || "").toLowerCase();

    if (!accessToken || !refreshToken) {
      window.location.replace("/login?error=auth-missing-token");
      return;
    }

    const completeAuth = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Error al procesar hash de confirmación:", error);
        const failPath =
          type === "recovery"
            ? "/actualizar-clave?error=recovery-failed"
            : "/login?error=auth-callback-failed";
        window.location.replace(failPath);
        return;
      }

      // Recuperación: el usuario debe llegar al formulario de nueva contraseña.
      if (type === "recovery") {
        const onUpdatePage = window.location.pathname.startsWith("/actualizar-clave");
        if (onUpdatePage) {
          cleanHashFromUrl();
          return;
        }
        window.location.replace("/actualizar-clave");
        return;
      }

      const reason = type === "signup" ? "confirmed=1" : "recovered=1";
      window.location.replace(`/socios/portal?${reason}`);
    };

    void completeAuth();
  }, []);

  return null;
}
