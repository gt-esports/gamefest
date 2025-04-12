import Footer from "../components/Footer";
import Info from "../components/Info";

export default function Information() {
    return (
        <div className="flex w-full bg-streak flex-col bg-cover">
        <div className="w-full text-white text-center pt-36">
          <h1 className="justify-center font-bayon text-6xl pb-4">INFORMATION</h1>
        </div>
        <div className="flex w-[95%] items-center justify-center pt-4">
          <Info />
        </div>
        <Footer />
      </div>
    );
}
