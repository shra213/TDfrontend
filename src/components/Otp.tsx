import React, { useState, useEffect, useRef, useMemo } from "react";
import type { ChangeEvent, KeyboardEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const Otp: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  console.log(attemptCount);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const verificationEmail = localStorage.getItem("verificationEmail");
    const veriName = localStorage.getItem("name");
    if (verificationEmail) {
      setEmail(verificationEmail);
      setName(veriName || "");
    } else {
      navigate("/signup");
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setMessage("Please enter the complete 6-digit code");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}/api/otp/verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: otpValue, name: name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Email verified successfully! Redirecting...");
        localStorage.removeItem("verificationEmail");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setAttemptCount((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            setMessage("Too many failed attempts. Please sign up again.");
            setIsError(true);
            localStorage.removeItem("verificationEmail");
            setTimeout(() => navigate("/signup"), 2000);
          } else {
            setMessage(data.message || "Invalid code. Try again.");
            setIsError(true);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          }
          return next;
        });
      }
    } catch (error) {
      setMessage("Verification failed. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await fetch(`${import.meta.env.BASE_URL}/api/otp/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      setMessage("New verification code sent to your email");
      setCountdown(60);
      setCanResend(false);
      setAttemptCount(0);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setMessage("Failed to resend code. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Neon Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />
      {/* Neon Orbs */}
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

      {/* Card */}
      <motion.div
        className="relative z-10 bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md"
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg"
          >
            <Mail size={28} className="text-white" />
          </motion.div>
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-extrabold text-center mb-2"
          style={{
            textShadow:
              "0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff",
          }}
        >
          Verify Your Email
        </h1>
        <p className="text-center text-slate-300 mb-6">
          We've sent a 6-digit code to{" "}
          <span className="text-pink-400">{email}</span>
        </p>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <motion.input
                key={i}
                //@ts-ignore
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleOtpChange(i, e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(i, e)}
                whileFocus={{
                  scale: 1.15,
                  borderColor: "#ff00ff",
                  boxShadow: "0 0 12px #ff00ff",
                }}
                className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-black/30 border border-pink-500/50 text-pink-400 focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]"
              />
            ))}
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm text-center ${isError
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-green-500/20 text-green-300 border border-green-500/40"
                }`}
            >
              {message}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #ff00ff" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>

          <div className="text-center mt-4 text-sm text-slate-300">
            Didn’t receive the code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-pink-400 hover:underline"
              >
                Resend Code
              </button>
            ) : (
              <span className="text-slate-400">Resend in {countdown}s</span>
            )}
          </div>

          <div className="text-center mt-2">
            <Link
              to="/login"
              className="text-sm text-slate-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>

        <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 text-center text-sm text-slate-300">
          <strong>Demo:</strong> Use code{" "}
          <code className="font-bold text-pink-400">123456</code> to verify
        </div>
      </motion.div>
    </div>
  );
};

export default Otp;
