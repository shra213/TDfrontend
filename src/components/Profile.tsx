import { useState } from "react";
import { auth } from "../firebaseconfig";

interface User {
    name: string;
    email: string;
    birthdate: string;
    publicId?: string;
    mediaUrl?: string;
}

const url = import.meta.env.VITE_API_URL;
console.log(url, "url")
export default function ProfileSection() {
    if (!auth.currentUser) {
        return;
    }
    //@ts-ignore
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) as User : null;
    });

    // const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    console.log(user);
    // Fetch profile data
    // useEffect(() => {
    //     const fetchProfile = async () => {
    //         try {
    //             const currentUser = auth.currentUser;
    //             if (!currentUser) throw new Error("User not logged in");

    //             const token = await currentUser.getIdToken();
    //             const res = await fetch(`${url}/user/me`, {
    //                 method: "GET",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     "Authorization": `bearer ${token}`,
    //                 },
    //             });

    //             if (!res.ok) throw new Error("Failed to fetch profile");

    //             const data: User = await res.json();
    //             localStorage.setItem("name", data.name);
    //             localStorage.setItem("prf", data.mediaUrl || "");
    //             localStorage.setItem("publicId", data.publicId || "")
    //             setUser(data);
    //         } catch (err: any) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchProfile();
    // }, []);

    const handleEdit = (field: keyof User) => {
        console.log("Editing field set to:", field); // Debug
        if (!user) return;
        setEditingField(field);
        setEditValue(user[field] || "");
    };

    const handleSave = async () => {
        if (!user || !editingField) return;
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not logged in");

            const token = await currentUser.getIdToken();
            const res = await fetch(`${url}/user/updateProfile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`,
                },
                body: JSON.stringify({ [editingField]: editValue }),
            });

            if (!res.ok) throw new Error("Failed to update profile");
            setUser({ ...user, [editingField]: editValue });
            localStorage.setItem("user", JSON.stringify({ ...user, [editingField]: editValue }))
            setEditingField(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        try {
            setUploading(true);
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not logged in");

            const formData = new FormData();
            console.log(file);
            formData.append("file", file);

            // Upload to backend (Multer)
            console.log(formData);
            console.log(`${url}/upload`);
            const uploadRes = await fetch(`${url}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                console.log(uploadRes);
                return;
            }
            console.log("dontknow");
            const uploadData = await uploadRes.json();
            console.log(uploadData);
            const fileUrl = uploadData.fileUrl;

            // Update profile picture URL in DB
            const token = await currentUser.getIdToken();
            const res = await fetch(`${url}/user/updateProfile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`,
                },
                body: JSON.stringify({ mediaUrl: fileUrl, publicId: uploadData.publicId }),
            });
            if (!res.ok) throw new Error("Failed to update profile picture");
            const ponse = await fetch(`${url}/delete-file`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`,
                },
                body: JSON.stringify({ publicId: localStorage.getItem("publicId") }),
            });
            if (!ponse.ok) {
                const ponseData = await ponse.json();
                console.log(ponseData);
                return;
            }
            setUser((prev) => (prev ? { ...prev, mediaUrl: fileUrl } : prev));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    /** -----------------------------
     * LOGOUT USER
     * ----------------------------- */
    const handleLogout = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not logged in");

            await auth.signOut();
            localStorage.clear();
            window.location.href = "/login"; // Redirect to login page
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return <p className="text-white">No profile found</p>;

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 py-6 px-2">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
                <img
                    src={`${user.mediaUrl}` || "https://randomuser.me/api/portraits/women/44.jpg"}
                    alt="Profile"
                    className="w-40 h-40 sm:w-60 sm:h-60 rounded-full border-4 border-pink-500/40 shadow-lg object-cover"
                />
                <label className="mt-3 cursor-pointer px-3 py-1 bg-pink-500 rounded hover:bg-pink-600 text-white">
                    {uploading ? "Uploading..." : "Change Picture"}
                    <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            {/* Profile Details */}
            <div className="flex-1 text-white space-y-4">
                {/* Name */}
                <div>
                    <span className="block text-sm text-gray-400">Name</span>
                    {(
                        <span
                            className="text-lg cursor-pointer hover:underline"
                        >
                            {user.name}
                        </span>
                    )}
                </div>

                {/* Email */}
                <div>
                    <span className="block text-sm text-gray-400">Email</span>
                    {(
                        <div className="flex flex-col">
                            <span
                                className="text-lg text-white cursor-pointer"
                            >
                                {user.email.length > 20 ? (
                                    <>
                                        {user.email.slice(0, 20)}
                                        <br />
                                        {user.email.slice(20)}
                                    </>
                                ) : (
                                    user.email
                                )}
                            </span>
                        </div>

                    )}
                </div>

                {/* Birthdate */}
                <div>
                    <span className="block text-sm text-gray-400">Birthdate</span>
                    {editingField === "birthdate" ? (
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                            />
                            <button
                                onClick={handleSave}
                                className="px-3 py-1 bg-green-500 rounded hover:bg-green-600"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <span
                            className="text-lg cursor-pointer hover:underline"
                            onClick={() => handleEdit("birthdate")}
                        >
                            {user.birthdate ? user.birthdate : `21 / 9 / 2005`}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="hidden md:block flex gap-4 mt-6">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div >
    );
}
