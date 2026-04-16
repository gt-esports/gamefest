import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useAuth";
import { supabase } from "../utils/supabaseClient";
import { useRegistration } from "../hooks/useRegistration";

type DiscordProfile = {
  username: string;
  avatarUrl: string | null;
};

const PlayerCard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registration, loading: regLoading } = useRegistration(user?.id ?? null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data.user) {
        setError(userError?.message || "Unable to load profile.");
        setLoading(false);
        return;
      }

      const discordIdentity = data.user.identities?.find(
        (identity) => identity.provider === "discord"
      );

      const identityData =
        (discordIdentity?.identity_data as Record<string, string> | undefined) ||
        undefined;

      const username =
        identityData?.username ||
        identityData?.full_name ||
        (data.user.user_metadata as Record<string, string> | undefined)?.full_name ||
        data.user.email ||
        data.user.id;

      const avatarUrl =
        identityData?.avatar_url ||
        (data.user.user_metadata as Record<string, string> | undefined)?.avatar_url ||
        null;

      setProfile({ username, avatarUrl });
      setLoading(false);
    };

    void loadProfile();
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-3xl px-2 py-4">
      <div className="flex w-full flex-col gap-6 rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C]/90 to-[#101c3b]/90 p-6 text-white shadow-xl">
        <h2 className="font-bayon text-3xl text-white">Your Profile</h2>

        {!isLoaded || loading ? (
          <p className="text-gray-300">Loading profile...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : !user ? (
          <p className="text-gray-300">Sign in with Discord to view your profile.</p>
        ) : profile ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center gap-4 rounded-xl bg-white/5 p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.username} avatar`}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="font-bayon text-3xl">
                    {profile.username.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="font-bayon text-3xl">{profile.username}</p>
                <p className="text-blue-accent">Discord linked</p>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6">
              <p className="font-bayon text-2xl text-blue-bright">Registration Status</p>
              {regLoading ? (
                <p className="mt-2 text-sm text-gray-400">Checking registration...</p>
              ) : registration ? (
                <>
                  <div className="mt-4 inline-flex w-fit rounded-full bg-[#0099BB]/20 px-4 py-2 font-bayon text-lg text-[#0099BB]">
                    REGISTERED
                  </div>
                  <p className="mt-3 text-sm text-gray-300">
                    {registration.first_name} {registration.last_name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {registration.admission_type === "BYOC" ? "BYOC" : "General Admission"}
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-4 inline-flex w-fit rounded-full bg-[#1f2d4f] px-4 py-2 font-bayon text-lg text-[#9fb4e6]">
                    NOT REGISTERED
                  </div>
                  <p className="mt-3 font-quicksand text-sm font-semibold text-white">
                    You're not registered yet
                  </p>
                  <p className="mt-1 font-quicksand text-xs text-gray-400">
                    Secure your spot at GameFest 2026 by completing your registration.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="mt-4 w-fit rounded bg-gradient-to-r from-[#004466] to-[#0099BB] px-6 py-3 font-bayon text-lg text-white hover:shadow-lg hover:shadow-[#0099BB]/50"
                  >
                    REGISTER NOW
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-300">No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
