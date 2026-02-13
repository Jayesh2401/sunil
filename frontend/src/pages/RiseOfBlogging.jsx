import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RiseOfBlogging.css";

/**
 * RiseOfBlogging - 3D Space Journey Experience
 * An immersive cosmic journey through 5 iconic moments in blogging history
 */

const CARDS_DATA = [
  {
    id: 1,
    image: "riseofblogging/img1.jpg",
    year: "1996",
    title: "First Blog",
    description: "The genesis of digital publishing. A lone voice emerges from the silence of the early internet, marking the birth of personal web publishing.",
  },
  {
    id: 2,
    image: "riseofblogging/img2.jpg",
    year: "1999",
    title: "The Awakening",
    description: "Platforms ignite. Tools emerge to democratize publishing. Thousands begin to share their stories simultaneously across the global web.",
  },
  {
    id: 3,
    image: "riseofblogging/img3.jpg",
    year: "2004",
    title: "The Explosion",
    description: "Millions bloom. Blogging becomes a cultural phenomenon. Every voice finds an audience. The digital revolution reaches critical mass.",
  },
  {
    id: 4,
    image: "riseofblogging/img4.jpg",
    year: "2008",
    title: "The Evolution",
    description: "Maturation arrives. Blogging transforms from novelty to necessity. Professional voices, influence, and real impact reshape the landscape.",
  },
  {
    id: 5,
    image: "riseofblogging/img5.jpg",
    year: "2024",
    title: "The Legacy",
    description: "From blogs to platforms, the spirit of personal publishing lives on. Creators worldwide inherit the legacy of those first digital voices.",
  },
];

const lerp = (start, end, t) => start + (end - start) * t;

