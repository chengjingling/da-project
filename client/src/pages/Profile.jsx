import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { TextField, Alert, Button } from "@mui/material";

const Profile = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
  
    const navigate = useNavigate();

    const retrieveUser = async () => {
      const response = await axios.get("http://localhost:8080/api/retrieveUser");
      setEmail(response.data.user.email);
    };

    useEffect(() => {
      retrieveUser();
    }, []);
  
    const handleEmailChange = (event) => {
      setEmail(event.target.value);
    };
  
    const handlePasswordChange = (event) => {
      setPassword(event.target.value);
    };
  
    const updateProfile = async () => {
      try {
        const response = await axios.patch("http://localhost:8080/api/updateProfile", { email: email, password: password });
        navigate(0);
      } catch (error) {
        setErrorMessage(error.response.data.message);
      }
    };
  
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 200 }}>
            <Header />

            <h2>Profile</h2>

            <TextField value={email} onChange={handleEmailChange} placeholder="Email" sx={{ width: "400px" }} />
            <TextField value={password} onChange={handlePasswordChange} placeholder="Reset password" sx={{ width: "400px", marginBottom: "10px" }} type="password" />

            {errorMessage &&
              <Alert severity="error" sx={{ display: "flex", alignItems: "center", height: "60px", marginBottom: "10px" }}>{errorMessage}</Alert>
            }

            <Button onClick={updateProfile}>Update</Button>
        </div>
    );
};

export default Profile;