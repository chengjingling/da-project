import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import Header from "../components/Header";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, Checkbox, ListItemText, Switch } from "@mui/material";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");
  const [createGroupErrorMessage, setCreateGroupErrorMessage] = useState("");

  const navigate = useNavigate();

  const checkPermission = async () => {
    const response = await axios.get("http://localhost:8080/api/checkPermission");
    
    if (!response.data.isAdmin) {
      navigate("/");
    }
  };

  const retrieveUsers = async () => {
    const response = await axios.get("http://localhost:8080/api/retrieveUsers");
    const usersArray = response.data.users.map(user => ({ ...user, newPassword: "", selectedGroups: [] }));
    setUsers(usersArray);
  };

  const retrieveGroups = async () => {
    const response = await axios.get("http://localhost:8080/api/retrieveGroups");
    const groupsArray = response.data.groups.map(group => group.groupName);
    setGroups(groupsArray);
  };

  useEffect(() => {
    checkPermission();
    retrieveUsers();
    retrieveGroups();
  }, []);

  const handleGroupInputChange = (event) => {
    setGroupInput(event.target.value);
  };

  const createGroup = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/createGroup", { groupName: groupInput });
      setGroups((prevGroups) => [...prevGroups, groupInput].sort());
      setGroupInput("");
      setCreateGroupErrorMessage("");
    } catch (error) {
      setCreateGroupErrorMessage("Group already exists.");
    }
  };

  const handlePasswordInputChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].newPassword = event.target.value;
    setUsers(newUsers);
  };

  const handleEmailInputChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].email = event.target.value;
    setUsers(newUsers);
  };

  const handleGroupSelectChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].selectedGroups = event.target.value;
    setUsers(newUsers);
  };

  const handleStatusToggleChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].enabled = event.target.checked;
    setUsers(newUsers);
  };

  const updateUser = async (index) => {
    try {
      console.log(users[index]);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div style={{ paddingTop: 80 }}>
      <Header />

      <table style={{ marginLeft: "auto" }}>
        <tbody>
          <tr>
            <td>Group name:</td>
            <td><TextField value={groupInput} onChange={handleGroupInputChange} /></td>
            <td><Button onClick={createGroup}>Create</Button></td>
          </tr>
          <tr>
            <td></td>
            <td style={{ color: "#ff0000" }}>{createGroupErrorMessage}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
        
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
          {users.map((user, index) => {
            return (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
                <TableCell><TextField value={user.newPassword} onChange={(event) => handlePasswordInputChange(index, event)} /></TableCell>
                <TableCell><TextField value={user.email} onChange={(event) => handleEmailInputChange(index, event)} /></TableCell>
                <TableCell>
                  <Select
                      multiple
                      value={user.selectedGroups}
                      onChange={(event) => handleGroupSelectChange(index, event)}
                      renderValue={(selected) => selected.join(", ")}
                      style={{ width: "150px" }}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group} value={group}>
                        <Checkbox checked={user.selectedGroups.includes(group)} />
                        <ListItemText primary={group} />
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell><Switch checked={user.enabled} onChange={(event) => handleStatusToggleChange(index, event)} /></TableCell>
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