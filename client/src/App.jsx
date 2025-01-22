import { Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Users from './pages/Users';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<Users />} />
      </Routes>
  );
}

export default App;