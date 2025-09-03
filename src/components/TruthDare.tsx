// src/Component/TruthDare.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { auth, db } from "../firebaseconfig";
import { updateDoc, doc, onSnapshot } from "firebase/firestore";
// Pull questions from separate files
import truths from "./truths";
import dares from "./dares";
import { handleEndTurn, handleSubmitAnswer, handleAnswerDecision, handleChooseDare, handleChooseTruth } from "./RoomHandler";

interface TruthDareProps {
  question?: any;
  dbmode?: any;
  roomId?: any;
  click?: any;
  handleEndTurn?: any;
  gameStatus?: any;
  Asker?: any;
  media?: any;
  fixAnswer?: any;
  answerer?: any;
}
const apiUrl = import.meta.env.VITE_API_URL;

function TruthDare({ question, dbmode, roomId, click, gameStatus, Asker, media, fixAnswer, answerer }: TruthDareProps) {
  console.log(fixAnswer ? fixAnswer : "answerrr");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const [result, setResult] = useState<string>("");
  const result = question;
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [answer, setAnswer] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const clicked = click;
  const currentUid = auth.currentUser?.uid;
  const currentAsker = Asker || "";
  const currentAnswerer = answerer || "";

  //you have to change this after asi it is same in game.tsx also
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      const data = snap.data();
      if (data?.typingStatus) {
        setTypingStatus(data.typingStatus);
      }
    });
    return () => unsubscribe();
  }, [roomId]);
  const updateTyping = async (field: "askerTyping" | "answererTyping", value: boolean) => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      typingStatus: {
        ...typingStatus,
        [field]: value,
      },
    });
  };

  const [typingStatus, setTypingStatus] = useState<{ askerTyping: boolean; answererTyping: boolean }>({
    askerTyping: false,
    answererTyping: false,
  });
  // const clicked = 
  // const [mode, setMode] = useState<Mode>(null);
  const [revealPulse, setRevealPulse] = useState<boolean>(false);
  const [shakeChoose, setShakeChoose] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mode = dbmode;
  console.log(mode);
  const ensureAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new AudioContext();

    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };
  const chooseTruth = useCallback(() => {
    console.log('in truth func')
    if (!currentUid) {
      return;
    }
    handleChooseTruth(roomId!, currentAnswerer.id, currentUid);
  }, [roomId, currentAnswerer.id, currentUid]);

  const chooseDare = useCallback(() => {
    console.log('in dare func')

    if (!currentUid) {
      return;
    }
    handleChooseDare(roomId!, currentAnswerer.id, currentUid);
  }, [roomId, currentAnswerer.id, currentUid]);


  const handleAnswer = useCallback(async () => {
    if (!currentUid) {
      return;
    }
    console.log(currentAnswerer.id, currentUid)
    handleSubmitAnswer(roomId, currentAnswerer.id, currentUid, apiUrl, mediaFile, answer);
  }, [roomId, currentAnswerer, currentUid, mediaFile, answer]);

  const handleDecision = useCallback(async (accepted: boolean) => {
    if (!roomId) return;
    handleAnswerDecision(roomId, accepted);
  }, [roomId]);

  const playClickSound = () => {
    try {
      const ctx = ensureAudioContext();
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(880, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.18);
    } catch { }
  };

  const playErrorBlip = () => {
    try {
      const ctx = ensureAudioContext();
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(300, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.26);
    } catch { }
  };

  const playRevealSound = () => {
    try {
      const ctx = ensureAudioContext();
      const t = ctx.currentTime;

      // kick
      const kick = ctx.createOscillator();
      const kg = ctx.createGain();
      kick.type = "sine";
      kick.frequency.setValueAtTime(120, t);
      kg.gain.setValueAtTime(0.0001, t);
      kg.gain.exponentialRampToValueAtTime(0.6, t + 0.01);
      kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      kick.connect(kg);
      kg.connect(ctx.destination);
      kick.start(t);
      kick.stop(t + 0.36);

      // sparkle
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++)
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / 6000);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      noise.connect(ng);
      ng.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 1);
    } catch { }
  };

  const playTrumpetFanfare = () => {
    try {
      const ctx = ensureAudioContext();
      const t = ctx.currentTime;
      const notes = [880, 1100, 980];
      notes.forEach((f, i) => {
        const start = t + i * 0.12;
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f, start);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(f * 1.2, start);
        filter.Q.value = 6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
        o.connect(filter);
        filter.connect(g);
        g.connect(ctx.destination);
        o.start(start);
        o.stop(start + 0.32);
      });
    } catch { }
  };

  const speak = (text: string) => {
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.0;
      utt.pitch = 1.02;
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        const v = voices.find((vv) => /en|hi|es|fr/.test(vv.lang)) || voices[0];
        if (v) utt.voice = v;
      }
      window.speechSynthesis.speak(utt);
    } catch { }
  };

  const handleChoose = async () => {
    if (currentUid !== currentAnswerer.id) {
      alert("you are not the answerer");
      return;
    }
    if (!mode) {
      setShakeChoose(true);
      playErrorBlip();
      setTimeout(() => setShakeChoose(false), 520);
      return;
    }
    if (clicked) return;
    console.log(roomId);
    await updateDoc(doc(db, "rooms", roomId), {
      clicked: true,
    });
    playClickSound();
    playTrumpetFanfare();

    setTimeout(() => {
      const pick = question || (mode === "truth" ? truths : dares)[Math.floor(Math.random() * (mode === "truth" ? truths.length : dares.length))];
      // setResult(pick);
      setShowConfetti(true);
      // setClicked(true);
      setRevealPulse(true);
      playRevealSound();
      speak(pick);
      setTimeout(() => setShowConfetti(false), 4200);
      setTimeout(() => setRevealPulse(false), 1400);
    }, 420);
  };


  const onEndTurn = useCallback(() => {
    handleEndTurn(roomId!);
  }, [db, roomId]);

  // const handleBack = () => {
  //   setResult("");
  //   setClicked(false);
  //   setRevealPulse(false);
  //   setShowConfetti(false);
  //   setMode(null);
  //   try {
  //     window.speechSynthesis.cancel();
  //   } catch { }
  // };

  useEffect(() => {
    const voices = window.speechSynthesis?.getVoices?.();
    if (!voices || voices.length === 0) {
      const handler = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = handler;
      return () => {
        window.speechSynthesis.onvoiceschanged = null; // just side-effect
      };
    }
  }, []);

  const orbBg =
    mode === "truth"
      ? "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 22%, rgba(0,0,0,0.35)), conic-gradient(from 210deg at 50% 50%, rgba(0,245,160,0.28), rgba(0,224,255,0.28), rgba(0,0,0,0) 62%)"
      : mode === "dare"
        ? "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 22%, rgba(0,0,0,0.35)), conic-gradient(from 210deg at 50% 50%, rgba(255,77,77,0.32), rgba(255,0,168,0.32), rgba(0,0,0,0) 62%)"
        : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 22%, rgba(0,0,0,0.35)), conic-gradient(from 210deg at 50% 50%, rgba(189,52,254,0.22), rgba(0,224,255,0.18), rgba(0,0,0,0) 62%)";

  const ringGlow =
    mode === "truth"
      ? "0 0 66px rgba(0,245,160,0.22), 0 0 24px rgba(0,224,255,0.14)"
      : mode === "dare"
        ? "0 0 66px rgba(255,0,168,0.22), 0 0 24px rgba(255,77,77,0.14)"
        : "0 0 40px rgba(189,52,254,0.16)";

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-tr from-[#0b1023] via-[#1a1040] to-[#001018] text-white overflow-hidden">
      {/* neon aurora blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -left-56 -top-24 w-[860px] h-[860px] rounded-full opacity-25 blur-3xl animate-[pulse_9s_infinite]"
          style={{
            background:
              "radial-gradient(45% 45% at 40% 40%, rgba(0,224,255,0.35) 0%, rgba(0,224,255,0.00) 60%)",
          }}
        />
        <div
          className="absolute -right-56 -bottom-28 w-[820px] h-[820px] rounded-full opacity-20 blur-3xl animate-[float_14s_infinite]"
          style={{
            background:
              "radial-gradient(45% 45% at 60% 60%, rgba(255,0,168,0.35) 0%, rgba(255,0,168,0.00) 60%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-10 blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(189,52,254,0.5), rgba(0,0,0,0))",
          }}
        />
      </div>

      <div className="relative z-20 w-[94%] max-w-[980px] px-3 py-6 md:px-5 md:py-10">
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-8"
        >
          <div>

            {isDesktop && <p className="text-sm text-white/70 mt-1">
              Pick a mode, then tap the holo to reveal — single reveal per
              round.
            </p>}
          </div>

        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* left panel */}
          {(!click || isDesktop) && (
            <div>
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="relative p-3 rounded-2xl md:rounded-3xl md:p-6  bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] border border-white/10 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => {
                        // if (!clicked) setMode("truth");
                        if (chooseTruth) {
                          chooseTruth();
                        }
                        playClickSound();
                      }}
                      disabled={clicked}
                      className={`flex-1 px-2 py-2 md:px-5 md:py-3 rounded-2xl font-bold text-sm md:text-lg transition-all ${mode === "truth"
                        ? "bg-gradient-to-r from-[#00f5a0] to-[#00e0ff] shadow-[0_10px_40px_rgba(0,245,160,0.25)]"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                    >
                      💡 Truth
                    </button>

                    <button
                      onClick={() => {
                        // if (!clicked) setMode("dare");
                        if (chooseDare) {
                          chooseDare();
                        }
                        playClickSound();
                      }}
                      disabled={clicked}
                      className={`flex-1 px-3 py-2 md:px-5 md:py-3 rounded-2xl font-bold text-sm md:text-lg transition-all ${mode === "dare"
                        ? "bg-gradient-to-r from-[#ff4d4d] to-[#ff00a8] shadow-[0_10px_40px_rgba(255,0,168,0.25)]"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                    >
                      🔥 Dare
                    </button>
                  </div>

                  <div className="text-sm text-white/70">
                    Click hologram to get Your Question
                  </div>

                  {/* orb stage */}
                  <div className="w-full flex items-center justify-center py-6">
                    <div className="relative">
                      {/* outer ring */}
                      <motion.div
                        animate={
                          revealPulse
                            ? { scale: [1, 1.16, 1], opacity: [1, 0.85, 1] }
                            : { rotate: 0 }
                        }
                        transition={
                          revealPulse
                            ? { duration: 1.2 }
                            : { duration: 12, repeat: Infinity }
                        }
                        className="absolute inset-[-28px] rounded-full pointer-events-none"
                        style={{
                          border: "2px solid rgba(255,255,255,0.05)",
                          boxShadow: ringGlow,
                        }}
                      />

                      {/* orb */}
                      <motion.div
                        onClick={handleChoose}
                        animate={
                          shakeChoose ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}
                        }
                        whileTap={{ scale: clicked ? 1 : 0.96 }}
                        initial={{ scale: 0.98 }}
                        className="w-[150px] h-[150px] md:w-[220px] md:h-[220px] rounded-full flex items-center justify-center cursor-pointer select-none"
                        style={{
                          background: orbBg,
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow:
                            "inset 0 10px 50px rgba(255,255,255,0.04), 0 30px 80px rgba(2,6,23,0.8), 0 0 40px rgba(0,0,0,0.25)",
                          backdropFilter: "blur(6px) saturate(1.1)",
                        }}
                      >
                        <div
                          style={{
                            width: 150,
                            height: 150,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            color: "#fff",
                            textAlign: "center",
                            padding: 8,
                            background:
                              mode === "truth"
                                ? "linear-gradient(135deg, rgba(0,245,160,0.12), rgba(0,224,255,0.06))"
                                : mode === "dare"
                                  ? "linear-gradient(135deg, rgba(255,77,77,0.14), rgba(255,0,168,0.08))"
                                  : "linear-gradient(135deg, rgba(189,52,254,0.10), rgba(0,224,255,0.06))",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow:
                              mode === "truth"
                                ? "0 0 40px rgba(0,245,160,0.18)"
                                : mode === "dare"
                                  ? "0 0 40px rgba(255,0,168,0.18)"
                                  : "0 0 30px rgba(189,52,254,0.14)",
                          }}
                        >
                          <div style={{ fontSize: 16 }}>
                            {clicked
                              ? "Revealed"
                              : mode
                                ? `Tap — ${mode.toUpperCase()}`
                                : "Choose Mode"}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                </div>

              </motion.div>
              {!isDesktop && gameStatus === "choosing" && (
                <div className=" bg-black/40 mt-3 p-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg w-full text-center">
                  {currentUid === currentAnswerer.id ? (
                    <p className="text-sm md:text-lg animate-pulse">
                      🎭 <span className="text-pink-400">You have to decide Truth or Dare…</span>
                    </p>
                  ) : (
                    <p className="text-sm md:text-lg animate-pulse">
                      🎭 <span className="text-pink-400">{currentAnswerer.name}</span> is deciding Truth or Dare…
                    </p>
                  )}
                </div>
              )}

              {!isDesktop && gameStatus === "asking" && (
                <div className=" w-full flex flex-col items-center">
                  {/* Mode Display */}
                  {currentUid !== currentAsker.id && (
                    <div className="mt-3 text-center text-sm md:text-lg animate-pulse">
                      💬 <span className="text-cyan-400">{currentAsker.name || "s"}</span>{" "}
                      {typingStatus.answererTyping ? "is typing…" : `is preparing ${mode}...`}
                    </div>
                  )}
                </div>)}
            </div>

          )}


          {/* right: reveal panel */}
          <div>
            {(click || isDesktop) && (<motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="relative p-6 rounded-3xl border shadow-2xl backdrop-blur-xl"
              style={{
                minHeight: 360,
                borderColor: "rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
                boxShadow:
                  "0 20px 80px rgba(0,0,0,0.5), inset 0 10px 60px rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/70 mb-4">
                    Holo Reveal
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <AnimatePresence>
                      {result ? (
                        <motion.div
                          initial={{ opacity: 0, y: 18, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 18, scale: 0.98 }}
                          transition={{ duration: 0.6 }}
                          className="rounded-xl p-6 w-full bg-black/40 border border-white/10 shadow-inner"
                          style={{
                            textAlign: "center",
                            color: "#fff",
                            boxShadow: "inset 0 6px 40px rgba(255,255,255,0.03)",
                          }}
                        >
                          <div className="mb-3 text-xs text-white/70">
                            {mode?.toUpperCase()}
                          </div>
                          <div
                            className="text-lg md:text-xl font-extrabold"
                            style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
                          >
                            {clicked && result}
                          </div>

                          <div className="mt-5 flex items-center justify-center gap-3">
                            <button
                              onClick={() => speak(clicked && result)}
                              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition border border-white/10"
                            >
                              🔊 Replay
                            </button>
                          </div>

                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="text-center text-white/70"
                        >
                          Pick Truth or Dare and TAP the orb to reveal.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* <div className="mt-6 flex items-center justify-between text-xs text-white/60">
                <div>Designed for unforgettable party moments</div>
              </div> */}
                {
                  isDesktop && gameStatus === "choosing" && (
                    <div className="mt-3 bg-black/40 p-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg w-full text-center">
                      {currentUid === currentAnswerer.id ? (
                        <p className="text-lg animate-pulse">
                          🎭 <span className="text-pink-400">You have to decide Truth or Dare…</span>
                        </p>
                      ) : (
                        <p className="text-lg animate-pulse">
                          🎭 <span className="text-pink-400">{currentAnswerer.name}</span> is deciding Truth or Dare…
                        </p>
                      )}
                    </div>
                  )}

                {isDesktop && gameStatus === "asking" && (
                  <div className="mt-3 w-full flex flex-col items-center">
                    {/* Mode Display */}


                    {currentUid !== currentAsker.id && (
                      <div className="mt-3 text-center text-lg animate-pulse">
                        💬 <span className="text-cyan-400">{currentAsker.name || "s"}</span>{" "}
                        {typingStatus.answererTyping ? "is typing…" : `is preparing ${mode}...`}
                      </div>
                    )}
                  </div>)
                }



                {gameStatus === "answering" && (
                  <>
                    {currentUid === currentAnswerer.id ? (
                      <>
                        <div className="mt-6 mb-2 font-medium">💬 Enter your answer:</div>
                        <input
                          className="border border-white/20 bg-white/10 rounded-xl p-3 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                          value={answer}
                          onChange={(e) => {
                            setAnswer(e.target.value);
                            updateTyping("answererTyping", e.target.value.length > 0);
                          }}
                          placeholder="Type your answer..."
                          onBlur={() => updateTyping("answererTyping", false)}
                        />

                        {/* File Upload */}
                        {mode === "dare" && (
                          <div className="mt-4">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="block w-full text-sm text-gray-300
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-cyan-500 file:text-white
                                                    hover:file:bg-cyan-600"
                              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                            />
                          </div>
                        )}

                        <button
                          className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition-transform duration-200"
                          onClick={handleAnswer}
                        >
                          Submit Answer
                        </button>
                      </>
                    ) : (
                      <div className="mt-6 text-center text-sm md:text-lg animate-pulse">
                        💬 <span className="text-cyan-400">{currentAnswerer.name}</span>{" "}
                        {typingStatus.answererTyping ? "is typing…" : "is answering…"}
                      </div>
                    )}

                    {/* Media Preview */}
                    {mediaFile && (
                      <div className="mt-3">
                        {mediaFile.type.startsWith("video/") ? (
                          <video
                            src={URL.createObjectURL(mediaFile)}
                            controls
                            className="rounded-lg max-w-full"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(mediaFile)}
                            alt="Preview"
                            className="rounded-lg max-w-full"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}

                {(gameStatus === "answerPending" || gameStatus === "idle") && (<>
                  <p className={`mt-4 p-4 rounded-2xl font-semibold text-sm md:text-lg max-w-xl break-words overflow-auto 
                  ${mode === "truth"
                      ? "bg-gradient-to-r from-[#00f5a0] to-[#00e0ff] text-white shadow-[0_10px_40px_rgba(0,245,160,0.25)]"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_10px_40px_rgba(236,72,153,0.25)]"
                    }`}>
                    ✨ Answer: <span>{fixAnswer || "—"}</span>
                  </p>


                  {media && mode === "dare" && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400">Uploaded Media:</p>
                      <a
                        onClick={() => {
                          console.log(media[0])
                        }}
                        href={`${import.meta.env.BASE_URL}${media}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        View File
                      </a>
                      {media && /\.(jpeg|jpg|png|gif|webp)$/i.test(media) && (
                        <img
                          src={media}
                          alt="Uploaded answer"
                          className="mt-2 rounded-lg max-h-48"
                        />
                      )}

                      {/* Video Preview */}
                      {media && /\.(mp4|webm|ogg)$/i.test(media) && (
                        <video
                          src={media}
                          controls
                          className="mt-2 rounded-lg max-h-48"
                        />
                      )}

                    </div>
                  )}
                  {gameStatus === "answerPending" && currentUid === currentAsker.id ? (
                    <>
                      <div className="mt-3 flex gap-3 justify-center">
                        <div className="flex gap-4 mt-4">
                          <button
                            className="px-4 py-2 rounded-2xl font-bold text-white text-sm md:text-lg
                            bg-gradient-to-r from-[#00f5a0] to-[#00e0ff]
                            shadow-[0_10px_40px_rgba(0,245,160,0.25)]
                            hover:scale-105 transition-transform duration-200"
                            onClick={() => handleDecision(true)}
                          >
                            Accept
                          </button>

                          <button
                            className="px-4 py-2 rounded-2xl font-bold text-white text-sm md:text-lg
                            bg-gradient-to-r from-pink-500 to-rose-500
                            shadow-[0_10px_40px_rgba(236,72,153,0.25)]
                            hover:scale-105 transition-transform duration-200"
                            onClick={() => handleDecision(false)}
                          >
                            Reject
                          </button>
                        </div>

                      </div>
                    </>

                  ) : (
                    <p className="mt-2 text-sm text-gray-300">{gameStatus === "idle" ? `Waiting till ${currentAsker.name} ends the turn` : `wait till asker accepts`}</p>
                  )}
                </>)}

                {gameStatus === "idle" && (

                  <div className="mt-6 flex flex-col items-center">
                    {currentUid === currentAsker.id ? (
                      <button
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg font-semibold hover:scale-105 transition-transform duration-200"
                        onClick={onEndTurn}
                      >
                        End Turn → Next Spin
                      </button>
                    ) : (
                      <div className="text-center text-sm md:text-lg animate-pulse">
                        💬 <span className="text-cyan-400">{currentAsker.name}</span> is ending this turn
                        <p className="mt-2 text-white/90 italic">
                          {answer || `Waiting till ${currentAsker.name} ends the turn`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>)}
          </div>
        </div>
      </div>

      {/* confetti overlay */}
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} />}

      <style>{`
        @keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.02) } 100% { transform: scale(1) } }
        .animate-[pulse_9s_infinite] { animation: pulse 9s infinite ease-in-out; }
        @keyframes float { 0% { transform: translateY(0)} 50% { transform: translateY(-14px)} 100% { transform: translateY(0) } }
        .animate-[float_14s_infinite] { animation: float 14s infinite ease-in-out; }
      `}</style>
    </div>
  );
}

export default TruthDare;
// export { TruthDare as TruthDareGame };
