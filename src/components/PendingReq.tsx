import { onAuthStateChanged } from "firebase/auth";
import UserList from "./Userlist";
import { useEffect, useState } from "react";
import { db, auth } from "../firebaseconfig";
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";

const apiUrl = import.meta.env.VITE_API_URL;

export default function AcceptFriendRequests() {
    const [pending, setPending] = useState<{ id: string }[]>([]);

    const acceptReq = async (friendId: string) => {
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken();

        const res = await fetch(`${apiUrl}/friends/acceptReq`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `bearer ${token}`
            },
            body: JSON.stringify({ id: friendId })
        });

        if (!res.ok) {
            console.error(`Error: ${res.status}`);
            return;
        }

        return res.json();
    };

    const handleAccept = async (userId: string) => {
        await acceptReq(userId);
        setPending(prev => prev.filter((user: any) => user.id !== userId)); // instant UI update
    };

    const getPendingReq = async (id: string) => {
        try {
            const friendsRef = collection(db, "friends");
            const pendingQuery = query(
                friendsRef,
                where("receiver", "==", id),
                where("status", "==", "pending")
            );

            const pendingDocs = await getDocs(pendingQuery);

            if (pendingDocs.empty) {
                console.log("No pending requests");
                setPending([]); // clear pending list
                return [];
            }

            const pendingList = await Promise.all(
                pendingDocs.docs.map(async (req) => {
                    const reqData = req.data();
                    let senderData = {};
                    try {
                        const senderSnap = await getDoc(reqData.senderRef);
                        senderData = senderSnap.data() ?? {};
                    } catch (err: any) {
                        console.warn("Cannot fetch sender info:", err.message);
                    }
                    return {
                        id: reqData.sender,
                        ...senderData
                    };
                })
            );

            console.log("Final pending list:", pendingList);
            setPending(pendingList);
            return pendingList;
        } catch (err) {
            console.error("Error fetching pending requests:", err);
            setPending([]);
            return [];
        }
    };



    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(user.uid);
                getPendingReq(user.uid);
            } else {
                console.log("user is not authenticated");
            }
        });
        return () => unsubAuth();
    }, []);

    return (
        <UserList
            // heading="Pending Friend Requests"
            // @ts-ignore
            users={pending}
            actionButton={(user) => (
                <button
                    onClick={() => handleAccept(user.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                    Accept
                </button>
            )}
        />
    );
}
