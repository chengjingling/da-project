import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, Checkbox, ListItemText } from "@mui/material";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");

  const navigate = useNavigate();

  const retrieveUsers = async () => {
    const response = await axios.get("http://localhost:8080/api/retrieveUsers");
    setUsers(response.data.users);
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

  const handleGroupSelectChange = (event) => {
    setSelectedGroups(event.target.value);
  };

  const handleGroupInputChange = (event) => {
    setGroupInput(event.target.value);
  };

  const createGroup = async () => {
    const response = await axios.post("http://localhost:8080/api/createGroup", { groupName: groupInput });
    
    if (response.data.status === 200) {
        navigate("/users");
    }
  };

  return (
    <div>
      <Header />

      Group name:
      <TextField value={groupInput} onChange={handleGroupInputChange} />
      <Button onClick={createGroup}>Create</Button>
        
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
                      value={selectedGroups}
                      onChange={handleGroupSelectChange}
                      renderValue={(selected) => selected.join(", ")}
                      style={{ width: "150px" }}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group} value={group}>
                        <Checkbox checked={selectedGroups.includes(group)} />
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