import Footer from "../components/Footer";
import Sponsors from '../assets/sponsors.png';

function Sponsor() {
  return (
    <div className="flex w-full bg-streak flex-col bg-cover">
      <div className="w-full mx-auto text-white text-center pt-36 p-8 px-10 lg:px-20">
        <h1 className="justify-center font-bayon text-6xl pb-4">Sponsors</h1>
        <div className='mx-auto bg-gray-800/80 p-8 items-center rounded-lg'>
          <img src={Sponsors} alt="Sponsors" className="w-full h-auto max-w-[800px] mx-auto rounded-lg" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Sponsor;
