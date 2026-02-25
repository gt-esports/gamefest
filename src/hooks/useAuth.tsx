import {
  cloneElement,
  createContext,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../utils/supabaseClient";
import type {
  AppUser,
  AuthContextValue,
  SignInButtonProps,
  UserButtonProps,
  UserProfile,
} from "../schemas/AuthSchema";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextValue | null>(null);

const getUsernameFromUser = (user: SupabaseUser, profile: UserProfile | null): string => {
  if (profile?.display_name) return profile.display_name;
  if (profile?.username) return profile.username;

  const meta = user.user_metadata || {};
  const appMeta = user.app_metadata || {};

  return (
    meta.user_name ||
    meta.preferred_username ||
    meta.username ||
    meta.name ||
    meta.full_name ||
    appMeta.provider_id ||
    user.email?.split("@")[0] ||
    ""
  );
};

const mapUser = (user: SupabaseUser | null, profile: UserProfile | null): AppUser | null => {
  if (!user) return null;

  const meta = user.user_metadata || {};

  const username = getUsernameFromUser(user, profile);
  const fullName = profile?.display_name || meta.full_name || meta.name || username;
  const firstName = meta.given_name || fullName?.split(" ")?.[0] || username;

  const discordUsername =
    meta.user_name || meta.preferred_username || meta.username || username;

  return {
    id: user.id,
    username,
    firstName,
    fullName,
    externalAccounts: discordUsername
      ? [{ provider: "discord", username: discordUsername }]
      : [],
    raw: user,
  };
};

const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("Auth hooks must be used inside AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data as UserProfile | null;
  };

  useEffect(() => {
    let mounted = true;

    // Set up the listener FIRST so we never miss an auth event.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, updatedSession) => {
        if (!mounted) return;

        let userProfile: UserProfile | null = null;
        if (updatedSession?.user) {
          userProfile = await fetchProfile(updatedSession.user.id);
        }

        if (mounted) {
          setSession(updatedSession ?? null);
          setProfile(userProfile);
          setIsLoaded(true);
        }
      }
    );

    // Then get the current session — any change that happened between
    // mounting and the listener registering will still be caught.
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      let userProfile: UserProfile | null = null;
      if (data.session?.user) {
        userProfile = await fetchProfile(data.session.user.id);
      }

      setSession(data.session ?? null);
      setProfile(userProfile);
      setIsLoaded(true);
    };

    void bootstrap();

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = mapUser(session?.user || null, profile);
    return {
      isLoaded,
      session,
      user,
      isSignedIn: Boolean(user),
      signInWithDiscord: async () => {
        const redirectTo = `${window.location.origin}/`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "discord",
          options: { redirectTo },
        });

        if (error) {
          console.error("Discord sign-in failed", error);
          alert("Unable to sign in with Discord right now.");
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Sign-out failed", error);
        }
        setSession(null);
        setProfile(null);
      },
      getToken: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Failed to retrieve session token", error);
          return null;
        }
        return data.session?.access_token ?? null;
      },
    };
  }, [isLoaded, session, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useAuthContext();

  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    signOut: ctx.signOut,
    getToken: ctx.getToken,
  };
};

export const useUser = () => {
  const ctx = useAuthContext();

  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    user: ctx.user,
  };
};

export const SignedIn = ({ children }: PropsWithChildren) => {
  const { isSignedIn } = useAuthContext();
  if (!isSignedIn) return null;
  return <>{children}</>;
};

export const SignedOut = ({ children }: PropsWithChildren) => {
  const { isSignedIn } = useAuthContext();
  if (isSignedIn) return null;
  return <>{children}</>;
};

export const SignInButton = ({ children }: SignInButtonProps) => {
  const { signInWithDiscord } = useAuthContext();

  const handleClick = async () => {
    await signInWithDiscord();
  };

  if (isValidElement(children)) {
    const element = children as ReactElement<{ onClick?: () => void }>;
    return cloneElement(element, {
      onClick: async () => {
        element.props.onClick?.();
        await handleClick();
      },
    });
  }

  return <button onClick={() => void handleClick()}>{children}</button>;
};

export const UserButton = ({ userProfileUrl = "/profile" }: UserButtonProps) => {
  const { user, signOut } = useAuthContext();

  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <a className="hover:text-tech-gold" href={userProfileUrl}>
        {user.username || "Profile"}
      </a>
      <button className="hover:text-tech-gold" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};
