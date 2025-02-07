import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import Header from "../components/Header";
import { Alert, Typography, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, Checkbox, ListItemText, Switch } from "@mui/material";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [groupsSelect, setGroupsSelect] = useState([]);
  const [statusToggle, setStatusToggle] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const checkPermission = async () => {
    const response = await axios.get("http://localhost:8080/api/checkPermission");
    
    if (!response.data.isAdmin) {
      const response = await axios.get("http://localhost:8080/api/logout");
      navigate("/");
    }
  };

  const checkAccountStatus = async () => {
    const response = await axios.get("http://localhost:8080/api/checkAccountStatus");
    
    if (!response.data.isEnabled) {
      const response = await axios.get("http://localhost:8080/api/logout");
      navigate("/");
    }
  };

  const retrieveUsersAndGroups = async () => {
    const usersResponse = await axios.get("http://localhost:8080/api/retrieveUsers");
    const groupsResponse = await axios.get("http://localhost:8080/api/retrieveGroups");
    
    const usersArray = usersResponse.data.users.map(user => ({ ...user, newPassword: "", selectedGroups: groupsResponse.data[user.username] ? groupsResponse.data[user.username] : [] }));

    setUsers(usersArray);
    setGroups(groupsResponse.data.all);
  };

  useEffect(() => {
    checkPermission();
    checkAccountStatus();
    retrieveUsersAndGroups();
  }, []);

  const CG_handleGroupInputChange = (event) => {
    setGroupInput(event.target.value);
  };

  const createGroup = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/createGroup", { groupName: groupInput });
      navigate(0);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const CU_handleUsernameChange = (event) => {
    setUsernameInput(event.target.value);
  };

  const CU_handlePasswordChange = (event) => {
    setPasswordInput(event.target.value);
  };

  const CU_handleEmailChange = (event) => {
    setEmailInput(event.target.value);
  };

  const CU_handleGroupsChange = (event) => {
    setGroupsSelect(event.target.value);
  };

  const CU_handleStatusChange = (event) => {
    setStatusToggle(event.target.checked);
  };

  const createUser = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/createUser", { username: usernameInput, password: passwordInput, email: emailInput, groups: groupsSelect, enabled: statusToggle });
      navigate(0);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const UU_handlePasswordChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].newPassword = event.target.value;
    setUsers(newUsers);
  };

  const UU_handleEmailChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].email = event.target.value;
    setUsers(newUsers);
  };

  const UU_handleGroupsChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].selectedGroups = event.target.value;
    setUsers(newUsers);
  };

  const UU_handleStatusChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].enabled = event.target.checked;
    setUsers(newUsers);
  };

  const updateUser = async (index) => {
    try {
      const response = await axios.put("http://localhost:8080/api/updateUser", users[index]);
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
        <Typography variant="h4" sx={{ marginLeft: "10px" }}>Users</Typography>
        
        <div style={{ display: "flex", alignItems: "center" }}>
          Group name:
          <TextField value={groupInput} onChange={CG_handleGroupInputChange} sx={{ marginLeft: "10px" }} />
          <Button onClick={createGroup}>Create</Button>
        </div>
      </div>
        
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Password</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Account status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell><TextField value={usernameInput} onChange={(event) => CU_handleUsernameChange(event)} placeholder="Enter username" /></TableCell>
            <TableCell><TextField value={passwordInput} onChange={(event) => CU_handlePasswordChange(event)} placeholder="Enter password" type="password" /></TableCell>
            <TableCell><TextField value={emailInput} onChange={(event) => CU_handleEmailChange(event)} placeholder="Enter email" /></TableCell>
            <TableCell>
              <Select
                multiple
                value={groupsSelect}
                onChange={(event) => CU_handleGroupsChange(event)}
                renderValue={(selected) => selected.join(", ")}
                sx={{ width: "150px" }}
              >
                {groups.map((group) => (
                  <MenuItem key={group} value={group}>
                    <Checkbox checked={groupsSelect.includes(group)} />
                    <ListItemText primary={group} />
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell><Switch checked={statusToggle} onChange={(event) => CU_handleStatusChange(event)} /></TableCell>
            <TableCell><Button onClick={() => createUser()}>Create</Button></TableCell>
          </TableRow>

          {users.map((user, index) => {
            return (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
                <TableCell><TextField value={user.newPassword} onChange={(event) => UU_handlePasswordChange(index, event)} placeholder="Reset password" type="password" /></TableCell>
                <TableCell><TextField value={user.email} onChange={(event) => UU_handleEmailChange(index, event)} placeholder="Enter email" /></TableCell>
                <TableCell>
                  <Select
                    multiple
                    value={user.selectedGroups}
                    onChange={(event) => UU_handleGroupsChange(index, event)}
                    renderValue={(selected) => selected.join(", ")}
                    sx={{ width: "150px" }}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group} value={group}>
                        <Checkbox checked={user.selectedGroups.includes(group)} />
                        <ListItemText primary={group} />
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell><Switch checked={user.enabled} onChange={(event) => UU_handleStatusChange(index, event)} /></TableCell>
                <TableCell><Button onClick={() => updateUser(index)}>Update</Button></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default Users;