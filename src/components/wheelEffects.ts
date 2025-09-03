// wheelEffects.ts

// ✨ Tweak this if your bottle image's lid isn't exactly to the left when rotation = 0.
// -π/2 means "lid points left" in the unrotated image.
export const BOTTLE_LID_OFFSET: number = -Math.PI / 2;

// Normalize any angle to [0, 2π)
export function wrapAngle(rad: number): number {
  const twoPi = Math.PI * 2;
  let a = rad % twoPi;
  if (a < 0) a += twoPi;
  return a;
}

// Return the angle (0..2π) where the lid points, given current rotation
export function lidAngle(rotation: number): number {
  return wrapAngle(rotation + BOTTLE_LID_OFFSET);
}

// Map an angle (0..2π) to a segment index [0..numSegments-1]
export function angleToSegment(theta: number, numSegments: number): number {
  const seg = (Math.PI * 2) / numSegments;
  return Math.floor(theta / seg) % numSegments;
}

// Convenience: get which segment is under the lid
export function getLidSegment(rotation: number, numSegments: number): number {
  return angleToSegment(lidAngle(rotation), numSegments);
}

// Fancy glow for the chosen segment (neon gradient + sparkles)
// wheelEffects.js
export function drawGlowSegment(ctx: any, cx: any, cy: any, radius: any, start: any, end: any, color = "#ff66cc") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, start, end);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
