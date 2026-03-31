import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../utils/supabaseClient";
import type { AppUser, AuthContextValue, SignInButtonProps, UserButtonProps } from "../schemas/AuthSchema";

const AuthContext = createContext<AuthContextValue | null>(null);

const mapUser = (user: SupabaseUser): AppUser => {
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord");
  const discordUsername =
    (discordIdentity?.identity_data as Record<string, string> | undefined)?.username ||
    (discordIdentity?.identity_data as Record<string, string> | undefined)?.full_name ||
    null;

  const fullName =
    (user.user_metadata as Record<string, string> | undefined)?.full_name ||
    discordUsername ||
    user.email ||
    user.id;

  return {
    id: user.id,
    username: fullName,
    firstName: fullName?.split(" ")[0] || "",
    fullName: fullName || "",
    externalAccounts: discordUsername ? [{ provider: "discord", username: discordUsername }] : [],
    raw: user,
  };
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? mapUser(data.session.user) : null);
      setIsLoaded(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ? mapUser(nextSession.user) : null);
      setIsLoaded(true);
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.access_token ?? null;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded,
      session,
      user,
      isSignedIn: Boolean(user),
      signInWithDiscord,
      signOut,
      getToken,
    }),
    [isLoaded, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const useUser = () => {
  const { user, isLoaded } = useAuth();
  return { user, isLoaded };
};

const SignInButton = ({ children }: SignInButtonProps) => {
  const { signInWithDiscord } = useAuth();
  return (
    <button onClick={() => void signInWithDiscord()} type="button">
      {children}
    </button>
  );
};

const SignedIn = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
};

const SignedOut = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
};

const UserButton = ({ userProfileUrl = "/profile" }: UserButtonProps) => {
  const { user, signOut } = useAuth();
  return (
    <div className="flex items-center gap-2">
      <a href={userProfileUrl} className="underline">
        {user?.username || user?.fullName || "Profile"}
      </a>
      <button onClick={() => void signOut()} type="button">
        Logout
      </button>
    </div>
  );
};

export { AuthProvider, useAuth, useUser, SignInButton, SignedIn, SignedOut, UserButton };