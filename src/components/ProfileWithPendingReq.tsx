import { useState } from "react";
import ProfileSection from "./Profile";
import AcceptFriendRequests from "./PendingReq";
import { motion } from "framer-motion";
import { Heart, HeartPulse, LogOut } from "lucide-react"; // icons
import { auth } from "../firebaseconfig";
export default function ProfileWithPendingRequests() {

    const [showPending, setShowPending] = useState(false);
    const handleLogout = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not logged in");

            await auth.signOut();
            localStorage.clear();
            window.location.href = "/login"; // Redirect to login page
        } catch (err: any) {
            console.log("unable to logout")
        }
    };
    return (
        <div className="h-full relative z-10 container mx-auto flex flex-col md:flex-row gap-6">
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-5 left-0 right-0 z-50 flex justify-between items-center px-6">
                {/* Logout Button */}
                <button
                    onClick={() => setShowPending((prev) => !prev)}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-lg"
                >
                    {showPending ? (
                        <HeartPulse className="w-4 h-4 text-pink-400" />
                    ) : (
                        <Heart className="w-4 h-4 text-gray-300" />
                    )}
                </button>
                <button
                    onClick={() => handleLogout()} // hook up your logout logic here
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-lg"
                >
                    <LogOut className="w-6 h-6 text-red-400" />
                </button>

                {/* Heart Toggle */}

            </div>

            {/* Profile Section */}
            <motion.div
                className={`w-full md:w-2/3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg
                ${showPending ? "hidden md:block" : "block"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <ProfileSection />
            </motion.div>

            {/* Pending Requests Section */}
            <motion.div
                className={`w-full md:w-1/3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg
                ${showPending ? "block" : "hidden md:block"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <h2 className="text-xl mt-8 sm:mt-auto font-semibold text-white mb-4 text-center">
                    Pending Requests
                </h2>
                <div className="max-h-[70vh] w-full custom-scrollbar">
                    <AcceptFriendRequests />
                </div>
            </motion.div>
        </div >
    );
}
