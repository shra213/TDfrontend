import { useEffect, useState } from 'react';
import { db, auth } from '../../firebaseconfig';
import { doc, onSnapshot } from 'firebase/firestore';

export function useProfile() {
    const [cnt, setCnt] = useState(0);
    const [mediaUrl, setMediaUrl] = useState();

    useEffect(() => {
        if (!auth.currentUser) return;

        const userRef = doc(db, "users", auth.currentUser.uid);

        // Listen to user document changes
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                localStorage.setItem("user", JSON.stringify(data));
                setMediaUrl(data.mediaUrl)
                setCnt(data.totalUnread || 0); // assume unreadMessages field
            }
        });

        return () => unsubscribe(); // cleanup on unmount
    }, []);

    // Return the todos state
    return { mediaUrl, cnt };
}