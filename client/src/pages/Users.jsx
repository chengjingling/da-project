import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, Checkbox, ListItemText } from "@mui/material";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");
  const [createGroupErrorMessage, setCreateGroupErrorMessage] = useState("");

  const retrieveUsers = async () => {
    const response = await axios.get("http://localhost:8080/api/retrieveUsers");
    const usersArray = response.data.users.map(user => ({ ...user, selectedGroups: [] }));
    setUsers(usersArray);
  };

  const retrieveGroups = async () => {
    const response = await axios.get("http://localhost:8080/api/retrieveGroups");
    const groupsArray = response.data.groups.map(group => group.groupName);
    setGroups(groupsArray);
  };

  useEffect(() => {
    retrieveUsers();
    retrieveGroups();
  }, []);

  const handleGroupSelectChange = (index, event) => {
    const newUsers = [...users];
    newUsers[index].selectedGroups = event.target.value;
    setUsers(newUsers);
  };

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
                <TableCell></TableCell>
                <TableCell>{user.email}</TableCell>
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
                <TableCell>{user.enabled === 1 ? "Enabled" : "Disabled"}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default Users;