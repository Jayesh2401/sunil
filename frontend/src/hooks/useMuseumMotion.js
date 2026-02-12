import { useEffect, useRef } from "react";

export function useMuseumMotion(exhibits) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const timelineRef = useRef(null);
  const arcRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const timeline = timelineRef.current;
    const arcPath = arcRef.current;

    if (!section || !track || !timeline || !arcPath) return;

    let maxTranslate = 0;
    let sectionTop = 0;
    let currentX = 0;
    let targetX = 0;
    let rafId = 0;
    let lastActiveIndex = -1;

    const dots = [];
    const labels = [];

    function createTimeline() {
      timeline.innerHTML = "";
      dots.length = 0;
      labels.length = 0;

      exhibits.forEach((item, index) => {
        const dot = document.createElement("button");
        dot.className = "dot";
        dot.type = "button";
        dot.dataset.index = index;

        const label = document.createElement("div");
        label.className = "dot-label";
        label.innerHTML = `${item.title}<span>${item.years}</span>`;

        dot.addEventListener("click", () => jumpTo(index));

        timeline.append(dot, label);
        dots.push(dot);
        labels.push(label);
      });

      updateArcPositions();
      setActiveDot(0);
    }

    function updateArcPositions() {
      const pathLength = arcPath.getTotalLength();

      dots.forEach((dot, index) => {
        const t = exhibits.length === 1 ? 0.5 : index / (exhibits.length - 1);
        const point = arcPath.getPointAtLength(pathLength * t);

        dot.style.left = `${point.x / 10}%`;
        dot.style.top = `${point.y / 2.6}%`;

        labels[index].style.left = `${point.x / 10}%`;
        labels[index].style.top = `${point.y / 2.6 + 7.5}%`;
      });
    }

    function resizeScene() {
      maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth + 24);
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      section.style.height = `${window.innerHeight + maxTranslate + window.innerHeight * 0.25}px`;
      updateArcPositions();
      syncTargetWithScroll();
    }

    function syncTargetWithScroll() {
      const localScroll = window.scrollY - sectionTop;
      const maxLocal = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, localScroll / Math.max(1, maxLocal)));
      targetX = -progress * maxTranslate;
    }

    function setActiveDot(index) {
      if (index === lastActiveIndex) return;
      dots[lastActiveIndex]?.classList.remove("active");
      dots[index]?.classList.add("active");
      lastActiveIndex = index;
    }

    function jumpTo(index) {
      const progress = index / (exhibits.length - 1);
      const maxLocal = section.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: sectionTop + progress * maxLocal,
        behavior: "smooth",
      });
    }

    function animate() {
      currentX += (targetX - currentX) * 0.09;
      track.style.transform = `translate3d(${currentX}px,0,0)`;

      const progress = maxTranslate ? -currentX / maxTranslate : 0;
      const activeIndex = Math.round(progress * (exhibits.length - 1));
      setActiveDot(activeIndex);

      rafId = requestAnimationFrame(animate);
    }

    createTimeline();
    resizeScene();
    syncTargetWithScroll();

    window.addEventListener("scroll", syncTargetWithScroll, { passive: true });
    window.addEventListener("resize", resizeScene);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", syncTargetWithScroll);
      window.removeEventListener("resize", resizeScene);
    };
  }, [exhibits]);

  return { sectionRef, trackRef, timelineRef, arcRef };
}
