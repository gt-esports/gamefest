import { UserProfile } from "@clerk/clerk-react";
import { FaImage } from "react-icons/fa";
import Footer from "../components/Footer";
import PlayerCard from "./PlayerCard";


const UserProfilePage = () => {
  return (
    <div className="flex w-full bg-streak flex-col bg-cover">
      <div className="flex justify-center mt-40 tracking-wider">
        <UserProfile>
          {/* Player profile tab */}
          <UserProfile.Page label="Profile" url="Profile" labelIcon={<FaImage />}>
            <div>
              <h1>Player Profile</h1>
              <hr className="mb-4"/>
              <PlayerCard />
            </div>
          </UserProfile.Page>
        </UserProfile>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
