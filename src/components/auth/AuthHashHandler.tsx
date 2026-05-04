"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";

function hasAuthTokensInHash(hash: string) {
  return hash.includes("access_token=") && hash.includes("refresh_token=");
}

export function AuthHashHandler() {
  React.useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash || !hasAuthTokensInHash(hash)) return;

    const parsed = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const accessToken = parsed.get("access_token");
    const refreshToken = parsed.get("refresh_token");
    const type = parsed.get("type");

    if (!accessToken || !refreshToken) {
      window.location.replace("/socios?error=auth-missing-token");
      return;
    }

    const completeAuth = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Error al procesar hash de confirmación:", error);
        window.location.replace("/socios?error=auth-callback-failed");
        return;
      }

      const reason = type === "signup" ? "confirmed=1" : "recovered=1";
      window.location.replace(`/socios?${reason}`);
    };

    void completeAuth();
  }, []);

  return null;
}
