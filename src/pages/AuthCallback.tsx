import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Completing sign in...");
  // Prevent double-redirect from StrictMode double-invoke or race conditions.
  const redirected = useRef(false);

  useEffect(() => {
    const redirect = () => {
      if (redirected.current) return;
      redirected.current = true;
      setStatus("Signed in. Redirecting...");
      navigate("/profile", { replace: true });
    };

    // Subscribe FIRST so we never miss a SIGNED_IN event fired during exchange.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        subscription.unsubscribe();
        redirect();
      }
    });

    let timeoutId: ReturnType<typeof setTimeout>;

    const run = async () => {
      // Fast path: session may already exist if exchange happened before mount.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        subscription.unsubscribe();
        redirect();
        return;
      }

      const code =
        params.get("code") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          // onAuthStateChange fires and calls redirect() — nothing more to do.
          return;
        }
        // Exchange failed (code may have been consumed). Check session once more.
        const { data: retryData } = await supabase.auth.getSession();
        if (retryData.session) {
          subscription.unsubscribe();
          redirect();
          return;
        }
      }

      // No code and no session — show failure after a short grace period.
      timeoutId = setTimeout(() => {
        subscription.unsubscribe();
        setStatus("Sign in failed. Please try again.");
      }, 5000);
    };

    void run();

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
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
