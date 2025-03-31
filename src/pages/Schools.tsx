import Footer from "../components/Footer";
import School from "../components/School";

function Teams() {
  return (
    <div className="flex w-full bg-streak flex-col bg-cover">
      <div className="w-full text-white text-center pt-36">
        <h1 className="justify-center font-bayon text-6xl pb-4">SCHOOLS</h1>
        <School />
      </div>
      <Footer />
    </div>
  );
}
export default Teams;
