import React, { useState, useEffect, Suspense, useCallback } from "react";
import { motion } from "framer-motion";
import { LogOut, Info, X, Send, Shuffle } from "lucide-react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { doc, onSnapshot, collection, updateDoc, addDoc, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import truths from "./truths";
import dares from "./dares";
import {
    handleUnremovePlayer,
    handleRemovePlayer,
    handleStartGame,
    handleSubmitQuestion,
    handleEndGame,
    handleExitGame,
    shuffleArray,
    getCapitalizedFirstName,
    // addRoomNotification
} from "./RoomHandler";
const RoomChat = React.lazy(() => import('./RoomChat'))
const Spinner = React.lazy(() => import('./TruthDareWheel'));
const TruthDare = React.lazy(() => import('./TruthDare'));


const apiUrl = import.meta.env.VITE_API_URL;
export default function GamePage() {
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);

    const [showSidebar, setShowSidebar] = useState(false);
    const { roomId } = useParams<{ roomId: string }>();

    const [roomData, setRoomData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    const [notification, setNotification] = useState<string | null>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState(false);

    const [question, setQuestion] = useState("");

    const currentUid = auth.currentUser?.uid;
    const currentAsker = roomData?.asker || "";
    const currentAnswerer = roomData?.answerer || "";
    // inside GamePage component

    // 🔹 Track typing status
    const [typingStatus, setTypingStatus] = useState<{ askerTyping: boolean; answererTyping: boolean }>({
        askerTyping: false,
        answererTyping: false,
    });

    const shufflePlayers = useCallback(() => {
        return shuffleArray(players);
    }, [players])
    // import { useEffect, useCallback } from "react";

    // 🔹 Online Status
    const setOnlineStatus = useCallback(async (status: boolean) => {
        if (!roomId || !auth.currentUser) return;
        const playerRef = doc(db, "rooms", roomId, "players", auth.currentUser.uid);
        await updateDoc(playerRef, {
            isOnline: status,
            lastActive: new Date(),
        });
    }, [roomId]);

    useEffect(() => {
        if (!roomId || !auth.currentUser) return;

        // Set online on mount
        setOnlineStatus(true);

        // Visibility change handler
        const handleVisibilityChange = () => setOnlineStatus(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Before unload handler
        const handleBeforeUnload = () => setOnlineStatus(false);
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Heartbeat interval
        const interval = setInterval(() => setOnlineStatus(true), 20000);

        return () => {
            setOnlineStatus(false);
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [roomId, setOnlineStatus]);

    // 🔹 Notifications
    useEffect(() => {
        if (!roomId) return;
        const notifRef = collection(db, "rooms", roomId, "notifications");
        const q = query(notifRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const latestNotif = snapshot.docs[0].data() as { message: string };
                setNotification(latestNotif.message);
                setTimeout(() => setNotification(null), 2000);
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    // 🔹 Typing updates
    const updateTyping = useCallback(async (field: "askerTyping" | "answererTyping", value: boolean) => {
        if (!roomId) return;
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
            typingStatus: {
                ...typingStatus,
                [field]: value,
            },
        });
    }, [roomId, typingStatus]);


    const addRoomNotification = useCallback(async (message: string, type?: string) => {
        if (!roomId) return;
        try {
            const notifRef = collection(db, "rooms", roomId, "notifications");
            await addDoc(notifRef, { message, createdAt: new Date(), type: type || "general" });
        } catch (err) {
            console.error("Failed to add notification:", err);
        }
    }, [roomId]);


    useEffect(() => {
        if (!roomId) return;
        const roomRef = doc(db, "rooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (snap) => {
            const data = snap.data();
            if (data?.typingStatus) setTypingStatus(data.typingStatus);
        });
        return () => unsubscribe();
    }, [roomId]);

    // 🔹 Real-time Room Listen
    useEffect(() => {
        if (!roomId) return;
        const roomRef = doc(db, "rooms", roomId);

        const unsubscribe = onSnapshot(roomRef, async (docSnap) => {
            if (!docSnap.exists()) {
                setHasAccess(false);
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            if (data.endedAt) {
                alert("game is ended");
                navigate("/front");
            }

            const userId = auth.currentUser?.uid;
            if (!userId) {
                setHasAccess(false);
                setLoading(false);
                return;
            }

            if (data.type === "private") {
                const isInvitedOrCreator = data.invited?.includes(userId) || data.createdBy === userId;
                setHasAccess(isInvitedOrCreator);
                if (!isInvitedOrCreator) {
                    setLoading(false);
                    return;
                }
            } else {
                setHasAccess(true);
            }

            const removedUsers = data.removedUsers || [];
            if (removedUsers.some((u: any) => u.id === userId)) {
                alert("You have been removed from this room by the admin.");
                navigate("/front");
                return;
            }

            if (!players.some(player => player.id === userId)) {
                try {
                    const token = await auth.currentUser?.getIdToken();
                    const res = await fetch(`${apiUrl}/room/joinGame`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `bearer ${token}`,
                        },
                        body: JSON.stringify({ id: roomId }),
                    });

                    if (!res.ok) throw new Error(`Failed to join game: ${res.statusText}`);
                    // const data = await res.json();
                    await addRoomNotification(`${auth.currentUser?.displayName || "A player"} joined the room`, "join");
                } catch (error) {
                    console.error("Error joining game:", error);
                }
            }

            setRoomData({ id: docSnap.id, ...data });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId, players, navigate, addRoomNotification]);

    // 🔹 Players Listen
    useEffect(() => {
        if (!roomId) return;
        const playersRef = collection(db, "rooms", roomId, "players");
        const unsubscribe = onSnapshot(playersRef, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPlayers(list);
        });
        return () => unsubscribe();
    }, [roomId]);

    // 🔹 Unremove Player
    const onUnremovePlayer = useCallback((playerId: string) => {
        if (!currentUid) {
            return;
        }
        handleUnremovePlayer(roomId!, roomData, playerId, addRoomNotification);
    }, [roomId, roomData, addRoomNotification]);

    // 🔹 Remove Player
    const onRemovePlayer = useCallback((player: any) => {
        handleRemovePlayer(roomId!, roomData, player);
    }, [roomId, roomData]);

    // 🔹 Start Game
    const onStartGame = useCallback(() => {
        handleStartGame(roomId!, addRoomNotification);
    }, [roomId, addRoomNotification]);

    // 🔹 Submit Question
    const onSubmitQuestion = useCallback(() => {
        handleSubmitQuestion(roomId!, question);
    }, [roomId, question]);

    // 🔹 End Game
    const onEndGame = useCallback(() => {
        handleEndGame(apiUrl, roomId!, navigate,);
    }, [roomId, navigate, apiUrl, currentUid]);

    // 🔹 End Turn


    // 🔹 Exit Game
    const onExitGame = useCallback(() => {
        if (!currentUid) {
            return;
        }
        handleExitGame(roomId!, roomData, currentUid, addRoomNotification, navigate);
    }, [roomId, roomData, currentUid, navigate, addRoomNotification]);

    // 🔹 Choose Truth/Dare

    if (loading) return <p className="text-white">Loading...</p>;
    if (!hasAccess) return <Navigate to="/404" replace />;
    console.log(`${import.meta.env.API_BASE_URL}${localStorage.getItem("prf")}`, "url for prf");
    return (
        <div className="relative min-h-screen flex flex-col text-white overflow-hidden">
            {/* 🔮 Background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "400% 400%" }}
            />

            {/* 🔹 Navbar */}
            <div className="relative z-10">
                {/* Navbar */}
                <nav className="w-full max-w-[90vw] flex justify-between items-center p-3 border-b border-white/10 bg-black/40 backdrop-blur-md shadow-md rounded-xl mx-auto">
                    {/* Logo */}
                    <div
                        onClick={() => navigate("/front")}
                        className="font-bold text-xl tracking-wide cursor-pointer"
                        style={{ textShadow: "0 0 10px #ff00ff, 0 0 20px #ff00ff" }}
                    >
                        {/* Full text on medium screens and above */}
                        <span className="hidden md:inline">Truth & Dare</span>
                        {/* Short text on small screens */}
                        <span className="inline md:hidden">T&D</span>
                    </div>

                    {/* Right-side buttons */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Open Chat Button */}
                        {typeof setShowChat === "function" && (
                            <button
                                className="md:hidden flex items-center justify-center
                   w-7 h-7 rounded-full border border-pink-500
                   shadow-md bg-gradient-to-r from-blue-500 to-cyan-500
                   text-white text-lg hover:scale-105 transition-transform"
                                onClick={() => setShowChat(true)}
                            >
                                💬
                            </button>
                        )}


                        {/* Desktop Buttons */}
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={() => {
                                    onEndGame();
                                    setShowSidebar(false);
                                }}
                                className="flex items-center gap-3 px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-600 hover:text-white text-white"
                            >
                                End Game
                            </button>
                            <button
                                onClick={onExitGame}
                                className="flex items-center gap-3 px-4 py-2 border border-pink-500/30 rounded-lg hover:bg-white/10 transition text-white text-sm"
                            >
                                Exit
                            </button>
                            <button
                                onClick={() => setShowDetails(true)}
                                className="flex items-center gap-3 px-4 py-2 border border-pink-500/30 rounded-lg hover:bg-white/10 transition text-white text-sm"
                            >
                                Details
                            </button>
                        </div>

                        {/* Profile */}
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => setShowSidebar(true)}
                        >
                            <img
                                src={`${localStorage.getItem("prf")}`}
                                alt="Profile"
                                className="w-7 h-7 md:w-10 md:h-10 rounded-full border border-pink-500 shadow-md"
                            />
                        </div>
                    </div>
                </nav>

            </div >

            {/* 🔹 Sidebar Overlay */}
            {
                showSidebar && (
                    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex justify-end">
                        <div className="w-64 bg-black/95 p-6 flex flex-col gap-4 shadow-xl">
                            {/* Close Button */}
                            <button
                                className="self-end text-white text-xl font-bold"
                                onClick={() => setShowSidebar(false)}
                            >
                                ×
                            </button>

                            {/* Profile */}
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => {
                                    navigate("/profile");
                                    setShowSidebar(false);
                                }}
                            >
                                <img
                                    src={`${localStorage.getItem("prf")}`}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border border-pink-500 shadow-md"
                                />
                                <span className="text-white font-semibold">
                                    {getCapitalizedFirstName()}
                                </span>
                            </div>

                            {/* Buttons */}
                            <button
                                onClick={() => {
                                    onExitGame();
                                    setShowSidebar(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 border border-pink-500/30 rounded-lg hover:bg-white/10 text-white"
                            >
                                <LogOut size={16} /> Exit Game
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetails(true);
                                    setShowSidebar(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 border border-pink-500/30 rounded-lg hover:bg-white/10 text-white"
                            >
                                <Info size={16} /> Game Details
                            </button>
                            <button
                                onClick={() => {
                                    onEndGame();
                                    setShowSidebar(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 border border-red-500/30 rounded-lg hover:bg-red-600 hover:text-white text-white"
                            >
                                End Game
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Notification */}
            {
                notification && (
                    <div className="flex justify-center">
                        <div className="bg-black/60 flex justify-center text-white px-4 py-2 rounded-xl shadow-md w-[85vw] text-center animate-slideDown">
                            {notification}
                        </div>
                    </div>

                )
            }



            {/* 🔹 Main Game + Chat */}
            <div className="relative z-10 flex flex-col md:flex-row flex-1">
                {/* Left Game Area */}
                <div className="w-full md:w-2/3 p-2 md:p-6 flex flex-col space-y-6">
                    {/* Player Info */}
                    <div className="md:mt-6 mt-1 bg-black/40 md:p-6 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-md w-full text-center">
                        <div className="flex flex-col justify-center items-center">
                            <div className="w-full">
                                <div className="flex flex-col">
                                    <div className="flex flex-col md:flex-row justify-start md:justify-between text-left text-sm md:text-lg font-semibold md:mb-10">
                                        <div className="mb-2 md:mb-0">
                                            🎤 Asker:{" "}
                                            <span className="text-pink-400">
                                                {currentUid === currentAsker.id ? "You" : currentAsker.name || "—"}
                                            </span>
                                        </div>
                                        <div>
                                            🎯 Answerer:{" "}
                                            <span className="text-cyan-400">
                                                {currentUid === currentAnswerer.id ? "You" : currentAnswerer.name || "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>






                            {roomData?.gameStatus === "waiting" && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                    <Spinner players={players} cnt={players.length} started={roomData.isStarted} />
                                    {players.length >= 2 ? (
                                        <div className="text-center">
                                            <p className="text-sm md:text-lg text-green-400 font-medium mb-2 md:mb-3">
                                                ✅ Enough players! You can start the game.
                                            </p>
                                            <button
                                                onClick={onStartGame}
                                                className="md:text-sm px-4 py-1 md:px-6 md:py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg font-semibold hover:scale-105 transition-transform duration-200"
                                            >
                                                Start Game
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-yellow-400 text-sm md:text-lg font-medium animate-pulse">
                                            ⏳ Waiting for more players to join...
                                        </p>
                                    )}
                                </div>
                            )}

                        </div>

                        {roomData?.gameStatus === "spinning" && (() => {
                            // Make a copy and shuffle in-place
                            const shuffledPlayers = shufflePlayers();
                            return (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    {/* Spinner Section */}
                                    <div className="flex items-center justify-center ">
                                        <Spinner players={shuffledPlayers} cnt={shuffledPlayers.length} started={roomData.isStarted} />
                                    </div>

                                    {/* Status Message */}
                                    <p className="mt-5 text-sm md:text-lg md:font-semibold text-white bg-black/30 px-4 py-2 rounded-xl shadow-md backdrop-blur-sm">
                                        {roomData.lastAnswerer.id === auth.currentUser?.uid
                                            ? "🎯 You have to spin the bottle!"
                                            : `🎯 ${roomData.lastAnswerer.name || 'anyone'} has to spin the bottle!`}
                                    </p>
                                </div>
                            );
                        })()}

                        {roomData?.gameStatus === "asking" && (
                            <div className="mt-6 w-full flex flex-col items-center">
                                {/* Mode Display */}


                                {currentUid === currentAsker.id ? (
                                    <>
                                        {/* Input Label */}
                                        <p className="mb-4 text-xl md:text-3xl md:mb-10 font-bold tracking-wide text-center">
                                            🎭 Mode:{" "}
                                            <span className="uppercase font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_8px_rgba(0,224,255,0.4)]">
                                                {roomData.choice}
                                            </span>
                                        </p>

                                        <div className="mb-3 text-base font-medium text-white/80">
                                            ✍️ Enter your{" "}
                                            <span className="capitalize font-semibold text-cyan-300">
                                                {roomData.choice}
                                            </span>
                                            :
                                        </div>

                                        {/* Input Field */}
                                        <div className="relative w-full max-w-2xl flex gap-3">
                                            {/* Input Wrapper */}
                                            <div className="relative flex-1">
                                                <input
                                                    className="border border-white/10 bg-white/5 rounded-xl p-3 pr-12 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition shadow-[0_0_15px_rgba(0,224,255,0.2)]"
                                                    value={question}
                                                    onChange={(e) => {
                                                        setQuestion(e.target.value);
                                                        updateTyping("askerTyping", e.target.value.length > 0);
                                                    }}
                                                    placeholder={`Type your ${roomData.choice}...`}
                                                    onBlur={() => updateTyping("askerTyping", false)}
                                                />

                                                {/* Inline Submit Button */}
                                                <button
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-md hover:scale-110 hover:shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-transform duration-300"
                                                    onClick={onSubmitQuestion}
                                                >
                                                    <Send className="w-4 h-4 text-white" />
                                                </button>
                                            </div>

                                            {/* Random Question Button */}
                                            <button
                                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-transform duration-300 whitespace-nowrap"
                                                onClick={async () => {
                                                    if (!roomId) {
                                                        return;
                                                    }
                                                    const questionPool = roomData.choice === "truth" ? truths : dares;
                                                    const randomQ = questionPool[Math.floor(Math.random() * questionPool.length)];
                                                    const roomRef = doc(db, "rooms", roomId); // use doc, not collection
                                                    await updateDoc(roomRef, {
                                                        question: randomQ,
                                                        gameStatus: "answering",
                                                    });
                                                }}

                                            >
                                                <Shuffle className="w-4 h-4 text-white" />
                                                Random
                                            </button>
                                        </div>

                                    </>
                                ) : (
                                    <div className="">
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <TruthDare Asker={roomData.asker} dbmode={roomData.choice} gameStatus={roomData.gameStatus} />
                                        </Suspense>
                                    </div>
                                )}
                            </div>

                        )}


                        {(roomData?.gameStatus === "choosing" || roomData?.gameStatus === "answerPending" || roomData?.gameStatus === "answering" || roomData?.gameStatus === "idle") && (
                            <div>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <TruthDare Asker={roomData.asker} answerer={roomData.answerer} fixAnswer={roomData.answer} media={roomData.media} question={roomData.question} dbmode={roomData.choice} roomId={roomId} click={roomData.clicked} gameStatus={roomData.gameStatus} />
                                </Suspense>
                            </div>
                        )}
                    </div>
                </div>


                {/* Right Chat */}


                {/* Right Chat - Desktop layout */}
                {/* Desktop */}
                <div className="hidden md:flex justify-center items-center w-1/3 p-4">
                    <Suspense fallback={<div>Loading...</div>}>
                        <RoomChat roomId={roomId} onBack={() => console.log("")} />
                    </Suspense>
                </div>


                {/* Mobile Chat Overlay */}
                {showChat && (
                    <div className="fixed inset-0 z-[120] bg-black/90 p-2">
                        <div className="flex-1 custom-scrollbar">
                            <Suspense fallback={<div>Loading...</div>}>
                                <RoomChat roomId={roomId} onBack={() => setShowChat(false)} />
                            </Suspense>
                        </div>
                    </div>
                )}
            </div>


            {/* 🔹 Room Details Modal */}
            {
                showDetails && roomData && (
                    <div className="flex flex-col sm:flex-row justify-between text-lg font-semibold mb-6 text-center gap-3 sm:gap-0">

                        <div className="bg-white text-black p-6 rounded-2xl w-[400px] shadow-lg relative">
                            <button
                                className="absolute top-2 right-2 text-gray-600 hover:text-black"
                                onClick={() => setShowDetails(false)}
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold mb-4">Room Details</h2>
                            <p>
                                <span className="font-semibold">Room Name:</span> {roomData.roomName}
                            </p>
                            <p>
                                <span className="font-semibold">Created By:</span> {roomData.admin || roomData.createdBy}
                            </p>
                            <p>
                                <span className="font-semibold">Created At:</span>{" "}
                                {roomData.createdAt?.toDate
                                    ? roomData.createdAt.toDate().toLocaleString()
                                    : "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold">Started:</span> {roomData.isStarted ? "Yes" : "No"}
                            </p>
                            <p>
                                <span className="font-semibold">Room Type:</span>{" "}
                                {roomData.type === "public" ? "Public" : "Private"}
                            </p>
                            <p>
                                <span className="font-semibold">Invited Players:</span> {roomData.invited?.length || 0}
                            </p>

                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Players ({players.length})</h3>
                                <ul className="list-disc list-inside">
                                    {players.map((p) => (
                                        <li key={p.id} className="flex justify-between items-center mb-2">
                                            <span className="flex items-center gap-2">
                                                <span>{p.name}</span>
                                                <span
                                                    className={`w-3 h-3 rounded-full ${p.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                                                    title={p.isOnline ? "Online" : "Offline"}
                                                />
                                            </span>
                                            <button
                                                onClick={() => onRemovePlayer(p)}
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {roomData.createdBy === auth.currentUser?.uid && roomData?.removedUsers?.map((player: any) => (
                                    <div key={player.id} className="flex justify-between items-center p-2">
                                        <span>{player.name || player.id}</span>
                                        <button
                                            className="bg-green-500 text-white px-2 py-1 rounded"
                                            onClick={() => onUnremovePlayer(player.id)}
                                        >
                                            Allow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {showDetails && roomData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-transparent bg-white text-black p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                            onClick={() => setShowDetails(false)}
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-center">Room Details</h2>

                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Room Name:</span> {roomData.roomName}
                            </p>
                            <p>
                                <span className="font-semibold">Created By:</span> {roomData.admin || roomData.createdBy}
                            </p>
                            <p>
                                <span className="font-semibold">Created At:</span>{" "}
                                {roomData.createdAt?.toDate
                                    ? roomData.createdAt.toDate().toLocaleString()
                                    : "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold">Started:</span> {roomData.isStarted ? "Yes" : "No"}
                            </p>
                            <p>
                                <span className="font-semibold">Room Type:</span>{" "}
                                {roomData.type === "public" ? "Public" : "Private"}
                            </p>
                            <p>
                                <span className="font-semibold">Invited Players:</span> {roomData.invited?.length || 0}
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Players ({players.length})</h3>
                            <ul className="list-disc list-inside">
                                {players.map((p) => (
                                    <li key={p.id} className="flex justify-between items-center mb-2">
                                        <span className="flex items-center gap-2">
                                            <span>{p.name}</span>
                                            <span
                                                className={`w-3 h-3 rounded-full ${p.isOnline ? "bg-green-500" : "bg-gray-600"}`}
                                                title={p.isOnline ? "Online" : "Offline"}
                                            />
                                        </span>
                                        <button
                                            onClick={() => onRemovePlayer(p)}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {roomData.createdBy === auth.currentUser?.uid && roomData?.removedUsers?.map((player: any) => (
                                <div key={player.id} className="flex justify-between items-center p-2 mt-2 bg-gray-800 rounded">
                                    <span>{player.name || player.id}</span>
                                    <button
                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                        onClick={() => onUnremovePlayer(player.id)}
                                    >
                                        Allow
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


        </div >
    );
}


