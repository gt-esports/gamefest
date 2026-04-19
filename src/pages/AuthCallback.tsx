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
    // Surface provider-side errors immediately (e.g. user denied consent).
    const providerError = params.get("error_description") || params.get("error");
    if (providerError) {
      setStatus(`Sign in failed: ${providerError}`);
      return;
    }

    const redirect = () => {
      if (redirected.current) return;
      redirected.current = true;
      setStatus("Signed in. Redirecting...");
      navigate("/profile", { replace: true });
    };

    // Subscribe FIRST so we never miss a SIGNED_IN event fired by Supabase's
    // auto URL detection (detectSessionInUrl: true in supabaseClient).
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
      // Fast path: session may already exist if Supabase finished the exchange
      // before this component mounted.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        subscription.unsubscribe();
        redirect();
        return;
      }

      // Fallback: if auto-detect didn't fire (e.g. route mismatch), exchange
      // the code manually. This primarily catches edge cases.
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[AuthCallback] exchangeCodeForSession failed:", error);
          subscription.unsubscribe();
          setStatus(`Sign in failed: ${error.message}`);
          return;
        }
        // onAuthStateChange will fire with the new session.
        return;
      }

      // No session, no code — wait briefly for auto-detect, then give up.
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
