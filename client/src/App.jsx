import { Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Applications from "./pages/Applications";
import Users from './pages/Users';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/users" element={<Users />} />
      </Routes>
  );
}

export default App;