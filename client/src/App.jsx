import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Applications from "./pages/Applications";
import Users from "./pages/Users";
import PrivateRoutes from "./utils/PrivateRoutes";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<PrivateRoutes />}>
          <Route path="/applications" element={<Applications />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
  );
}

export default App;