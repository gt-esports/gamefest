import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    let cancelled = false;

    const redirect = () => {
      if (!cancelled) {
        setStatus("Signed in. Redirecting...");
        navigate("/profile", { replace: true });
      }
    };

    const run = async () => {
      setStatus("Completing sign in...");

      const code =
        params.get("code") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          redirect();
          return;
        }
        // Code may have already been consumed — fall through to session check.
      }

      // Check for an existing session (e.g. code was consumed by a previous render).
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && data.session) {
        redirect();
        return;
      }

      // Last resort: wait for an auth state event (handles async exchange in flight).
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          subscription.unsubscribe();
          redirect();
        }
      });

      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        if (!cancelled) {
          setStatus("Missing authorization code. Please sign in again.");
        }
      }, 8000);

      return () => {
        cancelled = true;
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount only

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="rounded-md border border-white/20 px-6 py-4 text-center">
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}

export default AuthCallback;
