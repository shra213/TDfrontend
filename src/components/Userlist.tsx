import { useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../firebaseconfig";
interface User {
    id: string;
    name: string;
    mediaUrl: string;
    lastMessage?: string;
    lastMsgTime?: any;
    unreadCount?: any;
    status?: any;
}

interface UserListProps {
    heading: string;
    users: User[];
    searchPlaceholder?: string;
    actionButton?: (user: User) => ReactNode;
    friends?: boolean;
    onClickUser?: (user: User) => void;
}

export default function UserList({
    heading,
    users,
    searchPlaceholder = "Search...",
    actionButton,
    friends,
    onClickUser
}: UserListProps) {
    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );
    const currentUser = auth.currentUser?.uid;
    if (!currentUser) {
        return;
    }
    return (
        <>
            {/* Heading + Create Group Button */}
            <div className="flex justify-between items-center my-3">
                <h2 className="p-2 sm:p-0 md:text-3xl text-xl font-bold text-pink-400 tracking-wide">
                    {heading}
                </h2>
            </div>

            {/* Search Bar */}
            <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 p-2 rounded-lg border border-pink-500/30 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />

            {/* User List */}
            {/* Wrapper for full height */}
            <div className="flex flex-col h-[70vh]">
                {/* Scrollable list */}
                <ul className="flex-1 overflow-y-auto space-y-4 p-2">
                    {filteredUsers.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => onClickUser?.(user)}
                            className="flex items-center justify-between bg-black/40 p-2 md:p-4 rounded-lg border border-pink-500/30 hover:bg-pink-500/10 transition cursor-pointer"
                        >
                            {/* User avatar & details */}
                            <div className="flex items-center gap-2 md:gap-4 flex-1">
                                {user.mediaUrl ? (
                                    <img
                                        src={`${user.mediaUrl}`}
                                        className="w-8 h-8 md:w-12 :h-12 rounded-full border border-pink-500/30 object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 md:w-12 md:h-12 flex justify-center items-center font-bold text-xl rounded-full border border-pink-500/30">
                                        {user.name[0]}
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    <span className="font-semibold text-white">{user.name}</span>
                                    {friends && (
                                        <span className="text-gray-400 text-sm truncate w-32">
                                            {user.lastMessage || "Start a conversation..."}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Last message time */}
                            {friends && user.lastMsgTime && (
                                <span className="text-gray-400 text-xs mr-2">
                                    {new Date(user.lastMsgTime?.seconds * 1000).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            )}

                            {/* Unread badge */}
                            {friends && user.unreadCount && user.unreadCount[currentUser] > 0 && (
                                <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                    {user.unreadCount[currentUser]}
                                </span>
                            )}

                            {actionButton && actionButton(user)}
                        </li>
                    ))}
                    {/* Bottom spacer to ensure last item is fully visible */}
                    <div className="h-4"></div>
                </ul>
            </div>

        </>
    );
}
