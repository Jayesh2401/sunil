import { useMemo } from "react";

/**
 * FloatingImage Component - Enhanced with depth focus and exit tilt logic
 * 
 * Implements:
 * - One-card focus system (only one card is dominant)
 * - Tilt timing (cards enter flat, exit with tilt)
 * - Better opacity and scale for depth perception
 * - Alternating left/right layout with central corridor
 */

export function FloatingImage({
  image,
  title,
  depthPosition,
  cameraZ,
  position = "center",
  imageIndex = 0,
}) {
  const distanceFromCamera = depthPosition - cameraZ;

  // === ONE-CARD FOCUS SYSTEM ===
  // Define focus zone where card is dominant
  // Extended range for 1500px spacing between cards (vs previous 300px)
  const focusZoneStart = 2000;  // Start fading in early with large spacing
  const focusZoneEnd = -1500;   // Extended exit zone for gradual fade
  const focusCenter = 200;      // Sweet spot - card most visible here

  // Calculate if card is in focus zone
  const isInFocusZone = distanceFromCamera > focusZoneEnd && distanceFromCamera < focusZoneStart;

  // === OPACITY CALCULATION ===
  // Smooth fade in ahead, dominant at focus center, smooth fade out behind
  let opacity = 0;

  if (distanceFromCamera > focusZoneEnd && distanceFromCamera < focusZoneStart) {
    // Card is visible
    if (distanceFromCamera >= focusCenter) {
      // Approaching from ahead - fade in
      const approachProgress = (distanceFromCamera - focusCenter) / (focusZoneStart - focusCenter);
      opacity = 1 - Math.max(0, approachProgress);
    } else {
      // Passing card - fade out
      const exitProgress = -distanceFromCamera / Math.abs(focusZoneEnd - focusCenter);
      opacity = 1 - Math.max(0, exitProgress);
    }
  }
  opacity = Math.max(0, Math.min(1, opacity));

  // === SCALE CALCULATION ===
  // Cards are largest when directly at focus center
  let scale = 0.6; // Minimum scale for distant cards
  
  if (isInFocusZone) {
    const focusRange = focusZoneStart - focusZoneEnd;
    const distanceFromCenter = Math.abs(distanceFromCamera - focusCenter);
    const focusFactor = 1 - (distanceFromCenter / focusRange);
    scale = 0.6 + focusFactor * 0.7; // Scale from 0.6 to 1.3
  }

  // === CARD ORIENTATION LOGIC ===
  // Cards enter straight, exit with tilt and drift
  let xOffset = 0;
  let rotationY = 0;
  let driftX = 0;

  // Base position based on left/right
  if (position === "left") {
    xOffset = -650; // Consistent left position
  } else if (position === "right") {
    xOffset = 650;  // Consistent right position
  }

  // Exit tilt logic - only apply when card has passed camera
  if (distanceFromCamera < focusCenter) {
    // Card is exiting (behind camera)
    const exitProgress = Math.min(1, -distanceFromCamera / 400);
    
    // Apply subtle tilt away
    if (position === "left") {
      rotationY = -exitProgress * 25; // Tilt left card away left
      driftX = -exitProgress * 150;   // Drift left
    } else if (position === "right") {
      rotationY = exitProgress * 25;  // Tilt right card away right
      driftX = exitProgress * 150;    // Drift right
    }
  } else {
    // Card is entering or at focus - keep it straight
    rotationY = 0;
    driftX = 0;
  }

  // === TRANSFORM OBJECT ===
  const transform = useMemo(() => {
    return {
      transform: `
        translate3d(${xOffset + driftX}px, 0px, ${distanceFromCamera}px)
        scale(${scale})
        rotateY(${rotationY}deg)
      `,
      opacity: opacity,
      pointerEvents: opacity > 0.1 ? "auto" : "none",
    };
  }, [xOffset, driftX, distanceFromCamera, scale, rotationY, opacity]);

  return (
    <div className="floating-image-container" style={transform}>
      <figure className="floating-image">
        <img src={image} alt={title} loading="lazy" />
        <figcaption>{title}</figcaption>
      </figure>
    </div>
  );
}
