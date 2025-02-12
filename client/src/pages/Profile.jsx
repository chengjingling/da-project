import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Typography, TextField, Alert, Button } from "@mui/material";

const Profile = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
  
    const navigate = useNavigate();

    const retrieveUser = async () => {
      const response = await axios.get("http://localhost:8080/api/user/retrieveUser");

      setUsername(response.data.user.user_username);

      if (response.data.user.user_email === "") {
        setEmail("No email");
      } else {
        setEmail(response.data.user.user_email);
      }
    };

    useEffect(() => {
      retrieveUser();
    }, []);
  
    const handleEmailChange = (event) => {
      setNewEmail(event.target.value);
    };
  
    const handlePasswordChange = (event) => {
      setNewPassword(event.target.value);
    };
  
    const updateProfile = async () => {
      try {
        const response = await axios.patch("http://localhost:8080/api/user/updateProfile", { email: newEmail, password: newPassword });
        navigate(0);
      } catch (error) {
        setErrorMessage(error.response.data.message);
      }
    };
  
    return (
      <div style={{ paddingTop: 65 }}>
        <Header />

        {errorMessage &&
          <Alert severity="error" sx={{ display: "flex", alignItems: "center", height: "60px" }}>{errorMessage}</Alert>
        }

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 200 }}>
          <Typography variant="h5" sx={{ marginBottom: "10px" }}>Profile</Typography>

          <TextField value={username} label="Username" sx={{ width: "400px", marginBottom: "10px" }} disabled />
          <TextField value={email} label="Email" sx={{ width: "400px", marginBottom: "10px" }} disabled />
          <TextField value={newEmail} label="Update email" onChange={handleEmailChange} sx={{ width: "400px", marginBottom: "10px" }} />
          <TextField value={newPassword} label="Update password" onChange={handlePasswordChange} sx={{ width: "400px", marginBottom: "10px" }} type="password" />

          <Button onClick={updateProfile}>Update</Button>
        </div>
      </div>
    );
};

export default Profile;