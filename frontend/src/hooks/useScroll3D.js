import { useEffect, useRef, useState } from "react";

/**
 * useScroll3D Hook
 * Manages 3D camera movement based on scroll and horizontal input
 * 
 * Returns:
 * - sceneRef: ref to the 3D scene container
 * - cameraZ: vertical depth position (0 to maxZ)
 * - cameraX: horizontal position for lateral movement
 * - rotationY: Y-axis rotation for tilt effect
 * - isAtEnd: boolean indicating if user has scrolled to the deepest point
 */

export function useScroll3D(maxScrollDistance = 3000, maxDepth = 2000) {
  const sceneRef = useRef(null);
  const [cameraZ, setCameraZ] = useState(0);
  const [cameraX, setCameraX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Tracking state
  const scrollStateRef = useRef({
    currentZ: 0,
    targetZ: 0,
    currentX: 0,
    targetX: 0,
    currentRotY: 0,
    targetRotY: 0,
    rafId: null,
  });

  const inputStateRef = useRef({
    lastScrollY: 0,
    isDragging: false,
    lastX: 0,
    scrollVelocity: 0,
    horizontalVelocity: 0,
  });

  // Linear interpolation (lerp) function for smooth animation
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Easing function for smooth deceleration
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const state = scrollStateRef.current;
    const input = inputStateRef.current;

    // ===== SCROLL HANDLER =====
    const handleWheel = (e) => {
      e.preventDefault();

      // Vertical scroll → depth movement (Z-axis)
      // Scroll UP (negative deltaY) → move forward (increase Z)
      const verticalDelta = -e.deltaY * 0.3; // Scale factor for sensitivity
      state.targetZ = Math.max(0, Math.min(maxDepth, state.targetZ + verticalDelta));

      // Horizontal scroll → lateral movement (X-axis)
      // This supports trackpad horizontal scroll
      const horizontalDelta = e.deltaX * 0.2;
      state.targetX = Math.max(-300, Math.min(300, state.targetX + horizontalDelta));

      // Calculate rotation based on horizontal movement
      state.targetRotY = (state.targetX / 300) * 15; // Max 15 degrees rotation

      // Check if at end of scroll (90% of max depth)
      setIsAtEnd(state.targetZ >= maxDepth * 0.9);
    };

    // ===== KEYBOARD HANDLER =====
    const handleKeyDown = (e) => {
      const keyDelta = 50; // Movement amount per key press

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        state.targetZ = Math.max(0, state.targetZ - keyDelta);
        e.preventDefault();
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        state.targetZ = Math.min(maxDepth, state.targetZ + keyDelta);
        e.preventDefault();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.targetX = Math.max(-300, state.targetX - keyDelta);
        state.targetRotY = (state.targetX / 300) * 15;
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.targetX = Math.min(300, state.targetX + keyDelta);
        state.targetRotY = (state.targetX / 300) * 15;
        e.preventDefault();
      }

      setIsAtEnd(state.targetZ >= maxDepth * 0.9);
    };

    // ===== TOUCH/DRAG HANDLER (Mobile support) =====
    const handleTouchStart = (e) => {
      input.isDragging = true;
      input.lastX = e.touches[0].clientX;
      input.lastScrollY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!input.isDragging) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      // Vertical drag → depth
      const dragY = input.lastScrollY - touchY;
      state.targetZ = Math.max(0, Math.min(maxDepth, state.targetZ + dragY * 0.5));

      // Horizontal drag → lateral movement
      const dragX = touchX - input.lastX;
      state.targetX = Math.max(-300, Math.min(300, state.targetX + dragX * 0.3));
      state.targetRotY = (state.targetX / 300) * 15;

      input.lastX = touchX;
      input.lastScrollY = touchY;

      setIsAtEnd(state.targetZ >= maxDepth * 0.9);
    };

    const handleTouchEnd = () => {
      input.isDragging = false;
    };

    // ===== ANIMATION LOOP =====
    const animate = () => {
      // Smooth interpolation with easing for cinematic feel
      const smoothFactor = 0.12; // Higher = snappier, Lower = smoother
      state.currentZ = lerp(state.currentZ, state.targetZ, smoothFactor);
      state.currentX = lerp(state.currentX, state.targetX, smoothFactor);
      state.currentRotY = lerp(state.currentRotY, state.targetRotY, smoothFactor);

      // Update React state
      setCameraZ(state.currentZ);
      setCameraX(state.currentX);
      setRotationY(state.currentRotY);

      // Continue animation loop
      state.rafId = requestAnimationFrame(animate);
    };

    // ===== EVENT LISTENER SETUP =====
    scene.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    scene.addEventListener("touchstart", handleTouchStart, { passive: true });
    scene.addEventListener("touchmove", handleTouchMove, { passive: true });
    scene.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Start animation loop
    state.rafId = requestAnimationFrame(animate);

    // ===== CLEANUP =====
    return () => {
      scene.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      scene.removeEventListener("touchstart", handleTouchStart);
      scene.removeEventListener("touchmove", handleTouchMove);
      scene.removeEventListener("touchend", handleTouchEnd);
      if (state.rafId) cancelAnimationFrame(state.rafId);
    };
  }, [maxDepth]);

  return {
    sceneRef,
    cameraZ,
    cameraX,
    rotationY,
    isAtEnd,
    maxDepth,
  };
}
