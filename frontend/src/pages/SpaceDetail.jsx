import { useNavigate, useParams } from "react-router-dom";
import { SpaceScene } from "../components/SpaceScene";
import { exhibits } from "../data/exhibits";

/**
 * SpaceDetail Page
 * The 3D space detail view for a museum exhibit
 * 
 * Route: /detail/:id
 * Query params: 
 * - from: current index on timeline (for navigation context)
 */

export function SpaceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find the selected exhibit
  const selectedIndex = exhibits.findIndex((item) => item.id === id);
  const selectedItem = exhibits[selectedIndex];

  // Get neighboring items for navigation
  const leftItem = selectedIndex > 0 ? exhibits[selectedIndex - 1] : null;
  const rightItem = selectedIndex < exhibits.length - 1 ? exhibits[selectedIndex + 1] : null;

  if (!selectedItem) {
    return (
      <div className="error-container">
        <h2>Exhibit not found</h2>
        <button onClick={() => navigate("/")}>Return to Timeline</button>
      </div>
    );
  }

  const handleNavigateBack = (nextId = null) => {
    if (nextId) {
      // Navigate to the next exhibit
      navigate(`/detail/${nextId}`);
    } else {
      // Return to main timeline
      navigate("/");
    }
  };

  return (
    <SpaceScene
      selectedItem={selectedItem}
      leftItem={leftItem}
      rightItem={rightItem}
      exhibits={exhibits}
      onReachEnd={() => {
        // Optional callback when reaching the end
        console.log("Reached end of space journey");
      }}
      onNavigateBack={handleNavigateBack}
    />
  );
}
