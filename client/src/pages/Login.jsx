import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8080/api/logout");
  }, []);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const login = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/login", { username: username, password: password });
      
      if (response.data.group === "admin") {
        navigate("/users");
      } else {
        navigate("/applications");
      }
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 200 }}>
      <h2>Task Management System</h2>

      <TextField value={username} onChange={handleUsernameChange} placeholder="Username" sx={{ width: "400px" }} />
      <TextField value={password} onChange={handlePasswordChange} placeholder="Password" sx={{ width: "400px", marginBottom: "10px" }} />

      <span style={{ color: "#ff0000" }}>{errorMessage}</span>

      <Button onClick={login}>Log in</Button>
    </div>
  );
};

export default Login;