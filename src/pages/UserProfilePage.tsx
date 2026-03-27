import Footer from "../components/Footer";
import PlayerCard from "./PlayerCard";
import { SignInButton, useUser } from "../hooks/useAuth";

const UserProfilePage = () => {
  const { isLoaded, user } = useUser();
  console.log({ isLoaded, user })

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="mt-40 flex justify-center px-4 tracking-wider">
        {!isLoaded && <p className="text-white">Loading profile...</p>}

        {isLoaded && !user && (
          <div className="w-full max-w-3xl space-y-4 rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C]/90 to-[#101c3b]/90 p-6 text-white shadow-xl">
            <p>Sign in with Discord to view your player profile.</p>
            <SignInButton>
              <button className="rounded bg-gradient-to-r from-[#004466] to-[#0099BB] px-4 py-2 font-bayon text-white hover:shadow-lg hover:shadow-[#0099BB]/50">
                LOGIN
              </button>
            </SignInButton>
          </div>
        )}

        {isLoaded && user && <PlayerCard />}
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
