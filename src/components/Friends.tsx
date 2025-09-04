import { useState } from "react";
import { useFriendsStore } from "../stores/friendsStore";
import { db, auth } from "../firebaseconfig";
import {
    updateDoc,
    doc,
} from "firebase/firestore";
import UserList from "./Userlist";
import ChatCard from "./ChatPage";

export default function FriendsList() {
    const friends = useFriendsStore((state) => state.friends);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const currentUser = auth.currentUser;

    // 🔹 Sort friends by last message time
    const sortedFriends = [...friends].sort((a: any, b: any) => {
        if (!a.lastMsgTime && !b.lastMsgTime) return 0;
        if (!a.lastMsgTime) return 1;
        if (!b.lastMsgTime) return -1;
        return b.lastMsgTime.toMillis() - a.lastMsgTime.toMillis();
    });

    // 🔹 Open chat and reset unread count
    const handleOpenChat = async (friend: any) => {
        setSelectedFriend(friend);

        if (!currentUser) return;

        const chatId = [currentUser.uid, friend.id].sort().join("_");

        try {
            // 1️⃣ Mark all messages from this friend as read
            // 2️⃣ Reset unread count in Firestore for this user
            const chatDocRef = doc(db, "friends", chatId);
            await updateDoc(chatDocRef, {
                [`unreadMap.${currentUser.uid}`]: 0,
            });
        } catch (err) {
            console.error("Failed to reset unread count:", err);
        }
    };

    return (
        <div className="max-w-sm sm:w-full flex gap-5 h-full">
            {/* Friends List */}
            <div className={`w-full ${selectedFriend ? "hidden md:block" : "block"}`}>
                <UserList
                    heading="Your Friends"
                    users={sortedFriends}
                    friends={true}
                    onClickUser={(user) => handleOpenChat(user)}
                />
            </div>

            {/* Chat Area */}
            <div className={`flex-1 ${selectedFriend ? "block" : "hidden md:block"}`}>
                {selectedFriend && (
                    <ChatCard
                        friend={selectedFriend}
                        onBack={() => setSelectedFriend(null)}
                    />
                )}
            </div>
        </div>
    );
}
