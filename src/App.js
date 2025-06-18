import "./App.scss";
import CrossMatchSearch from "./CrossMatchSearch";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/crossmatch_cancellation"
            element={<CrossMatchSearch />}
          />
          <Route
            path="/crossmatch_confirmation"
            element={<CrossMatchSearch />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
