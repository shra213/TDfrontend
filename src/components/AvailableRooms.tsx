import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../firebaseconfig";
import { Users, Lock, Globe, Info, LogIn, Clock, Gamepad } from "lucide-react";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

interface Room {
    id: string;
    roomName?: string;
    type: "public" | "private";
    createdAt: any;
    isStarted: string;
    invited: any[];
    admin?: string;
    createdBy?: string;
}

export default function AvailableRooms() {
    const bottlePng = "Beerbottle.png";
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const getRooms = async () => {
            if (!auth.currentUser) return;

            setLoading(true);
            try {
                const token = await auth.currentUser.getIdToken();
                const res = await fetch(`${apiUrl}/room/getRooms`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    console.error("Failed to fetch rooms:", res.status);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setRooms(data);
                console.log(data);
            } catch (err) {
                console.error("Error fetching rooms:", err);
            } finally {
                setLoading(false);
            }
        };

        getRooms();
    }, []);


    const filteredRooms = rooms.filter(room => {
        const term = searchTerm.toLowerCase();
        return (
            room.roomName?.toLowerCase().includes(term) ||
            room.admin?.toLowerCase().includes(term) ||
            room.createdBy?.toLowerCase().includes(term)
        );
    });


    const handleJoin = (id: string) => {
        navigate(`/game/${id}`);
    };

    return (
        <div className="pt-20 md:pt-30 md:px-5 min-h-screen relative overflow-hidden text-white">
            {/* Moving gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "400% 400%" }}
            />

            {/* Floating bottle background */}
            <motion.img
                src={bottlePng}
                alt="big bottle"
                className="absolute inset-0 w-full h-full object-contain opacity-10 scale-[1.3] blur-sm pointer-events-none"
                animate={{ x: [-50, 50, -50], y: [-30, 30, -30], rotate: [-3, 3, -3] }}
                transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => {
                    const size = Math.random() * 25 + 15;
                    const startX = Math.random() * 100;
                    const duration = Math.random() * 10 + 6;
                    const delay = Math.random() * 5;
                    return (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: size,
                                height: size,
                                left: `${startX}%`,
                                bottom: -40,
                                background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 60%, transparent 100%)`,
                                filter: `drop-shadow(0 0 8px rgba(255,255,255,0.9))`,
                            }}
                            animate={{
                                y: ["0%", "-120vh"],
                                x: [`${startX}%`, `${startX + (Math.random() * 10 - 5)}%`],
                                opacity: [0, 1, 0],
                            }}
                            transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
                        />
                    );
                })}
            </div>

            {/* Soft vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/70 mix-blend-multiply" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 py-8 md:py-10">
                <motion.h1
                    className="text-2xl md:text-6xl font-bold md:mb-10 mb-6  bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Available Rooms
                </motion.h1>

                {/* Loading */}
                {loading && (
                    <div className="text-center text-lg text-slate-300">Loading rooms...</div>
                )}

                {/* No rooms */}
                {!loading && rooms.length === 0 && (
                    <div className="mb-2 text-lg text-slate-300">
                        No rooms exist right now.
                    </div>
                )}

                <div className="mb-6 w-screen">
                    <input
                        type="text"
                        placeholder="Search by admin or room name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[90%] mr-2 md:w-1/2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                    />
                </div>


                {/* Rooms grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading &&
                        filteredRooms.map((room, idx) => (
                            <motion.div
                                key={room.id}
                                className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-pink-500/30 transition"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Room name & type */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="md:text-xl text-lg font-semibold">{room.roomName || `Room ${idx + 1}`}</h2>
                                    {room.type === "public" ? (
                                        <span title="Public Room">
                                            <Globe className="md:w-5 md:h-5 w-3 h-3 text-green-400" />
                                        </span>
                                    ) : (
                                        <span title="Private Room">
                                            <Lock className="md:w-5 md:h-5 w-3 h-3 text-red-400" />
                                        </span>
                                    )}
                                </div>


                                {/* Time */}
                                <div className="flex  items-center gap-2 text-slate-300 mb-2">
                                    <Clock className="md:w-4 md:h-4 w-2 h-2" />
                                    <span>
                                        Time: {room.createdAt?.toDate
                                            ? room.createdAt.toDate().toLocaleString()
                                            : new Date(room.createdAt._seconds * 1000).toLocaleString()}
                                    </span>
                                </div>

                                {/* Game Status */}
                                <div className="flex items-center gap-2 text-slate-300 mb-2">
                                    <Gamepad className="md:w-4 md:h-4 w-2 h-2" />
                                    <span className={`${room.isStarted === "started" ? "text-green-400" : "text-yellow-300"} font-medium`}>
                                        {room.isStarted === "started" ? "Game Started" : "Waiting to Start"}
                                    </span>
                                </div>

                                {/* Players info */}
                                <div className="flex items-center gap-2 text-slate-300 mb-2">
                                    <Users className="md:w-4 md:h-4 w-2 h-2" />
                                    <span>{room.invited.length} players invited</span>
                                </div>

                                {/* Admin */}
                                <div className="flex items-center gap-2 text-slate-300 mb-4">
                                    <Info className="md:w-4 md:h-4 w-2 h-2" />
                                    <span>Admin: {room.admin || room.createdBy}</span>
                                </div>

                                {/* Join Button */}
                                <button
                                    onClick={() => handleJoin(room.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 transition"
                                >
                                    <LogIn className="md:w-4 md:h-4 w-2 h-2" />
                                    Join Room
                                </button>
                            </motion.div>
                        ))}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400/60">
                Made with ❤️ — Truth & Dare
            </div>
        </div>
    );
}
