import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import Team from "../components/Team";

function Teams() {
  return (
    <div className="flex w-full bg-streak flex-col bg-cover">
      <div className="w-full text-white text-center pt-20">
        <h1 className="font-bayon tracking-wider text-white mb-20 text-3xl">
        SCHOOLS AND TEAMS
        </h1>
        <SearchBar />
        <Team />
        <Footer />
      </div>
    </div>
  );
}
export default Teams;
