import { create } from "zustand";
import { db, auth } from "../firebaseconfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Group {
    id: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    members: string[];
}

interface GroupsState {
    groups: Group[];
    loading: boolean;
    fetchGroups: () => void;
}

export const useGroupsStore = create<GroupsState>((set) => ({
    groups: [],
    loading: true,

    fetchGroups: () => {
        let unsubGrp: (() => void) | null = null;

        onAuthStateChanged(auth, (user) => {
            if (user) {
                const grpQuery = query(
                    collection(db, "groups"),
                    where("members", "array-contains", user.uid)
                );

                unsubGrp = onSnapshot(grpQuery, (snapshot) => {
                    const groupsData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Group[];

                    set({ groups: groupsData, loading: false });
                });
            } else {
                set({ groups: [], loading: false });
                if (unsubGrp) unsubGrp();
            }
        });
    },
}));
