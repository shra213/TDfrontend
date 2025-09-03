import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
// import { onSnapshot, collection, query } from "firebase/firestore";
// import { db, auth } from "../firebaseconfig";
// import { Bell } from "lucide-react";

// interface Notification {
//     id: string;
//     read: boolean;
//     [key: string]: any;
// }

export default function Navbar() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const [notifications, setNotifications] = useState<Notification[]>([]);

    const navItems = [
        { name: "Home", path: "/front" },
        { name: "Friends", path: "/friends" },
        { name: "Add Friends", path: "/addFrnds" },
        // { name: "Pending Requests", path: "/pending-requests" },
        { name: "Create Room", path: "/create-room" },
        { name: "Join Room", path: "/rooms" }
    ];

    // Update active tab on route change
    useEffect(() => {
        setActiveTab(location.pathname);
        setSidebarOpen(false); // close sidebar on navigation
    }, [location]);

    // const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <>
            {/* Navbar */}
            <div className="bg-[#0f0f0f] text-white fixed top-5 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl bg-black/70 backdrop-blur-lg border border-pink-500 rounded-full px-4 sm:px-6 py-2 flex items-center justify-between z-50 shadow-lg">
                {/* Hamburger Icon (Mobile) */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="sm:hidden text-pink-500 focus:outline-none"
                    aria-label="Open menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="sm:h-8 sm:w-8 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo (Hidden in Mobile) */}
                <Link to="/front" className="flex-shrink-0 hidden sm:flex items-center gap-2">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="sm:w-10 sm:h-10 h-5 w-5 rounded-full border-2 border-pink-500 bg-cover"
                    />
                </Link>

                {/* Navigation Links (Desktop) */}
                <div className="hidden sm:flex items-center space-x-2 bg-black/40 rounded-full p-1 min-w-max">
                    {navItems.map((item: any) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 sm:px-7 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === item.path
                                    ? "bg-pink-500 text-white shadow-md"
                                    : "text-pink-400 hover:bg-pink-500/20"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Notification & Profile Icons */}
                <div className="flex items-center gap-4 ml-3">

                    {/* Profile Image */}
                    <Link to="/profile">
                        <img
                            src={`${localStorage.getItem("prf")}` || ''}
                            alt="Profile"
                            className="sm:w-10 sm:h-10 h-6 w-6 rounded-full border-2 border-pink-500 shadow-sm"
                        />
                    </Link>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#111111] text-white z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Close Button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-4 text-pink-500 focus:outline-none"
                    aria-label="Close menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Sidebar Navigation */}
                <nav className="flex flex-col space-y-3 mt-4 px-6">
                    {navItems.map((item: any) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200
                ${activeTab === item.path
                                    ? "bg-pink-600 text-white"
                                    : "text-pink-400 hover:bg-pink-500/30"
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
