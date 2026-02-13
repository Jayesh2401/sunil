import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Museum from "./components/Museum";
import { RiseOfBlogging } from "./pages/RiseOfBlogging";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Museum />} />
        <Route path="/museum" element={<Museum />} />
        <Route path="/riseofblogging" element={<RiseOfBlogging />} />
      </Routes>
    </Router>
  );
}
