import {
  cloneElement,
  createContext,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../utils/supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

type AppUser = {
  id: string;
  username: string;
  firstName: string;
  fullName: string;
  publicMetadata: {
    role: string | null;
  };
  externalAccounts: Array<{ provider: string; username: string }>;
  raw: SupabaseUser;
};

type AuthContextValue = {
  isLoaded: boolean;
  session: Session | null;
  user: AppUser | null;
  isSignedIn: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

type UserProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

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
  const appMeta = user.app_metadata || {};

  const username = getUsernameFromUser(user, profile);
  const fullName = profile?.display_name || meta.full_name || meta.name || username;
  const firstName = meta.given_name || fullName?.split(" ")?.[0] || username;
  const role = meta.role || appMeta.role || null;

  const discordUsername =
    meta.user_name || meta.preferred_username || meta.username || username;

  return {
    id: user.id,
    username,
    firstName,
    fullName,
    publicMetadata: {
      role,
    },
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

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("SESSION:", data.session); // 👈 add this
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

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, updatedSession) => {
        let userProfile: UserProfile | null = null;
        if (updatedSession?.user) {
          // Optimization: Only fetch if we don't have it or user changed, 
          // but for simplicity/correctness on login, fetching is safer.
          userProfile = await fetchProfile(updatedSession.user.id);
        }

        if (mounted) {
          setSession(updatedSession ?? null);
          setProfile(userProfile);
          setIsLoaded(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = mapUser(session?.user || null, profile);
    console.log(user)
    return {
      isLoaded,
      session,
      user,
      isSignedIn: Boolean(user),
      signInWithDiscord: async () => {
        const redirectTo = window.location.href;
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
        setProfile(null);

      },
      getToken: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
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

type SignInButtonProps = {
  children: ReactNode;
  mode?: string;
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

type UserButtonProps = {
  userProfileUrl?: string;
  userProfileMode?: string;
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
