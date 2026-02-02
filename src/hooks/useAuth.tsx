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

const AuthContext = createContext<AuthContextValue | null>(null);

const getUsernameFromUser = (user: SupabaseUser): string => {
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

const mapUser = (user: SupabaseUser | null): AppUser | null => {
  if (!user) return null;

  const meta = user.user_metadata || {};
  const appMeta = user.app_metadata || {};

  const username = getUsernameFromUser(user);
  const fullName = meta.full_name || meta.name || username;
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsLoaded(true);
    };

    void bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, updatedSession) => {
        setSession(updatedSession ?? null);
        setIsLoaded(true);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = mapUser(session?.user || null);

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
      },
      getToken: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
      },
    };
  }, [isLoaded, session]);

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

  if (!user) return null;

  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <a className="hover:text-tech-gold" href={userProfileUrl}>
        {user.username || "Profile"}
      </a>
      <button className="hover:text-tech-gold" onClick={() => void signOut()}>
        Logout
      </button>
    </div>
  );
};
