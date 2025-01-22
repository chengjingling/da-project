import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

const Users = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:8080/users");
    setUsers(response.data.users);
    console.log(response.data.users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Header />

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
                <TableCell></TableCell>
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