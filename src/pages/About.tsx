import Footer from "../components/Footer";
import AboutInformation from "../components/AboutInformation";
import { useEffect } from "react";
import axios from "axios";
function About() {
  const fetchAPI = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}`);
    console.log(response.data.about);
  };

  useEffect(() => {
    fetchAPI();
  }, []);
  return (
    <div className="flex w-full flex-col items-center justify-center bg-streak bg-cover pt-36">
      <div className="flex items-center justify-center">
        <h1 className="justify-center font-bayon text-6xl text-white">ABOUT</h1>
      </div>
      <div className="flex w-[95%] items-center justify-center pt-4">
        <AboutInformation />
      </div>
      <Footer />
    </div>
  );
}

export default About;
