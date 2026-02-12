import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Timeline } from "./pages/Timeline";
import { SpaceDetail } from "./pages/SpaceDetail";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="/detail/:id" element={<SpaceDetail />} />
      </Routes>
    </Router>
  );
}
