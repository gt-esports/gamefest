import Footer from "../components/Footer";
import PlayerCard from "./PlayerCard";
import { SignInButton, useUser } from "../hooks/useAuth";

const UserProfilePage = () => {
  const { isLoaded, user } = useUser();
  console.log({ isLoaded, user })

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="mt-40 flex justify-center tracking-wider">
        <div className="w-full max-w-5xl rounded-xl border border-white/20 bg-black/40 p-6">
          <h1 className="mb-4 text-3xl font-bayon text-tech-gold">Profile</h1>
          <hr className="mb-4 border-white/20" />

          {!isLoaded && <p>Loading profile...</p>}

          {isLoaded && !user && (
            <div className="space-y-4">
              <p className="text-white">Sign in with Discord to view your player profile.</p>
              <SignInButton>
                <button className="rounded bg-tech-gold px-4 py-2 font-bayon text-white hover:bg-tech-gold/90">
                  LOGIN
                </button>
              </SignInButton>
            </div>
          )}

          {isLoaded && user && <PlayerCard />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
