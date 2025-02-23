import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Typography, TextField, Alert, Button } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const login = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", { username: username, password: password });
      navigate("/applications");
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  return (
    <div>
      {errorMessage &&
        <Alert severity="error" sx={{ display: "flex", alignItems: "center", height: "60px" }}>{errorMessage}</Alert>
      }

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 260 }}>
        <Typography variant="h5" sx={{ marginBottom: "10px" }}>Task Management System</Typography>

        <TextField value={username} label="Username" onChange={handleUsernameChange} sx={{ width: "400px", marginBottom: "10px" }} />
        <TextField value={password} label="Password" onChange={handlePasswordChange} sx={{ width: "400px", marginBottom: "10px" }} type="password" />

        <Button onClick={login}>Log in</Button>
      </div>
    </div>
  );
};

export default Login;