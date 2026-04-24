import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import PlayerCard from "./PlayerCard";
import { SignInButton, useUser } from "../hooks/useAuth";
import { useUserRoles } from "../hooks/useUserRoles";

const UserProfilePage = () => {
  const { isLoaded, user } = useUser();
  const { isStaff, isAdmin } = useUserRoles();

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="mt-40 flex flex-col items-center gap-4 px-4 tracking-wider">
        {!isLoaded && <p className="text-white">Loading profile...</p>}

        {isLoaded && !user && (
          <div className="w-full max-w-3xl space-y-4 rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C]/90 to-[#101c3b]/90 p-6 text-white shadow-xl">
            <p>Sign in with Discord to view your player profile.</p>
            <SignInButton>
              <span className="inline-block rounded bg-gradient-to-r from-[#004466] to-[#0099BB] px-4 py-2 font-bayon text-white hover:shadow-lg hover:shadow-[#0099BB]/50">
                LOGIN
              </span>
            </SignInButton>
          </div>
        )}

        {isLoaded && user && isStaff && (
          <Link
            to="/rootAdmin"
            className="group flex w-full max-w-3xl items-center justify-between border border-blue-bright/50 bg-gradient-to-r from-[#0a1628]/90 to-[#0d2236]/90 px-6 py-4 text-white shadow-[0_0_30px_rgba(0,212,255,0.15)] transition-all hover:border-blue-bright hover:shadow-[0_0_40px_rgba(0,212,255,0.35)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-blue-bright/60 bg-blue-bright/10 text-xl text-blue-bright">
                ⌘
              </div>
              <div>
                <p className="font-bayon text-xs uppercase tracking-[0.3em] text-blue-bright/80">
                  {isAdmin ? "Admin Access" : "Staff Access"}
                </p>
                <p className="font-zuume text-2xl font-bold uppercase tracking-wider">
                  Enter the Command Deck
                </p>
              </div>
            </div>
            <span className="font-bayon text-sm uppercase tracking-[0.25em] text-blue-bright transition-transform group-hover:translate-x-1">
              Open →
            </span>
          </Link>
        )}

        {isLoaded && user && <PlayerCard />}
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
