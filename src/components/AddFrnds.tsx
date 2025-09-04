import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, } from "../firebaseconfig";
import UserList from "./Userlist";
import { UserPlus, CheckCircle, Clock, Users } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl);

export default function AddFrnds() {
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        let unsubAuth: (() => void) | null = null;

        unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Logged in as", user.uid);
                fetchUsers();
            }
        });

        return () => {
            if (unsubAuth) unsubAuth();
        };
    }, []);

    // --------------- Fetch Function ---------------
    const fetchUsers = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(); // if your backend requires auth
            console.log(token);
            const res = await fetch(`${apiUrl}/friends/getUsers`, {
                headers: {
                    Authorization: `bearer ${token}`, // optional, if backend verifies user
                },
            });

            if (!res.ok) throw new Error("Failed to fetch users");

            const data = await res.json();
            setAllUsers(data.users);
            console.log(allUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    async function sendFriendRequest(friendId: any) {
        const token = await auth.currentUser?.getIdToken();
        console.log(token);
        console.log(friendId);
        try {
            const res = await fetch(`${apiUrl}/friends/sendReq`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Include auth token if needed:
                    "Authorization": `bearer ${token}`
                },
                body: JSON.stringify({ id: friendId }) // Send the ID to backend
            });
            console.log(res);
            if (!res.ok) {
                throw new Error(`Error: ${res}`);
            }

            const data = await res.json();
            console.log("Friend request sent:", data);
        } catch (err) {
            console.error("Failed to send friend request:", err);
        }
    }

    // --------------- Send Friend Request Handler ---------------
    const handleSendRequest = async (userId: string) => {
        console.log("Friend request sent to", userId);
        // You can call your backend endpoint to send a friend request here
        await sendFriendRequest(userId);
        await fetchUsers();
    };

    return (
        <UserList
            heading="Send Friend Requests"
            users={allUsers}
            actionButton={(user) => {
                const isDisabled = user.status === "request_sent" || user.status === "friends";
                return (
                    <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={isDisabled}
                        className={`px-4 py-2 rounded-lg text-black 
                        ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"}`}
                    >
                        <div>
                            {/* Send Request */}
                            <div className="flex items-center gap-2">
                                {/* Desktop / larger screens => text */}
                                <span className="hidden sm:block">
                                    {user.status === "no_relation" && "Send Request"}
                                    {user.status === "request_sent" && "Request Sent"}
                                    {user.status === "request_received" && "Pending"}
                                    {user.status === "friends" && "Friends"}
                                </span>

                                {/* Mobile / small screens => icons */}
                                <span className="sm:hidden">
                                    {user.status === "no_relation" && <UserPlus size={20} />}
                                    {user.status === "request_sent" && <CheckCircle size={20} />}
                                    {user.status === "request_received" && <Clock size={20} />}
                                    {user.status === "friends" && <Users size={20} />}
                                </span>
                            </div>
                        </div>

                    </button>
                );
            }}
        />
    );

}
