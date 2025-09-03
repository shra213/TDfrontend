import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useGroupsStore } from "../stores/useGroupsStore";

export default function Groups() {
    const [search, setSearch] = useState("");
    const { groups, loading, fetchGroups } = useGroupsStore();

    useEffect(() => {
        fetchGroups(); // only once
    }, [fetchGroups]);

    const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p className="text-white">Loading groups...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-pink-400 tracking-wide">
                Groups
            </h2>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/40 border border-pink-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
                />
            </div>

            <ul className="space-y-4">
                {filteredGroups.map((group) => (
                    <li
                        key={group.id}
                        className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-pink-500/30 hover:bg-pink-500/10 transition"
                    >
                        <img
                            src={group.avatar}
                            alt={group.name}
                            className="w-12 h-12 rounded-full border border-pink-500/30"
                        />
                        <div className="flex flex-col flex-1">
                            <span className="font-semibold text-white">{group.name}</span>
                            <span className="text-gray-400 text-sm truncate">
                                {group.lastMessage}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
