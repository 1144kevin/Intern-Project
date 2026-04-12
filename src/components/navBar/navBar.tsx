import React, { useMemo, useState } from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useLocation, NavLink } from "react-router-dom";
import "./navBar.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

type MenuItem = Required<MenuProps>["items"][number];

const NavBar: React.FC = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode); // Get the theme state
  const items: MenuItem[] = useMemo(() => {
    return [
      {
        label: <NavLink to="/">首頁</NavLink>,
        key: "/",
      },
      {
        label: <NavLink to="/favorite">收藏</NavLink>,
        key: "/favorite",
      },
      {
        label: <NavLink to="/add">新增</NavLink>,
        key: "/add",
      },
      {
        label: <NavLink to="/profile">設定</NavLink>,
        key: "/profile",
      },
    ];
  }, []);

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
    </div>
  );
};

export default NavBar;
