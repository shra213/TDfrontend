import { create } from 'zustand';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

interface FriendData {
    id: string;
    name: string;
    lastMessage: string;
    mediaUrl: any;
    unreadCount: any;
}

interface FriendsState {
    friends: FriendData[];
    loading: boolean;
    initFriendsListener: (uid: string) => void;
    clearFriends: () => void;
}

let unsubFrnd: (() => void) | null = null;

export const useFriendsStore = create<FriendsState>((set) => ({
    friends: [],
    loading: true,

    initFriendsListener: (uid) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, 'friends'),
                    where('members', 'array-contains', uid),
                    where('chatEnabled', '==', true),
                    where('status', '==', 'accepted')
                );
                console.log('Current user UID:', auth.currentUser?.uid);

                console.log(q);
                unsubFrnd = onSnapshot(q, async (snapshot) => {
                    set({ loading: true });
                    const friList = await Promise.all(
                        snapshot.docs.map(async (docSnap) => {
                            const frnd = docSnap.data() as any;
                            console.log(frnd, "frnd");
                            // safer way to get the other member ID
                            const otherId = frnd.members.find((memberId: string) => memberId !== uid);
                            const otherRef = doc(db, 'users', otherId);
                            const otherSnap = await getDoc(otherRef) as any;
                            const other = otherSnap.data();
                            return {
                                id: otherSnap.id,
                                name: otherSnap.exists() ? otherSnap.data().name : 'Unknown',
                                lastMessage: frnd.lastMsg || '',
                                lastMsgTime: frnd.lastMsgTime,
                                mediaUrl: other.mediaUrl,
                                unreadCount: frnd.unreadMap,
                                status: frnd.status
                            };
                        })
                    );

                    set({ friends: friList, loading: false });
                });
            } else {
                set({ friends: [], loading: false });
                if (unsubFrnd) unsubFrnd();
            }
        });
    },

    clearFriends: () => {
        if (unsubFrnd) unsubFrnd();
        set({ friends: [], loading: false });
    },
}));
