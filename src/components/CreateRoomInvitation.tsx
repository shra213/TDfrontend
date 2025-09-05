import { useState } from "react";
import { useFriendsStore } from "../stores/friendsStore";
import { auth } from "../firebaseconfig";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

export default function InviteToRoomPage() {
    const navigate = useNavigate();
    const friends = useFriendsStore((state) => state.friends);
    const [searchFriends, setSearchFriends] = useState("");
    const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const filteredFriends = friends.filter((f) =>
        f.name.toLowerCase().includes(searchFriends.toLowerCase())
    );

    function toggleFriend(id: string) {
        setSelectedFriendIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    }

    function openModal() {
        if (selectedFriendIds.size === 0) {
            alert("Please select at least one friend.");
            return;
        }
        setIsModalOpen(true);
    }

    async function handleCreateRoom() {
        if (!roomName.trim()) {
            alert("Please enter a room name.");
            return;
        }
        setIsCreating(true);

        const token = await auth.currentUser?.getIdToken();
        const selectedFriendsList = friends.filter((f) => selectedFriendIds.has(f.id));

        const payload = {
            room: roomName.trim(),
            type: isPublic ? "public" : "private",
            friends: selectedFriendsList.map((f) => f.id),
        };

        try {
            const res = await fetch(`${apiUrl}/room/createGame`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errMsg = await res.text();
                throw new Error(`Failed to create game. Status: ${res.status}. Details: ${errMsg}`);
            }

            const data = await res.json();
            alert(
                `Room Created: ${roomName.trim()} (${isPublic ? "Public" : "Private"})\n` +
                `Invited: ${selectedFriendsList.map((f) => f.name).join(", ")}\n` +
                `Link: ${data.link || "No link provided"}`
            );

            // Reset
            setRoomName("");
            setIsPublic(false);
            setSelectedFriendIds(new Set());
            setSearchFriends("");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error creating room:", error);
            alert("Something went wrong. Check console for details.");
        } finally {
            setIsCreating(false);
        }
    }
    console.log(filteredFriends, "filtered friends");
    return (
        <div className="max-w-[95%] mx-auto p-3 md:p-6 min-h-screen text-white rounded-lg shadow-lg">
            {/* Header with button side by side */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h1 className="text-xl sm:text-3xl font-bold text-center sm:text-left">
                    Create Room
                </h1>
                <button
                    onClick={openModal}
                    className="w-full sm:w-auto md:px-7 py-2 px-4 bg-gradient-to-r from-pink-600 to-pink-400 rounded-lg font-bold text-white hover:opacity-90 transition"
                >
                    Invite
                </button>
            </div>

            {/* Friends List */}
            <div className="border border-pink-500/50 rounded-lg p-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Friends</h2>
                <input
                    type="text"
                    placeholder="Search friends..."
                    className="w-full mb-4 p-2 rounded-lg border border-pink-500/30 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    value={searchFriends}
                    onChange={(e) => setSearchFriends(e.target.value)}
                />
                <div className="flex flex-col h-[calc(100vh-20rem)]">
                    <ul className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {filteredFriends.map((friend) => (
                            <li
                                key={friend.id}
                                className="flex items-center gap-3 sm:gap-4 bg-black/40 p-3 sm:p-4 rounded-lg border border-pink-500/30 hover:bg-pink-500/10 transition cursor-pointer"
                                onClick={() => toggleFriend(friend.id)}
                            >
                                {friend.mediaUrl ? (
                                    <img
                                        src={`${friend.mediaUrl}` || "https://i.prmediaUrl.cc/100"}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-pink-500/30 object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center font-bold text-lg sm:text-xl rounded-full border border-pink-500/30 bg-black/60">
                                        {friend.name[0]}
                                    </div>
                                )}
                                <span className="flex-1 font-semibold text-sm sm:text-base truncate">{friend.name}</span>
                                <input
                                    type="checkbox"
                                    checked={selectedFriendIds.has(friend.id)}
                                    onChange={() => toggleFriend(friend.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 rounded focus:ring-pink-400"
                                />
                            </li>
                        ))}
                        {/* Spacer to ensure last item isn't hidden behind sticky footers */}
                        <div className="h-4"></div>
                    </ul>
                </div>

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className=" md:max-w-full fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
                    <div className="max-w-[70%] md:max-w-md bg-black p-4 sm:p-6 rounded-xl border border-pink-500/50 w-full">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Room Details</h2>

                        <label className="block mb-4">
                            <span className="text-base sm:text-lg font-semibold">Room Name</span>
                            <input
                                type="text"
                                placeholder="Enter room name"
                                className="mt-2 w-full p-2 rounded-lg border border-pink-500/30 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                        </label>

                        <div className="flex items-center justify-between mb-6">
                            <span className="text-base sm:text-lg">Public Room</span>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 rounded focus:ring-pink-400"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2 border border-pink-500/50 rounded-lg text-white hover:bg-pink-500/10 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                disabled={isCreating}
                                className={`flex-1 py-2 rounded-lg font-bold text-white transition 
                                ${isCreating
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-pink-600 to-pink-400 hover:opacity-90"
                                    }`}
                            >
                                {isCreating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
