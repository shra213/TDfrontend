import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip, Send, ArrowLeft } from "lucide-react";
import {
    getDoc,
    doc,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseconfig";

interface RoomMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    type: "text" | "image" | "video" | "doc";
    mediaUrl?: string;
    sentAt: any;
}

export default function RoomChat({ roomId, onBack }: { roomId: any, onBack?: () => void }) {
    const [messages, setMessages] = useState<RoomMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUser = auth.currentUser;

    // Scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch room messages in real-time
    useEffect(() => {
        if (!roomId) return;
        const q = query(collection(db, "rooms", roomId, "messages"), orderBy("sentAt", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const msgs: RoomMessage[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<RoomMessage, "id">),
            }));
            setMessages(msgs);
        });
        return () => unsub();
    }, [roomId]);

    // Send message
    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser) return;
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const senderName = userDoc.exists() ? userDoc.data().name : "Anonymous";

        await addDoc(collection(db, "rooms", roomId, "messages"), {
            senderId: currentUser.uid,
            senderName,
            text: newMessage,
            type: "text",
            sentAt: serverTimestamp(),
        });
        setNewMessage("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-sm md:max-w-2xl h-[90vh] md:h-[80vh] mx-auto flex flex-col rounded-3xl bg-black/50 backdrop-blur-md shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/20 bg-black/60">
                {onBack && (
                    <button onClick={onBack} className="block md:hidden p-2 hover:text-pink-400 transition">
                        <ArrowLeft size={22} />
                    </button>
                )}
                <h3 className="text-white font-semibold text-lg md:text-xl">Room Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-pink-600/50 scrollbar-track-transparent">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    const time = msg.sentAt?.toDate
                        ? msg.sentAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "";
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && <p className="text-xs text-white/70 font-semibold">{msg.senderName}</p>}
                            <div
                                className={`max-w-[80%] p-3 rounded-xl text-sm md:text-base break-words ${isMe
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none"
                                    : "bg-white/10 text-slate-200 rounded-bl-none"
                                    }`}
                            >
                                {msg.type === "text" && <p>{msg.text}</p>}
                            </div>
                            <span className="text-[10px] text-white/50 mt-1">{time}</span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef}></div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-3 border-t border-white/20 bg-black/60">
                <button className="p-1 hover:text-pink-400 transition">
                    <Paperclip size={20} />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="sm:w-full flex-1 px-2 py-1 rounded-sm bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-sm text-white"
                >
                    <Send size={20} />
                </motion.button>
            </div>
        </motion.div>
    );
}
