import React from "react";
import { Input, Switch, Row, Col } from "antd";
import "./searchBar.scss";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/themeSlice";
import { RootState } from "../../redux/store";

const { Search } = Input;
interface SearchBarProps {
  onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode); // Get the theme state

  const dispatch = useDispatch();

  const handleThemeToggle = () => {
    dispatch(toggleTheme()); // Dispatch the toggleTheme action
  };

  return (
    <Row>
      <Col span={10} offset={7} className="searchLine">
        <Switch
          checked={isDarkMode}
          onChange={handleThemeToggle}
          className="themeSwitch"
          style={{ transform: "scale(1.3)" }}
        />
        <Search
          placeholder="搜尋標題"
          allowClear
          onSearch={onSearch}
          style={{ width: 400}}
        />
      </Col>
    </Row>
  );
};

export default SearchBar;
