import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";

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

      {users.map((user, index) => {
        return (
          <div key={index}>
            {user}
          </div>
        );
      })}
    </div>
  );
};

export default Users;