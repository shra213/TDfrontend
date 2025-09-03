
//@ts-ignore
export default function TnDHeading({ variant = "neon", subtitle }) {
    return (
        <div className="flex flex-col items-center gap-2">
            {/* Neon bold */}
            {variant === "neon" && (
                <h1 className="font-game text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-400 to-yellow-300 drop-shadow-lg ">
                    TRUTH &amp; DARE
                </h1>
            )}

            {/* Playful handwritten */}
            {variant === "playful" && (
                <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Fredoka', 'Segoe UI', sans-serif" }}>
                    <span className="text-pink-500">Truth</span>
                    <span className="mx-3 text-gray-300"> & </span>
                    <span className="text-yellow-400">Dare</span>
                </h1>
            )}

            {/* Animated gradient + underline */}
            {variant === "wave" && (
                <div className="relative">
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-pink-300 to-yellow-300 animate-[gradientShift_6s_linear_infinite]">
                            TRUTH &amp; DARE
                        </span>
                    </h1>
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 h-1 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300 opacity-80" />
                </div>
            )}

            {/* Optional subtitle */}
            {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}

            {/* Inline styles for keyframes (Tailwind plugin required for real use, else put into global CSS) */}
            <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-[gradientShift_6s_linear_infinite] {
          background-size: 200% 200%;
          animation-name: gradientShift;
          animation-duration: 6s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
        </div>
    );
}
