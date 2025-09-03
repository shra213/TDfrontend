// roomHandlers.ts
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseconfig";

export function shuffleArray(array: any) {
    const shuffled = [...array]; // Copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
// 🔹 Add Room Notification
export function getCapitalizedFirstName() {
    const name = localStorage.getItem("name");
    if (!name) return "";

    const firstName = name.split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}
export const addRoomNotification = async (
    // db: any,
    roomId: string,
    message: string,
    type?: string
) => {
    if (!roomId) return;
    try {
        const notifRef = collection(db, "rooms", roomId, "notifications");
        await addDoc(notifRef, { message, createdAt: new Date(), type: type || "general" });
    } catch (err) {
        console.error("Failed to add notification:", err);
    }
};

// 🔹 Choose Truth
export const handleChooseTruth = async (
    // db: any,
    roomId: string,
    currentAnswererId: string,
    currentUid: string
) => {
    if (currentAnswererId !== currentUid) return;
    try {
        await updateDoc(doc(db, "rooms", roomId), {
            choice: "truth",
            gameStatus: "asking",
        });
        console.log("success in choosing dare");
    } catch (error) {
        console.error("Error updating to Truth:", error);
    }
};

// 🔹 Choose Dare
export const handleChooseDare = async (
    // db: any,
    roomId: string,
    currentAnswererId: string,
    currentUid: string
) => {

    if (currentAnswererId !== currentUid) return;
    try {
        await updateDoc(doc(db, "rooms", roomId), {
            choice: "dare",
            gameStatus: "asking",
        });
        console.log("success in choosing dare");
    } catch (error) {
        console.error("Error updating to Dare:", error);
    }
};

// 🔹 Unremove Player
export const handleUnremovePlayer = async (
    // db: any,
    roomId: string,
    roomData: any,
    playerId: string,
    addRoomNotificationFn: (msg: string, type?: string) => Promise<void>
) => {
    if (!roomId) return;
    if (roomData.createdBy !== auth.currentUser?.uid) {
        alert("Only the admin can allow a removed player to rejoin.");
        return;
    }
    const roomRef = doc(db, "rooms", roomId);
    const currentRemoved = roomData.removedUsers || [];
    const updatedRemoved = currentRemoved.filter((p: any) => p.id !== playerId);

    try {
        await updateDoc(roomRef, { removedUsers: updatedRemoved });
        const removedPlayer = currentRemoved.find((p: any) => p.id === playerId);
        const displayName = removedPlayer?.name || "Player";
        await addRoomNotificationFn(`${displayName} is allowed to rejoin the room by the admin.`, "unremove");
    } catch (error) {
        console.error("Error un-removing player:", error);
    }
};

// 🔹 Remove Player
export const handleRemovePlayer = async (
    // db: any,
    roomId: string,
    roomData: any,
    player: any
) => {
    if (!roomId) return;
    if (roomData.createdBy !== auth.currentUser?.uid) {
        alert("Only the admin remove player");
        return;
    }
    if (player.id === auth.currentUser?.uid) return alert("You cannot remove yourself");

    const roomRef = doc(db, "rooms", roomId);
    const playerRef = doc(db, "rooms", roomId, "players", player.id);
    const currentRemoved = roomData?.removedUsers || [];
    const removedPlayer = { id: player.id, name: player.name };

    if (!currentRemoved.some((p: any) => p.id === player.id)) {
        await updateDoc(roomRef, { removedUsers: [...currentRemoved, removedPlayer] });
    }

    try {
        await deleteDoc(playerRef);
        console.log(`Player ${player.name} (${player.id}) removed successfully`);
    } catch (error) {
        console.error("Error removing player:", error);
    }
};

// 🔹 Start Game
export const handleStartGame = async (
    // db: any,
    roomId: string,
    addRoomNotificationFn: (msg: string, type?: string) => Promise<void>
) => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { isStarted: true, gameStatus: "spinning" });
    await addRoomNotificationFn(`game started`, "leave");
};

// 🔹 Submit Question
export const handleSubmitQuestion = async (
    // db: any,
    roomId: string,
    question: string
) => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { question, gameStatus: "answering" });
};

// 🔹 End Game
export const handleEndGame = async (
    apiUrl: string,
    roomId: string,
    navigate: any
) => {
    if (!roomId) return;
    try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${apiUrl}/room/terminate`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `bearer ${token}` },
            body: JSON.stringify({ id: roomId }),
        });
        navigate("/front");
        const data = await res.json();

        if (!res.ok) return alert(data.msg || "Failed to end game");
        alert("Game terminated successfully!");

    } catch (err) {
        console.error("Error ending game:", err);
        alert("Failed to end game. Please try again.");
    }
};

// 🔹 End Turn
export const handleEndTurn = async (roomId: string) => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
        choice: "",
        question: "",
        answer: "",
        asker: "",
        answerer: "",
        gameStatus: "spinning",
        clicked: false,
        spinState: { rotation: 0, spinSpeed: 0, friction: 0, minSpeed: 0, startedBy: null, startedAt: null }
    });
};

// 🔹 Exit Game
export const handleExitGame = async (
    roomId: string,
    roomData: any,
    currentUid: string,
    addRoomNotificationFn: (msg: string, type?: string) => Promise<void>,
    navigate: any
) => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/room/exit`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `bearer ${token}` },
            body: JSON.stringify({ id: roomId }),
        });

        if (res.ok) {
            navigate("/front");
            if (roomData?.asker?.id === currentUid || roomData?.answerer?.id === currentUid)
                await handleEndTurn(roomId);

            if (roomData.lastAnswerer.id === currentUid)
                await updateDoc(roomRef, { lastAnswerer: "anyone" });

            await addRoomNotificationFn(
                `${auth.currentUser?.displayName || localStorage.getItem("name")} left the room`,
                "leave"
            );
        }
    } catch (err) {
        console.error("Failed to exit game", err);
    }
};

export const handleAnswerDecision = async (roomId: any, accepted: boolean) => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    if (accepted) {
        await updateDoc(roomRef, { gameStatus: "idle" });
    } else {
        await updateDoc(roomRef, { answer: "", gameStatus: "answering" });
    }
};

export const handleSubmitAnswer = async (
    roomId: string,
    answererid: string,
    currentUid: string,
    apiUrl: any,
    mediaFile?: any,
    answer?: any,
    setAnswer?: any,
    setMediaFile?: any,
) => {
    try {
        // ✅ Ensure only the answerer can submit
        if (currentUid !== answererid) {
            alert("Only the selected answerer can submit an answer!");
            return;
        }

        let mediaUrl = "";

        if (mediaFile) {
            // ✅ Create FormData to send file
            const formData = new FormData();
            formData.append("file", mediaFile);

            // ✅ Upload to your multer backend
            const response = await fetch(`${apiUrl}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("File upload failed");
            }

            const result = await response.json();
            mediaUrl = result.fileUrl; // e.g., "/uploads/16932321312.png"
        }

        // @ts-ignore
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
            answer: answer,
            media: mediaUrl ? [mediaUrl] : [],
            answeredAt: new Date(),
            gameStatus: "answerPending"
        });

        // ✅ Reset state after submission
        setAnswer("");
        setMediaFile(null);
    } catch (error) {
        console.error("Error submitting answer:", error);
    }
};