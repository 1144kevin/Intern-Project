import React, { useState } from "react";
import type { MenuProps } from "antd";
import { Button, Menu, Space, Typography } from "antd";
import { useLocation, NavLink } from "react-router-dom";
import "./navBar.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useAuth } from "../../context/authContext";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    label: <NavLink to="/">Home</NavLink>,
    key: "/",
  },
  {
    label: <NavLink to="/Favorite">Favorite</NavLink>,
    key: "/Favorite",
  },
  {
    label: <NavLink to="/Add">Add</NavLink>,
    key: "/Add",
  },
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode); // Get the theme state
  const { user, profile, signOut } = useAuth();
  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  React.useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);
  
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
      <Menu
        onClick={onClick}
        theme={isDarkMode ? "dark" : "light"}
        selectedKeys={[current]}
        mode="horizontal"
        items={items}
        className="custom-menu"
        style={{ flex: 1 }}
      />
      <Space style={{ paddingInline: "1rem" }}>
        {user ? (
          <>
            <Typography.Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
              {profile?.username || user.email}
            </Typography.Text>
            <Button onClick={() => signOut()}>Logout</Button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </Space>
    </div>
  );
};

export default NavBar;
