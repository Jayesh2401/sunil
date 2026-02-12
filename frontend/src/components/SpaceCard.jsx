import { useMemo } from "react";

/**
 * SpaceCard Component
 * Large floating cards at the end of the space experience
 * These represent adjacent timeline items for navigation
 * 
 * Props:
 * - card: card data object {id, title, years, image}
 * - position: "left" or "right" positioning
 * - depthPosition: Z position in space (always at deepest point ~1900px)
 * - cameraZ: current camera depth
 * - isVisible: whether this card should be visible
 */

export function SpaceCard({
  card,
  position = "left",
  depthPosition,
  cameraZ,
  isVisible,
  onClick,
}) {
  // Calculate card appearance
  const distanceFromCamera = depthPosition - cameraZ;
  const appearanceRange = 600;

  // Opacity: fade in as camera reaches this depth
  const rawOpacity = 1 - Math.max(0, distanceFromCamera) / appearanceRange;
  const opacity = Math.max(0, Math.min(1, rawOpacity));

  // Scale: gets larger as camera approaches
  const scale = 0.5 + (1 - Math.max(0, distanceFromCamera) / appearanceRange) * 0.8;

  // 3D positioning based on left/right
  const xOffset = position === "left" ? -500 : 500;
  const rotationY = position === "left" ? 25 : -25;

  // Subtle Y rotation toward camera (looking slightly at camera)
  const lookAtCamera = Math.max(0, 1 - distanceFromCamera / appearanceRange) * 15;

  const transform = useMemo(() => {
    return {
      transform: `
        translate3d(${xOffset}px, 0px, ${distanceFromCamera}px)
        scale(${scale})
        rotateY(${rotationY + lookAtCamera}deg)
        rotateX(-5deg)
      `,
      opacity: isVisible ? opacity : 0,
      pointerEvents: opacity > 0.3 ? "auto" : "none",
    };
  }, [xOffset, distanceFromCamera, scale, rotationY, lookAtCamera, isVisible, opacity]);

  if (!card) return null;

  return (
    <div
      className="space-card-container"
      style={transform}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <article className="space-card">
        <div className="space-card-image">
          <img src={card.image} alt={card.title} loading="lazy" />
        </div>
        <div className="space-card-content">
          <h3>{card.title}</h3>
          <p className="space-card-years">{card.years}</p>
          <p className="space-card-cta">Click to explore →</p>
        </div>
      </article>
    </div>
  );
}
