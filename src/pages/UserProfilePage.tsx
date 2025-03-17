import { useEffect, useState } from "react";
import { UserProfile } from "@clerk/clerk-react";
import { FaCalendar, FaCamera, FaTicketAlt } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Footer from "../components/Footer";

const DotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="16" height="16">
    <circle cx="256" cy="256" r="256" />
  </svg>
);

const UserProfilePage = () => {
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
                  {booth.map((booth) => (
                    <li>{booth}</li>
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

          {/* QR Scanner Tab */}
          <UserProfile.Page label="QR Scanner" url="scanner" labelIcon={<FaCamera />}>
            <div>
              <h1>QR Scan</h1>
              <hr className="mb-4"/>
              <p className="font-bold">Click 'Request Camera Permissions' to scan</p>
              <QRScanner scan={addBooth} setMessage={setMessage} />
              {message && (
                <p className={`mt-4 ${message.includes("try again") ? "text-red-500" : "text-green-500"}`}>
                  {message}
                  
                </p>
              )}
            </div>
          </UserProfile.Page>


          {/* QR Codes Tab */}
          <UserProfile.Page label="QR Code" url="code" labelIcon={<FaTicketAlt />}>
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
          </UserProfile.Page>
        </UserProfile>
      </div>
      <Footer />
    </div>
  );
};

const QRScanner = ({ scan, setMessage }: { scan: (data: string) => void, setMessage: React.Dispatch<React.SetStateAction<string>> }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 1, qrbox: 250 }, false);
    scanner.render(
      (e: string) => {
        if (e) {
          scan(e);
          setMessage(`Scanned: ${e}`);
        } else {
          setMessage('Please try again.');
        }
      },
      () => {
        setTimeout(() => {
          setMessage('');
        }, 5000);
      }
    );
    return () => {
      scanner.clear();
    };
  }, []);

  return <div id="reader"></div>;
};

export default UserProfilePage;
