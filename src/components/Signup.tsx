import React, { useState, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    if (!formData.email || !formData.password || !formData.name) {
      setMessage("Please fill in all required fields");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Save locally for OTP flow
      localStorage.setItem("verificationEmail", formData.email);
      localStorage.setItem("name", formData.name);

      localStorage.setItem(
        "pendingSignup",
        JSON.stringify({
          email: formData.email,
          name: formData.name,
          profilePic,
        })
      );

      setMessage(
        "Account created successfully! Please check your email for verification code."
      );
      setIsError(false);

      // Send OTP request
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/otp/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          profilePic,
        }),
      });

      setTimeout(() => {
        navigate("/verify-otp");
      }, 1000);
    } catch (error) {
      setMessage("Failed to create account. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Generate bubbles only once per mount
  const bubbles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 30 + 20;
      const startX = Math.random() * 100;
      const duration = Math.random() * 12 + 8;
      const delay = Math.random() * 5;
      return { id: i, size, startX, duration, delay };
    });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-white">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map(({ id, size, startX, duration, delay }) => (
          <motion.span
            key={id}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              bottom: -50,
              background: `radial-gradient(circle, rgba(255,0,255,0.95) 0%, rgba(255,0,255,0.4) 60%, transparent 100%)`,
              filter: `drop-shadow(0 0 12px rgba(255,0,255,0.8))`,
            }}
            animate={{ y: ["0%", "-120vh"], opacity: [0, 0.8, 0] }}
            transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Signup Card */}
      <motion.div
        className="relative z-10 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md"
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
      >
        <h1
          className="text-3xl font-extrabold text-center mb-5"
          style={{
            textShadow:
              "0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff",
          }}
        >
          Truth & Dare
        </h1>

        {/* Profile Picture Upload */}
        <div className="flex justify-center mb-6">
          <label className="relative cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 flex items-center justify-center bg-white/10 group-hover:border-pink-500 transition"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="text-white/70" size={36} />
              )}
            </motion.div>
          </label>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: "#ff4da6" }}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-pink-500"
          />
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: "#ff4da6" }}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-pink-500"
          />
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: "#ff4da6" }}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-pink-500"
          />

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${isError
                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                : "bg-green-500/20 text-green-300 border border-green-400/30"
                }`}
            >
              {message}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #ff4da6" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
