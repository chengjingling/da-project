import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <div>
      <h1>Task Management System</h1>
      <nav>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/">Log Out</NavLink>
      </nav>
    </div>
  );
};

export default Header;