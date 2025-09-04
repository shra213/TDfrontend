import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, Send, ArrowLeft } from "lucide-react";
import {
    doc,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    increment
} from "firebase/firestore";
import { db, auth } from "../firebaseconfig";

interface Message {
    id: string;
    senderId: string;
    type: "text" | "image" | "video" | "doc";
    text: string;
    mediaUrl: string;
    sentAt: any;
}

export default function ChatCard({ friend, onBack }: any) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const currentUser = auth.currentUser;

    // ✅ unique chatId (same for both users)
    const chatId =
        currentUser && friend?.id
            ? [currentUser.uid, friend.id].sort().join("_")
            : null;

    // 🔹 Fetch real-time messages
    useEffect(() => {
        if (!chatId) return;

        const q = query(
            collection(db, "friends", chatId, "messages"),
            orderBy("sentAt", "asc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Message, "id">),
            }));
            setMessages(msgs);
            console.log(msgs, "hi");
        });

        return () => unsub();
    }, [chatId]);

    // 🔹 Send new message
    const handleSend = async () => {
        if (!newMessage.trim() || !chatId || !currentUser) return;

        try {
            await addDoc(collection(db, "friends", chatId, "messages"), {
                senderId: currentUser.uid,
                type: "text",
                text: newMessage,
                mediaUrl: null,
                sentAt: serverTimestamp(),
            });

            const friendRef = doc(db, "friends", chatId);

            await updateDoc(friendRef, {
                [`unreadMap.${friend.id}`]: increment(1),
                lastMsg: newMessage,
                lastMsgTime: serverTimestamp(),
            });
            const userDocRef = doc(db, "users", friend.id);
            await updateDoc(userDocRef, {
                totalUnread: increment(1),
            });
            setNewMessage(""); // clear input
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-black/40 backdrop-blur-md shadow-2xl flex flex-col h-[80vh]"
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/20">
                {/* 🔙 Back button (only shown on mobile) */}
                <button
                    onClick={onBack}
                    className="block md:hidden p-2 hover:text-pink-400 transition"
                >
                    <ArrowLeft size={22} />
                </button>

                {friend.mediaUrl ? (
                    <img
                        src={`${friend.mediaUrl}`}
                        className="w-12 h-12 rounded-full border border-pink-500/30 object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 flex justify-center items-center font-bold text-xl rounded-full border border-pink-500/30">
                        {friend.name[0]}
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-semibold text-white">{friend?.name}</h3>
                    <p className="text-sm text-slate-400">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUser?.uid
                            ? "justify-end"
                            : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.senderId === currentUser?.uid
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none"
                                : "bg-white/10 text-slate-200 rounded-bl-none"
                                }`}
                        >
                            {msg.type === "text" && <p>{msg.text}</p>}
                            {msg.type === "image" && (
                                <img src={msg.mediaUrl} alt="sent" className="rounded-md" />
                            )}
                            {msg.type === "video" && (
                                <video controls className="rounded-md">
                                    <source src={msg.mediaUrl} />
                                </video>
                            )}
                            {msg.type === "doc" && (
                                <a
                                    href={msg.mediaUrl}
                                    className="underline text-blue-400"
                                    target="_blank"
                                >
                                    📄 Document
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-4 border-t border-white/20">
                <button className="p-2 hover:text-pink-400 transition">
                    <Paperclip size={20} />
                </button>

                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-sm bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-sm shadow-sm"
                >
                    <Send size={20} />
                </motion.button>
            </div>
        </motion.div>
    );
}
