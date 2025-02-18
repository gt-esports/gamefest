import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import Team from "../components/Team";

function Teams() {
  return (
    <div className="flex w-screen bg-streak flex-col bg-cover">
      <div className="h-screen w-full pt-20 text-white text-center">
        <h1 className="font-bayon tracking-wide text-white mb-20 text-3xl">
        SCHOOLS AND TEAMS
        </h1>
        <SearchBar />
        <Team />
      </div>
      <Footer />
    </div>
  );
}
export default Teams;
