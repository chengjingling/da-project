import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { TextField, Button } from "@mui/material";

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
    const response = await axios.post("http://localhost:8080/api/authenticateUser", { username: username, password: password });
    
    if (response.data.status === 200) {
      navigate("/users");
    } else {
      setErrorMessage("Username or password is incorrect.");
    }
  };

  return (
    <div>
      <Header />

      <TextField value={username} onChange={handleUsernameChange} placeholder="Username" />
      <TextField value={password} onChange={handlePasswordChange} placeholder="Password" />

      {errorMessage}

      <Button onClick={login}>Log in</Button>
    </div>
  );
};

export default Login;