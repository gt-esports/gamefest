import { UserProfile } from "@clerk/clerk-react";
import { FaCalendar } from "react-icons/fa";

const DotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="16" height="16">
    <circle cx="256" cy="256" r="256" />
  </svg>
);

const UserProfilePage = () => {
  return (
    <div>
      <UserProfile>
      {/* Booths Tab */}
      <UserProfile.Page label="Booths" url="booths" labelIcon={<FaCalendar />}>
        <div className="text-2xl">
          <h1>Booths Attended</h1>
          <p>You have attended 3 booths.</p>
        </div>
      </UserProfile.Page>

      {/* Points Tab */}
      <UserProfile.Page label="Points" url="points" labelIcon={<DotIcon />}>
        <div>
          <h1>Points Earned</h1>
          <p>You have 1200 points.</p>
        </div>
      </UserProfile.Page>
    </UserProfile>
    </div>
    
  );
};

export default UserProfilePage;
