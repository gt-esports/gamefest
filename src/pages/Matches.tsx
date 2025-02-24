import Footer from "../components/Footer";

function Matches() {
  return (
    <>
      <div className="w-full bg-streak bg-cover pt-36">
        <div className="flex items-center justify-center">
          <h1 className="justify-center font-bayon text-6xl text-white">MATCHES</h1>
        </div>
        <div className="twitch-container">
            <iframe
              src="https://player.twitch.tv/?channel=mooda&parent=localhost"
              allowFullScreen
              allow="autoplay *; encrypted-media *;"
            ></iframe>
        </div>
        <div className="pt-80">
          <Footer />
        </div>
      </div>
    </>
  );
}
export default Matches;
