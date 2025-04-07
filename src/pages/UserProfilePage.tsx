import { useEffect, useState } from "react";
import { useOrganization, UserProfile } from "@clerk/clerk-react";
import { FaCalendar, FaTicketAlt, FaUserLock } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Footer from "../components/Footer";
import AdminPanel from "./AdminPanel";

const DotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="16" height="16">
    <circle cx="256" cy="256" r="256" />
  </svg>
);

const UserProfilePage = () => {
  const { organization } = useOrganization();
  const [booth, setBooth] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const name = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("scanned") || "[]"); // booths are saved even after refresh
    setBooth(saved);
  }, []);

  const addBooth = (name: string) => {
    if (!booth.includes(name)) {
      const newBooth = [...booth, name];
      setBooth(newBooth);
      localStorage.setItem("scanned", JSON.stringify(newBooth));
    }
  };

  // check staff role
  const userRoles = organization?.publicMetadata?.roles;
  const isStaff = Array.isArray(userRoles) ? userRoles.includes("staff") : userRoles === "staff";

  return (
    <div className="flex w-full bg-streak flex-col bg-cover">
      <div className="flex justify-center mt-40 tracking-wider">
        <UserProfile>
          {/* Booths Tab */}
          <UserProfile.Page label="Booths" url="booths" labelIcon={<FaCalendar />}>
            <div>
              <h1>Booths Attended</h1>
              <hr className="mb-4" />
              {booth.length > 0 ? (
                <ul>
                  {booth.map((booth, index) => (
                    <li key={index}>{booth}</li>
                  ))}
                </ul>
              ) : (
                <p>No booth attended. Scan a QR code.</p>
              )}
            </div>
          </UserProfile.Page>

          {/* Points Tab */}
          <UserProfile.Page label="Points" url="points" labelIcon={<DotIcon />}>
            <div>
              <h1>Points Earned</h1>
              <hr className="mb-4"/>
              <p>You have {booth.length * 100} points.</p>
            </div>
          </UserProfile.Page>

          {/* Admin Tab */}
          <UserProfile.Page label="Admin" url="admin" labelIcon={<FaUserLock />}>
            {isStaff ? (
              <div>
                {/* <h1>QR Scan</h1>
                <hr className="mb-4"/>
                <div className="flex flex-col my-2 gap-2 font-bold">
                  <p>Click 'Request Camera Permissions' to scan.</p>
                  <p>Or click 'Scan an Image File' to to upload an image of the QR code.</p>
                </div>

                <QRScanner scan={addBooth} setMessage={setMessage} />
                {message && (
                  <p className={`mt-4 ${message.includes("try again") ? "text-red-500" : "text-green-500"}`}>
                    {message}
                  </p>
                )} */}
                <AdminPanel />
              </div>
            ) : (
              <div className="p-4 bg-yellow-100 rounded-md">
                <h2 className="text-lg font-bold flex text-black justify-center">Staff Access Required</h2>
                <p className="flex text-black justify-center">You need staff permissions to use this.</p>
              </div>
            )}
          </UserProfile.Page>

          {/* QR Codes Tab */}
          <UserProfile.Page label="QR Code" url="code" labelIcon={<FaTicketAlt />}>
            {(
              <div className="mt-10 text-center">
                <h1 className="mb-4 text-black">Scan QR Code</h1>
                <hr className="mb-4" />
                <div className="grid grid-cols-1 gap-4">
                  {name.map((booth, index) => (
                    <div key={index} className="p-4 rounded-md shadow-md">
                      <h1 className="text-lg mb-4">{booth}</h1>
                      <QRCodeCanvas value={booth} size={128} />
                    </div>
                  ))}
                </div>
              </div>
            // ) : (
            //   <div className="p-4 bg-yellow-100 rounded-md">
            //     <h2 className="flex justify-center text-lg font-bold text-black">Staff Access Required</h2>
            //     <p className="flex text-black justify-center">You need staff permissions to use this.</p>
            //   </div>
            )}
          </UserProfile.Page>
        </UserProfile>
      </div>
      <Footer />
    </div>
  );
};

// const QRScanner = ({ scan, setMessage }: { scan: (data: string) => void, setMessage: (msg: string) => void }) => {
//   useEffect(() => {
//     const scanner = new Html5QrcodeScanner("reader", { fps: 1, qrbox: 250 }, false);
//     scanner.render(
//       (e: string) => {
//         if (e) {
//           scan(e);
//           setMessage(`Scanned: ${e}`);
//         } else {
//           setMessage('Please try again.');
//         }
//       },
//       () => {
//         setTimeout(() => {
//           setMessage('');
//         }, 5000);
//       }
//     );
//     return () => {
//       scanner.clear();
//     };
//   }, []);

//   return <div id="reader"></div>;
// };

export default UserProfilePage;
