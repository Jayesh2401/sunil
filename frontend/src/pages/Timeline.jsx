import { useNavigate } from "react-router-dom";
import { exhibits } from "../data/exhibits";
import { useMuseumMotion } from "../hooks/useMuseumMotion";

/**
 * Timeline Page
 * The main horizontal timeline view where users can select exhibits
 * 
 * Route: /
 */

export function Timeline() {
  const navigate = useNavigate();
  const { sectionRef, trackRef, timelineRef, arcRef } = useMuseumMotion(exhibits);

  const handleCardClick = (id, index) => {
    // Navigate to the detail space view
    navigate(`/detail/${id}`, {
      state: {
        fromIndex: index,
      },
    });
  };

  return (
    <main className="museum">
      <header className="topbar">
        <div className="brand">
          <span>Museum of</span>
          <strong>Digital Influence</strong>
        </div>
        <nav className="menu">
          <button>About</button>
          <button>Support Project</button>
        </nav>
      </header>

      <section
        className="h-scroll"
        ref={sectionRef}
        aria-label="Interactive gallery timeline"
      >
        <div className="sticky-scene">
          <div className="track" ref={trackRef}>
            {exhibits.map((item, index) => (
              <article
                key={item.id}
                className="panel"
                onClick={() => handleCardClick(item.id, index)}
                style={{ cursor: "pointer" }}
              >
                <h2>{item.title}</h2>
                <p className="years">{item.years}</p>
                <div className="portal">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
              </article>
            ))}
          </div>

          <div className="arc-overlay">
            <svg className="arc-svg" viewBox="0 0 1000 260" preserveAspectRatio="none">
              <path ref={arcRef} id="navArc" d="M 50 210 Q 500 80 950 210" />
            </svg>

            <div className="timeline" ref={timelineRef}></div>
            <p className="scroll-hint">Scroll to navigate • Click to explore</p>
          </div>
        </div>
      </section>
    </main>
  );
}
