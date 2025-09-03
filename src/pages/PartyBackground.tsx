import { Link } from "react-router-dom";
import { PlusCircle, LogIn } from "lucide-react"; // icons for create/join
const beerBottleUrl = "bottle.png";

const profiles = [
  { url: "https://randomuser.me/api/portraits/men/32.jpg", top: 15, left: 12 },
  { url: "https://randomuser.me/api/portraits/women/19.jpg", top: 18, left: 80 },
  { url: "https://randomuser.me/api/portraits/women/44.jpg", top: 65, left: 5 },
  { url: "https://randomuser.me/api/portraits/men/12.jpg", top: 50, left: 90 },
  { url: "https://randomuser.me/api/portraits/women/26.jpg", top: 85, left: 30 },
  { url: "https://randomuser.me/api/portraits/men/65.jpg", top: 85, left: 70 },
];

export default function PartyBackground() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900 p-4">
      {/* Truth & Dare Heading */}
      <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 text-center z-20 px-2 max-w-[90vw]">
        <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-gray-300 drop-shadow-md">
          TRUTH &amp; DARE
        </h1>
        <p className="mt-6 sm:mt-10 text-xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_0_25px_rgba(255,165,0,0.9)]">
          India’s first online platform
        </p>

        {/* Navbar (Buttons Row) */}
        <div className="flex justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
          {/* Create Room Icon */}
          <Link to={"/create-room"}>
            <button className="flex flex-col sm:flex-row items-center gap-2 p-3 sm:p-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline font-semibold">Create Game</span>
            </button>
          </Link>

          {/* Join Room Icon */}
          <Link to={"/rooms"}>
            <button className="flex flex-col sm:flex-row items-center gap-2 p-3 sm:p-4 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-green-400 text-white shadow-lg hover:scale-110 transition">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline font-semibold">Join Game</span>
            </button>
          </Link>
        </div>

      </div>

      {/* Big Beer Bottle in Background */}
      <img
        src={beerBottleUrl}
        alt="Beer Bottle"
        className="absolute opacity-20 animate-drift z-0"
        style={{
          width: "60%",
          left: "20%",
          top: "10%",
        }}
      />

      {/* Floating Profiles (hidden on small screens) */}
      <div className="hidden sm:block">
        {profiles.map((profile, index) => (
          <img
            key={index}
            src={profile.url}
            alt={`Profile ${index + 1}`}
            className="absolute rounded-full border-4 border-pink-500 shadow-[0_0_15px_rgba(255,0,255,0.8)] animate-float z-10
              w-10 h-10 sm:w-14 sm:h-14"
            style={{
              top: `${profile.top}%`,
              left: `${profile.left}%`,
              animationDelay: `${index * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(40px, 30px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-drift { animation: drift 12s ease-in-out infinite; }

        @media (max-width: 480px) {
          h1 { font-size: 1.5rem !important; }
          p { font-size: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}
