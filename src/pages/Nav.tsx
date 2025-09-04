import { useMemo } from "react";
import Friends from "../components/Friends";
import { useLocation } from "react-router-dom";
import Groups from "../components/Groups";
import AddFrnds from "../components/AddFrnds";
import PendingReq from "../components/PendingReq";
import { motion } from "framer-motion";
import ProfileSection from "../components/ProfileWithPendingReq";
import InviteToRoomPage from "../components/CreateRoomInvitation";

export default function Nav() {
    const location = useLocation();
    const path = location.pathname;

    const bubbles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => {
            const size = Math.random() * 30 + 20;
            const startX = Math.random() * 100;
            const duration = Math.random() * 12 + 8;
            const delay = Math.random() * 5;
            return { id: i, size, startX, duration, delay };
        });
    }, []);

    return (
        <>
            <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-white">
                {/* Animated gradient background */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: "400% 400%" }}
                />

                {/* Floating bubbles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {bubbles.map(({ id, size, startX, duration, delay }) => (
                        <motion.span
                            key={id}
                            className="absolute rounded-full"
                            style={{
                                width: size,
                                height: size,
                                left: `${startX}%`,
                                bottom: -50,
                                background: `radial-gradient(circle, rgba(255,0,255,0.95) 0%, rgba(255,0,255,0.4) 60%, transparent 100%)`,
                                filter: `drop-shadow(0 0 12px rgba(255,0,255,0.8))`,
                            }}
                            animate={{ y: ["0%", "-120vh"], opacity: [0, 0.8, 0] }}
                            transition={{
                                duration,
                                repeat: Infinity,
                                delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* Content wrapper */}
                <div className="pt flex justify-center w-full">
                    <div
                        className={`absolute top-20 md:top-30 min-h-[70vh] ${"md:min-w-[80%]"
                            } bg-gradient-to-br from-pink-600/30 via-black/50 to-purple-800/30 backdrop-blur-xl rounded-2xl md:border border-pink-500 p-3 md:p-8 md:shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] transition-all duration-300 text-sm`}
                    >
                        {path === "/friends" ? (
                            <Friends />
                        ) : path === "/groups" ? (
                            <Groups />
                        ) : path === "/addFrnds" ? (
                            <AddFrnds />
                        ) : path === "/pending-requests" ? (
                            <PendingReq />
                        ) : path === "/profile" ? (
                            <ProfileSection />
                        ) : path === "/create-room" ? (
                            <InviteToRoomPage />
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
