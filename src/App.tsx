import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to the Home Page</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
