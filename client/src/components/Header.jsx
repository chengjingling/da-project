import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [username, setUsername] = useState("");
  const [groups, setGroups] = useState([]);

  const navigate = useNavigate();

  const retrieveUserGroups = async () => {
    const response = await axios.get("http://localhost:8080/api/retrieveUserGroups");
    setUsername(response.data.username);
    const groupsArray = response.data.groups.map(group => group.groupName);
    setGroups(groupsArray);
  };

  useEffect(() => {
    retrieveUserGroups();
  }, []);

  const logout = async () => {
    const response = await axios.get("http://localhost:8080/api/logout");
    navigate("/");
  };

  return (
    <AppBar sx={{ backgroundColor: "#424242" }}>
      <Toolbar>
        <Typography variant="h6">Task Management System</Typography>
        <NavLink to="/applications" style={{ color: "#fff", textDecoration: "none", marginLeft: 20 }} onMouseEnter={(e) => e.target.style.color = "#556cd6"} onMouseLeave={(e) => e.target.style.color = "#fff"}>Task Management</NavLink>
        {groups.includes("admin") &&
          <NavLink to="/users" style={{ color: "#fff", textDecoration: "none", marginLeft: 20 }} onMouseEnter={(e) => e.target.style.color = "#556cd6"} onMouseLeave={(e) => e.target.style.color = "#fff"}>User Management</NavLink>
        }
        <Box sx={{ flexGrow: 1 }} />
        <Typography sx={{ fontStyle: "italic" }}>Logged in as: {username}</Typography>
        <NavLink to="/profile" style={{ color: "#fff", textDecoration: "none", marginLeft: 20 }} onMouseEnter={(e) => e.target.style.color = "#556cd6"} onMouseLeave={(e) => e.target.style.color = "#fff"}>Profile</NavLink>
        <NavLink onClick={logout} style={{ color: "#fff", textDecoration: "none", marginLeft: 20 }} onMouseEnter={(e) => e.target.style.color = "#556cd6"} onMouseLeave={(e) => e.target.style.color = "#fff"}>Log Out</NavLink>
      </Toolbar>
    </AppBar>
  );
};

export default Header;