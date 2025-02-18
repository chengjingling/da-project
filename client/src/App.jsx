import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Applications from "./pages/Applications";
import TaskBoard from "./pages/TaskBoard";
import ViewTask from "./pages/ViewTask";
import CreateTask from "./pages/CreateTask";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import PrivateRoutes from "./utils/PrivateRoutes";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<PrivateRoutes />}>
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:appAcronym" element={<TaskBoard />} />
          <Route path="/applications/:appAcronym/:taskId" element={<ViewTask />} />
          <Route path="/applications/:appAcronym/createTask" element={<CreateTask />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
  );
}

export default App;