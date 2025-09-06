// For real like image go to the png treee image website then you get the picture which is required only
// we use framer motion in the project.
//
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
// import { db } from "../firebaseconfig";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseconfig";
// import { collection, getDocs } from "firebase/firestore";
export default function TruthOrDareBackgroundPage() {
  const bottlePng = "Beerbottle.png"; // Replace with your PNG path
  const navigate = useNavigate();
  const [totalUsers, setTotal] = useState(0);

  useEffect(() => {
    const user = auth.currentUser?.uid;
    if (user) {

      const timer = setTimeout(() => {
        navigate("/front");
      }, 500); // half a second delay

      return () => clearTimeout(timer);
    }
    // async function getUserCount() {
    //   const querySnapshot = await getDocs(collection(db, "users"));
    //   console.log("Total users:", querySnapshot.size);
    //   setTotal(querySnapshot.size);
    //   return querySnapshot.size;
    // }

    // getUserCount();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* Moving gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "400% 400%",
        }}
      />

      {/* Background drifting bottle */}
      <motion.img
        src={bottlePng}
        alt="big bottle background"
        className="absolute inset-0 w-full h-full object-contain opacity-10 scale-[1.35] blur-sm pointer-events-none"
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Continuous floating glowing bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => {
          const size = Math.random() * 30 + 15; // bubble size 15-45px
          const startX = Math.random() * 100; // start position %
          const duration = Math.random() * 8 + 4; // 6-16s to rise
          const delay = Math.random() * 5; // random delay

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${startX}%`,
                bottom: -40,
                background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 60%, transparent 100%)`,
                filter: `drop-shadow(0 0 8px rgba(255,255,255,0.9))`,
              }}
              animate={{
                y: ["0%", "-120vh"],
                x: [`${startX}%`, `${startX + (Math.random() * 10 - 5)}%`],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/70 mix-blend-multiply" />

      {/* Content area */}
      <div className="relative z-10 md:mt-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-center gap:5 md:gap-8">
        {/* Left: Title & CTA */}
        <div className="flex-1 max-w-xl text-center md:text-left">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-7xl font-extrabold leading-tight drop-shadow-2xl 
        bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 
        bg-clip-text text-transparent opacity-80"
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 0.8,
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Truth & Dare
          </motion.h1>

          <motion.p
            className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-slate-100/80 max-w-lg mx-auto md:mx-0"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            Spin the bottle. Choose truth or dare. Let the fun begin!
          </motion.p>
          <motion.div
            className="relative z-200 hidden md:flex justify-start mt-4 text-slate-400/70 text-xl"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            {`👥 ${totalUsers || 7}+ players online now`}
          </motion.div>




          <motion.div
            className="mt-4 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => navigate("/signup")}
              className="px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-xl transform hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto"
            >
              Signup
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 sm:px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm w-full sm:w-auto"
            >
              Login
            </button>
            {/* <button className="px-5 sm:px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm w-full sm:w-auto">
              How to play
            </button> */}
          </motion.div>
          {/* Features (desktop only) */}
          <div className="hidden md:grid grid-cols-2 gap-3 mt-8 text-slate-200/80 text-sm">
            <div className="p-3 bg-white/5 rounded-xl shadow-md">🎉 Private Rooms</div>
            <div className="p-3 bg-white/5 rounded-xl shadow-md">✍️ Custom Prompts</div>
            <div className="p-3 bg-white/5 rounded-xl shadow-md">🤝 Multiplayer</div>
            <div className="p-3 bg-white/5 rounded-xl shadow-md">📱 Public Rooms</div>
          </div>

        </div>

        {/* Right: Rotating PNG bottle */}
        <div className="flex-1 flex items-center justify-center mt-6 md:mt-0">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.img
              src={bottlePng}
              alt="rotating bottle"
              className="w-[200px] sm:w-[260px] md:w-[340px] h-auto object-contain opacity-80"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 12,
                ease: "linear",
              }}
            />

          </motion.div>
        </div>
      </div>


      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400/60">
        Made with ❤️ — truth or dare ui
      </div>
    </div>
  );
}

// import React from "react";
// import { motion } from "framer-motion";

// // A simple SVG 'bottle' component used as decorative 3D-like object.
// function Bottle3D({ className = "w-64 h-64" }) {
//   return (
//     <svg
//       viewBox="0 0 200 600"
//       xmlns="http://www.w3.org/2000/svg"
//       className={className}
//       aria-hidden
//     >
//       <defs>
//         <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#d9f4ff" />
//           <stop offset="100%" stopColor="#a6e3ff" />
//         </linearGradient>
//         <filter id="glass" x="-20%" y="-20%" width="140%" height="140%">
//           <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="b" />
//           <feBlend in="SourceGraphic" in2="b" mode="screen" />
//         </filter>
//       </defs>

//       {/* bottle main body */}
//       <g filter="url(#glass)">
//         <path
//           d="M60 40 C60 15, 140 15, 140 40 L145 120 C145 150, 160 170, 160 200 C160 330, 130 480, 100 520 C70 480, 40 330, 40 200 C40 170, 55 150, 55 120 Z"
//           fill="url(#g1)"
//           stroke="#7bcbe6"
//           strokeWidth="3"
//         />

//         {/* liquid */}
//         <path
//           d="M58 220 C65 340, 85 420, 100 420 C115 420, 135 345, 142 220 L58 220 Z"
//           fill="#ffd49b"
//           opacity="0.9"
//         />

//         {/* highlights */}
//         <path
//           d="M75 80 C83 70, 115 70, 125 80 C120 60, 80 60, 75 80 Z"
//           fill="#ffffff"
//           opacity="0.12"
//         />
//       </g>
//     </svg>
//   );
// }

