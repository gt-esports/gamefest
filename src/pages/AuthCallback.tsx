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

    // Supabase (detectSessionInUrl: true) performs the PKCE exchange during
    // client construction. We only need to wait for it to finish. Do NOT call
    // exchangeCodeForSession here — that would consume the OAuth code a second
    // time and fail with "Unable to exchange external code".
    const fastPath = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        subscription.unsubscribe();
        redirect();
      }
    };
    void fastPath();

    const timeoutId = setTimeout(() => {
      subscription.unsubscribe();
      setStatus("Sign in failed. Please try again.");
    }, 8000);

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
