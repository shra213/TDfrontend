import { useRef, useState, useEffect } from "react";
import { getLidSegment, drawGlowSegment } from "./wheelEffects";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebaseconfig";
import { useParams } from "react-router-dom";

const BOTTLE_SRC = "/Beerbottle.png";

const TruthDareWheel = ({ cnt, players, started }: { cnt: number; players: any[]; started?: any }) => {
  console.log(started);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinSpeed, setSpinSpeed] = useState(0);
  const [winningSegments, setWinningSegments] = useState<{ lid: number | null; base: number | null }>({ lid: null, base: null });
  const { roomId } = useParams();

  const bottleImgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rotationRef = useRef(0);
  const speedRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const stoppedRef = useRef(true);

  const frictionRef = useRef(0.995);
  const minSpeedRef = useRef(0.002);

  const numSegments = cnt;

  const [canvasSize, setCanvasSize] = useState(500);
  const [outerRadius, setOuterRadius] = useState(200);
  const [dotDistance, setDotDistance] = useState(25);

  const [roomData, setRoomData] = useState<any>(null);

  // 📱 Make canvas responsive
  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth * 0.9, 500);
      setCanvasSize(width);
      setOuterRadius(width / 2.5);
      setDotDistance(width / 20);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 📡 Listen to Firestore room data
  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      setRoomData(data);

      const spin = data.spinState;

      if (spin && spin.spinSpeed > 0) {
        rotationRef.current = spin.rotation;
        setRotation(spin.rotation);
        setSpinSpeed(spin.spinSpeed);
        frictionRef.current = spin.friction;
        minSpeedRef.current = spin.minSpeed;
        stoppedRef.current = false;
      }
    });

    return () => unsub();
  }, [roomId]);

  // 🚀 Spin handle
  const handleSpin = async () => {
    if (numSegments < 2 || !stoppedRef.current) return;

    const currentUid = auth.currentUser?.uid;
    if (roomData?.lastAnswerer && currentUid !== roomData.lastAnswerer.id && roomData.lastAnswerer !== "anyone") {
      console.log("⛔ Only the last answerer can spin!");
      return;
    }
    if (!started) {
      alert("Game not started");
      return;
    }

    const initial = 0.32 + Math.random() * 0.08;
    const friction = 0.992 + Math.random() * 0.006;
    const minSpeed = 0.0015 + Math.random() * 0.001;

    try {
      const roomRef = doc(db, "rooms", roomId!);
      await updateDoc(roomRef, {
        spinState: { rotation: rotationRef.current, spinSpeed: initial, friction, minSpeed, startedBy: currentUid, startedAt: Date.now() },
      });
    } catch (err) {
      console.error("Error starting spin:", err);
    }
  };

  // Preload bottle
  useEffect(() => {
    const img = new Image();
    img.src = BOTTLE_SRC;
    img.onload = () => {
      bottleImgRef.current = img;
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  useEffect(() => { speedRef.current = spinSpeed; }, [spinSpeed]);

  // 🎨 Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const segAngle = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
      const start = i * segAngle;
      const end = (i + 1) * segAngle;
      const mid = start + segAngle / 2;

      // Highlight
      if (i === winningSegments.lid) drawGlowSegment(ctx, centerX, centerY, outerRadius, start, end, "#add8e6");
      else if (i === winningSegments.base) drawGlowSegment(ctx, centerX, centerY, outerRadius, start, end, "#fff");
      else {
        ctx.fillStyle = i % 2 === 0 ? "#ff4da6" : "#ff80bf";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, start, end);
        ctx.closePath();
        ctx.fill();
      }

      // Spoke
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + outerRadius * Math.cos(start), centerY + outerRadius * Math.sin(start));
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Player initial
      const player = players[i % players.length];
      const firstLetter = player?.name?.charAt(0).toUpperCase() || "?";
      const textX = centerX + (outerRadius + dotDistance) * Math.cos(mid);
      const textY = centerY + (outerRadius + dotDistance) * Math.sin(mid);

      ctx.save();
      ctx.font = `${Math.floor(canvasSize / 25)}px Arial`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(firstLetter, textX, textY);
      ctx.restore();
    }

    // Bottle
    if (imageLoaded && bottleImgRef.current) {
      const bottleSize = canvasSize / 2.5;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.drawImage(bottleImgRef.current, -bottleSize / 2, -bottleSize / 2, bottleSize, bottleSize);
      ctx.restore();
    }
  }, [rotation, winningSegments, imageLoaded, players, numSegments, canvasSize]);

  // 🌀 Spin loop
  useEffect(() => {
    if (spinSpeed <= 0) return;
    stoppedRef.current = false;

    const tick = () => {
      const nextRot = rotationRef.current + speedRef.current;
      const nextSpeed = speedRef.current * (frictionRef.current || 0.995);

      setRotation(nextRot);
      setSpinSpeed(nextSpeed);

      if (nextSpeed < (minSpeedRef.current || 0.002)) {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        setSpinSpeed(0);
        stoppedRef.current = true;

        const lidIdx = getLidSegment(nextRot, numSegments);
        const baseIdx = (lidIdx + Math.floor(numSegments / 2)) % numSegments;
        setWinningSegments({ lid: lidIdx, base: baseIdx });

        const asker = players[lidIdx % players.length];
        const answerer = players[baseIdx % players.length];

        setTimeout(async () => {
          if (!roomId) return;
          try {
            const roomRef = doc(db, "rooms", roomId);
            await updateDoc(roomRef, { asker, answerer, gameStatus: "choosing", lastAnswerer: answerer });
          } catch (err) { console.error(err); }
        }, 4000);

        setTimeout(() => setWinningSegments({ lid: null, base: null }), 4000);
        return;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [spinSpeed]);

  // 🖱 / touch hover
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateTitle = (x: number, y: number) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = Math.atan2(y - centerY, x - centerX);
      const adjusted = (angle + 2 * Math.PI) % (2 * Math.PI);
      const segAngle = (2 * Math.PI) / numSegments;
      const idx = Math.floor(adjusted / segAngle);
      const player = players[idx % players.length];
      canvas.title = player?.name || "";
    };

    const handleMouseMove = (e: MouseEvent) => updateTitle(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => updateTitle(e.touches[0].clientX, e.touches[0].clientY);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [players, numSegments]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        background: "purple",
        borderRadius: "50%",
        display: "block",
        margin: "auto",
        cursor: "pointer",
        touchAction: "none", // prevent scrolling while dragging
      }}
      onClick={handleSpin}
      onTouchStart={handleSpin}
    />
  );
};

export default TruthDareWheel;
