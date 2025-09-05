import { useState, useMemo } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";
import { motion } from "framer-motion";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      navigate("/front")
      
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  // 👇 Generate bubbles once only
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center text-white px-4 sm:px-6">
      {/* Animated Neon Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* Floating Neon Bubbles */}
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

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl"
      >
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-6 sm:mb-8 tracking-wide"
          style={{
            textShadow: "0 0 10px #ff00ff, 0 0 25px #ff00ff, 0 0 50px #ff00ff",
          }}
        >
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div>
            <label
              className="block text-xs sm:text-sm font-medium text-slate-300 mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#ff4da6" }}
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label
              className="block text-xs sm:text-sm font-medium text-slate-300 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#ff4da6" }}
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 text-sm sm:text-base"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #ff4da6" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5  sm:py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg font-semibold text-sm sm:text-base"
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>

  );
}