export function RiseOfBlogging() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [depth, setDepth] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [smoothDepth, setSmoothDepth] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef(null);
  const depthRef = useRef(0);
  const smoothDepthRef = useRef(0);
  const animationFrameRef = useRef(null);

  const maxDepth = 5 * 1000; // 5 cards, 1000px depth spacing each
  const depthPerCard = maxDepth / (CARDS_DATA.length - 1);

  // Initialize with useEffect to start at outermost position (img5)
  useEffect(() => {
    depthRef.current = maxDepth;
    smoothDepthRef.current = maxDepth;
    setSmoothDepth(maxDepth);
  }, []);

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      smoothDepthRef.current = lerp(
        smoothDepthRef.current,
        depthRef.current,
        0.08
      );
      setSmoothDepth(smoothDepthRef.current);

      // Calculate active card based on current depth
      const cardIndex = Math.round(smoothDepthRef.current / depthPerCard);
      const clampedIndex = Math.min(cardIndex, CARDS_DATA.length - 1);
      setActiveCardIndex(clampedIndex);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [depthPerCard]);

  // Handle scroll
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();

      // Scroll up (negative deltaY) = go deeper (decrease depth toward img1)
      // Scroll down (positive deltaY) = come out (increase depth toward img5)
      const scrollDelta = e.deltaY > 0 ? -50 : 50;
      depthRef.current = Math.max(
        0,
        Math.min(maxDepth, depthRef.current + scrollDelta)
      );

      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [maxDepth]);

  // Handle mouse move for 3D tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouseX(x);
      setMouseY(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate progress percentage (reversed: start at 0, fill as we go deep)
  const progressPercent = ((maxDepth - smoothDepth) / maxDepth) * 100;

  // Get visibility and position for each card
  const getCardState = (cardIndex) => {
    const cardDepthCenter = cardIndex * depthPerCard;
    const distanceFromActive = Math.abs(smoothDepth - cardDepthCenter);
    const depthWindow = depthPerCard * 1.2;

    let visible = false;
    let isActive = false;
    let opacity = 0;
    let scale = 0.8;
    let blurAmount = 15;
    let zOffset = 0;

    if (distanceFromActive <= depthWindow) {
      visible = true;
      const proximity = 1 - distanceFromActive / depthWindow;

      if (proximity > 0.85) {
        isActive = true;
        opacity = 1;
        scale = 1;
        blurAmount = 0;
        zOffset = 0;
      } else {
        opacity = proximity * 0.7;
        scale = 0.8 + proximity * 0.2;
        blurAmount = 15 - proximity * 14;
        zOffset = -200;
      }
    }

    return { visible, isActive, opacity, scale, blurAmount, zOffset };
  };

  return (
    <div className="rise-of-blogging-container" ref={containerRef}>
      {/* Premium Space Background */}
      <div className="space-bg">
        <div className="bg-gradient-primary"></div>
        <div className="bg-gradient-secondary"></div>
        <div className="starfield"></div>
        <div className="nebula nebula-1"></div>
        <div className="nebula nebula-2"></div>
        <div className="nebula nebula-3"></div>
        <div className="nebula nebula-4"></div>
        <div className="nebula nebula-5"></div>
        <div className="particle-field"></div>
        <div className="cosmic-dust dust-1"></div>
        <div className="cosmic-dust dust-2"></div>
        <div className="cosmic-dust dust-3"></div>
        <div className="aurora-light aurora-1"></div>
        <div className="aurora-light aurora-2"></div>
        <div className="star-burst"></div>
      </div>

      {/* 3D Viewport */}
      <div className="viewport" style={{
        perspective: "800px",
      }}>
        <div className="scene-container" style={{
          transform: `
            perspective(800px)
            rotateX(${mouseY * 8}deg)
            rotateY(${mouseX * 8}deg)
            translateZ(${mouseX * 50}px)
          `,
        }}>
          {/* Cards */}
          {CARDS_DATA.map((card, index) => {
            const state = getCardState(index);
            if (!state.visible) return null;

            // Determine entry side (alternating: right, left, right, left, right)
            let entrySide = "right";
            let imagePosition = "right"; // img1 on right
            let contentPosition = "left"; // content on left

            if (index === 1) {
              entrySide = "left";
              imagePosition = "left";
              contentPosition = "right";
            } else if (index === 2) {
              entrySide = "right";
              imagePosition = "right";
              contentPosition = "left";
            } else if (index === 3) {
              entrySide = "left";
              imagePosition = "left";
              contentPosition = "right";
            } else if (index === 4) {
              entrySide = "right";
              imagePosition = "right";
              contentPosition = "left";
            }

            const xOffset = imagePosition === "left" ? -300 : imagePosition === "right" ? 300 : 0;

            return (
              <div
                key={card.id}
                className="card-wrapper"
                style={{
                  transform: `
                    translateZ(${-smoothDepth + (index * depthPerCard)}px)
                    translate(calc(-50% + ${xOffset}px), -50%)
                    scale(${state.scale})
                  `,
                  opacity: state.opacity,
                  pointerEvents: state.isActive ? "auto" : "none",
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Image Card Only */}
                <div className={`journey-card image-card ${state.visible ? "visible" : ""} ${state.isActive ? "active" : ""}`}>
                  <div className="card-image-wrapper">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="card-image"
                      style={{
                        filter: `blur(${state.blurAmount}px)`,
                      }}
                    />
                    <div className="card-image-overlay"></div>
                  </div>
                  <div className="card-glow" style={{ opacity: state.isActive ? 1 : 0.3 }}></div>
                </div>

                {/* Content Card (separate) */}
                {imagePosition !== "center" && (
                  <div className={`journey-card content-card ${contentPosition} ${state.visible ? "visible" : ""} ${state.isActive ? "active" : ""}`}>
                    <div className="card-content">
                      <div className="card-year">{card.year}</div>
                      <h2 className="card-title">{card.title}</h2>
                      <p className="card-description">{card.description}</p>
                    </div>
                  </div>
                )}

                {/* For center card (card 1) - content inside */}
                {imagePosition === "center" && (
                  <div className="card-content-overlay">
                    <div className="card-year">{card.year}</div>
                    <h2 className="card-title">{card.title}</h2>
                    <p className="card-description">{card.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="progress-tracker">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="progress-dots">
          {CARDS_DATA.map((_, index) => {
            // Reverse the index for dots: first dot represents img5, last dot represents img1
            const reversedIndex = CARDS_DATA.length - 1 - index;
            return (
              <div
                key={index}
                className={`progress-dot ${reversedIndex === activeCardIndex ? "active" : ""}`}
                style={{
                  animationDelay: reversedIndex === activeCardIndex ? "0s" : "0.2s",
                }}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className={`scroll-hint ${isScrolling ? "hidden" : ""}`}>
        <div className="hint-icon">⬆</div>
        <p>Scroll to journey deeper into space</p>
      </div>

      {/* Back Button */}
      <button 
        className="back-button"
        onClick={() => navigate("/")}
        title="Go back to museum"
      >
        ← Back
      </button>
    </div>
  );
}
