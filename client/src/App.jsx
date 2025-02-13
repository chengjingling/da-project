import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Applications from "./pages/Applications";
import TaskBoard from "./pages/TaskBoard";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import PrivateRoutes from "./utils/PrivateRoutes";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<PrivateRoutes />}>
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:acronym" element={<TaskBoard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
  );
}

export default App;