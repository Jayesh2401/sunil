import { useEffect } from "react";
import { FloatingImage } from "./FloatingImage";
import { SpaceCard } from "./SpaceCard";
import { useScroll3D } from "../hooks/useScroll3D";

/**
 * SpaceScene Component
 * Main 3D space environment with camera controls
 * 
 * Props:
 * - selectedItem: the currently selected exhibit
 * - leftItem: exhibit to the left on timeline
 * - rightItem: exhibit to the right on timeline
 * - exhibits: array of all exhibits (for content)
 * - onReachEnd: callback when user scrolls to end
 * - onNavigateBack: callback to return to timeline
 */

export function SpaceScene({
  selectedItem,
  leftItem,
  rightItem,
  exhibits,
  onReachEnd,
  onNavigateBack,
}) {
  const { sceneRef, cameraZ, cameraX, rotationY, isAtEnd, maxDepth } =
    useScroll3D(3000, 2000);

  // === CRITICAL: Large Z-axis spacing for depth perception ===
  // Each card is far apart in depth to create strong forward motion
  // Increased from 300px to 1500px between cards
  const depthSpacing = 1500;
  const depthPositions = {
    image1: 600,              // First card appears early
    image2: 600 + depthSpacing,
    image3: 600 + depthSpacing * 2,
    image4: 600 + depthSpacing * 3,
    finalCards: 600 + depthSpacing * 3.8,
  };

  // Create journey images with alternating left/right positioning
  const journeyImages = [
    {
      title: `${selectedItem.title} - Entry`,
      image: selectedItem.image,
      depth: depthPositions.image1,
      position: "left",
      index: 0,
    },
    {
      title: `${selectedItem.title} - Explore`,
      image: selectedItem.image,
      depth: depthPositions.image2,
      position: "right",
      index: 1,
    },
    {
      title: `${selectedItem.title} - Discover`,
      image: selectedItem.image,
      depth: depthPositions.image3,
      position: "left",
      index: 2,
    },
    {
      title: `${selectedItem.title} - Immerse`,
      image: selectedItem.image,
      depth: depthPositions.image4,
      position: "right",
      index: 3,
    },
  ];

  // Handle reaching the end of the space journey
  useEffect(() => {
    if (isAtEnd && onReachEnd) {
      onReachEnd();
    }
  }, [isAtEnd, onReachEnd]);

  // Handle escape key to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onNavigateBack?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigateBack]);

  return (
    <section className="space-scene" ref={sceneRef}>
      {/* Background starfield effect with parallax depth layers */}
      <div 
        className="starfield-background"
        style={{
          /* Multi-layer parallax: each layer moves at different speed */
          transform: `translateZ(${cameraZ * 0.15}px)`,
          /* Create depth fog effect that increases as camera moves forward */
          backgroundColor: `rgba(10, 10, 26, ${Math.min(0.3, cameraZ / 3000)})`,
        }}
      ></div>

      {/* Celestial destination (sun/moon) - rendered behind everything with slow parallax */}
      <div 
        className="celestial-destination"
        style={{
          /* Very slow parallax for distant celestial body */
          transform: `translateZ(${cameraZ * 0.08}px) translateX(${cameraX * 0.1}px)`,
        }}
      >
        <div className="celestial-glow"></div>
        <div className="celestial-body"></div>
      </div>

      {/* Main 3D perspective container */}
      <div className="space-viewport">
        {/* Scene group - everything moves with camera */}
        <div
          className="scene-group"
          style={{
            transform: `
              perspective(1200px)
              translateZ(${-cameraZ}px)
              translateX(${-cameraX}px)
              rotateY(${rotationY * 0.5}deg)
            `,
          }}
        >
          {/* Render journey images at various depths with alternating layout */}
          {journeyImages.map((imageData, idx) => (
            <FloatingImage
              key={`journey-${idx}`}
              image={imageData.image}
              title={imageData.title}
              depthPosition={imageData.depth}
              cameraZ={cameraZ}
              position={imageData.position}
              imageIndex={imageData.index}
            />
          ))}

          {/* Final navigation cards at deepest point */}
          <SpaceCard
            card={leftItem}
            position="left"
            depthPosition={depthPositions.finalCards}
            cameraZ={cameraZ}
            isVisible={true}
            onClick={() => {
              if (leftItem && onNavigateBack) {
                onNavigateBack(leftItem.id);
              }
            }}
          />

          <SpaceCard
            card={rightItem}
            position="right"
            depthPosition={depthPositions.finalCards}
            cameraZ={cameraZ}
            isVisible={true}
            onClick={() => {
              if (rightItem && onNavigateBack) {
                onNavigateBack(rightItem.id);
              }
            }}
          />

          {/* Depth corridor guides (invisible flight path markers) */}
          <div className="flight-path-markers">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={`marker-${n}`}
                className="flight-marker"
                style={{
                  transform: `translateZ(${n * 400}px)`,
                  opacity: Math.min(1, (cameraZ > n * 400 - 600 ? 1 : 0) + 0.05),
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* UI Overlays */}
      <div className="space-ui">
        {/* Back button / Instructions */}
        <button className="back-button" onClick={onNavigateBack} title="Return to timeline (ESC)">
          ← Back
        </button>

        {/* Camera depth indicator */}
        <div className="depth-indicator">
          <div className="depth-label">Journey Progress</div>
          <div className="depth-progress">
            <div
              className="depth-bar"
              style={{ width: `${(cameraZ / maxDepth) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Scroll instructions - fade out after interaction */}
        {cameraZ < 100 && (
          <div className="scroll-hint">
            <p>↑ Scroll to journey deeper into space</p>
            <p>← → Use arrow keys to drift left and right</p>
          </div>
        )}

        {/* End state message */}
        {isAtEnd && (
          <div className="end-message">
            <h2>Choose Your Destination</h2>
            <p>Click a card to explore its exhibit</p>
          </div>
        )}
      </div>
    </section>
  );
}
