import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import type { ReactNode } from "react";

export type UserProfile = {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
};

export type AppUser = {
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

export type AuthContextValue = {
    isLoaded: boolean;
    session: Session | null;
    user: AppUser | null;
    isSignedIn: boolean;
    signInWithDiscord: () => Promise<void>;
    signOut: () => Promise<void>;
    getToken: () => Promise<string | null>;
};

export type SignInButtonProps = {
    children: ReactNode;
    mode?: string;
};

export type UserButtonProps = {
    userProfileUrl?: string;
    userProfileMode?: string;
};
