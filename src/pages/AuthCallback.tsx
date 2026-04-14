import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    const run = async () => {
      setStatus("Completing sign in...");

      // Prefer query param code (PKCE). Fallback to hash fragment if present.
      const code =
        params.get("code") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("Sign in failed. Please try again.");
          return;
        }

        setStatus("Signed in. Redirecting...");
        navigate("/profile", { replace: true });
        return;
      }

      // If code already consumed by Supabase (detectSessionInUrl), session will exist.
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        setStatus("Signed in. Redirecting...");
        navigate("/profile", { replace: true });
        return;
      }

      setStatus("Missing authorization code. Please sign in again.");
    };

    void run();
  }, [navigate, params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="rounded-md border border-white/20 px-6 py-4 text-center">
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}

export default AuthCallback;