// export default function TruthOrDareBackgroundPage() {
//   return (
//     <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-indigo-900 to-black overflow-hidden text-white">
//       {/* Large background bottle image (parallax, subtle blur) */}
//       <div
//         className="absolute inset-0 pointer-events-none"
//         aria-hidden
//       >
//         <motion.img
//           src={""}
//           alt="big bottle background"
//           className="w-full h-full object-cover opacity-20 scale-[1.12] blur-sm"
//           initial={{ y: -30 }}
//           animate={{ y: 30 }}
//           transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
//         />

//         {/* soft vignette */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/60 mix-blend-multiply" />
//       </div>

//       {/* Floating particles */}
//       <ul className="pointer-events-none absolute inset-0 -z-10">
//         {Array.from({ length: 12 }).map((_, i) => (
//           <motion.li
//             key={i}
//             className="absolute bg-white/30 rounded-full"
//             style={{
//               width: `${6 + (i % 5) * 4}px`,
//               height: `${6 + (i % 5) * 4}px`,
//               left: `${(i * 17) % 100}%`,
//               top: `${(i * 23) % 100}%`,
//             }}
//             initial={{ y: 0, x: 0, opacity: 0.6, scale: 0.8 }}
//             animate={{ y: [`0%`, `-6%`, `0%`], opacity: [0.6, 0.25, 0.6], scale: [0.9, 1.05, 0.9] }}
//             transition={{ duration: 9 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
//           />
//         ))}
//       </ul>

//       {/* Content area */}
//       <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-8">

//         {/* Left: Title & CTA */}
//         <div className="flex-1 max-w-xl">
//           <motion.h1
//             className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-2xl"
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8 }}
//           >
//             Truth or Dare
//           </motion.h1>

//           <motion.p
//             className="mt-4 text-lg md:text-xl text-slate-100/80 max-w-lg"
//             initial={{ y: -10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.9, delay: 0.15 }}
//           >
//             Spin the bottle, pick a prompt, and let the game begin. Play with friends — on phone or big screen.
//           </motion.p>

//           <motion.div className="mt-8 flex gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
//             <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-xl transform hover:-translate-y-0.5 active:scale-95">
//               Signup
//             </button>
//             <button className="px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm">
//               Login
//             </button>
//             <button className="px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm">
//               How to play
//             </button>
//           </motion.div>

//           {/* small features */}
//           <div className="mt-8 grid grid-cols-2 gap-3 text-slate-200/80">
//             <div className="p-3 bg-white/3 rounded-lg">Private Rooms</div>
//             <div className="p-3 bg-white/3 rounded-lg">Custom Prompts</div>
//             <div className="p-3 bg-white/3 rounded-lg">Multiplayer</div>
//             <div className="p-3 bg-white/3 rounded-lg">Mobile Ready</div>
//           </div>
//         </div>

//         {/* Right: 3D-like rotating bottle (SVG inside a glass card) */}
//         <div className="flex-1 flex items-center justify-center">
//           <motion.div
//             className="relative w-[360px] h-[520px] rounded-3xl bg-gradient-to-b from-white/6 via-white/3 to-transparent border border-white/6 backdrop-blur-md shadow-2xl p-6"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <div className="absolute inset-0 flex items-center justify-center">
//               <motion.div
//                 className="rotate-0"
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
//                 style={{ width: 260, height: 520 }}
//               >
//                 <div className="flex items-center justify-center h-full">
//                   {/* Bottle shadow & pedestal  */}
//                     <div className="relative">
//                     <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-56 h-8 rounded-full bg-black/30 blur-sm" />
//                     <Bottle3D className="w-[260px] h-[440px]" />
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* subtle UI overlay at bottom of card */}
//             <div className="absolute left-6 right-6 bottom-6 flex items-center justify-between">
//               <div className="text-sm text-slate-200/80">Players ready: <strong>4</strong></div>
//               <div className="flex gap-2">
//                 <button className="px-3 py-2 rounded-lg bg-white/6">Invite</button>
//                 <button className="px-3 py-2 rounded-lg bg-emerald-500/80">Go Spin</button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Footer small credit */}
//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400/60">
//         Made with ❤️ — truth or dare ui
//       </div>
//     </div>
//   );
// }

// // import React, { useRef } from "react";
// // import { Canvas, useFrame } from "@react-three/fiber";
// // import { OrbitControls } from "@react-three/drei";

// // function Bottle() {
// //   const bottleRef = useRef();

// //   // Rotate bottle continuously
// //   useFrame(() => {
// //     bottleRef.current.rotation.z += 0.01; // Horizontal spin
// //   });

// //   return (
// //     <group ref={bottleRef}>
// //       {/* Bottle body */}
// //       <mesh>
// //         <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
// //         <meshStandardMaterial color="#22c55e" metalness={0.1} roughness={0.3} />
// //       </mesh>

// //       {/* Bottle neck */}
// //       <mesh position={[0, 1.2, 0]}>
// //         <cylinderGeometry args={[0.2, 0.2, 0.6, 32]} />
// //         <meshStandardMaterial color="#14532d" metalness={0.2} roughness={0.4} />
// //       </mesh>

// //       {/* Bottle cap */}
// //       <mesh position={[0, 1.6, 0]}>
// //         <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
// //         <meshStandardMaterial color="#0f172a" />
// //       </mesh>
// //     </group>
// //   );
// // }

// // export default function Bottle3D() {
// //   return (
// //     <div className="w-full h-screen bg-gray-100">
// //       <Canvas camera={{ position: [0, 0, 5] }}>
// //         <ambientLight intensity={0.5} />
// //         <directionalLight position={[5, 5, 5]} />
// //         <Bottle />
// //         <OrbitControls />
// //       </Canvas>
// //     </div>
// //   );
// // }
