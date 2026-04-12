import { useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home/home";
import Detail from "./pages/detail/detail";
import Favorite from "./pages/favorite/favorite";
import Add from "./pages/add/add";
import Update from "./pages/update/update";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import ProtectedRoute from "./components/ProtectedRoute/protectedRoute";
import Profile from "./pages/profile/profile";

export default function Router() {

  function ScrollToTop() {

    const { pathname } = useLocation();
    useLayoutEffect(() => { //useLayoutEffect 在瀏覽器繪製之前觸發
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);//延遲 0 毫秒的 setTimeout 可以確保 scrollTo 被推遲到 DOM 更新之後、繪製之前執行，讓滾動到頂部的行為更加流暢
    }, [pathname]);

    return null;//返回 null 表示這個組件不會在頁面上生成任何實際的 DOM 元素
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="favorite">
          <Route path="detail/id/:dataId" element={<Detail />} />
          <Route
            path="detail/id/:dataId/update"
            element={
              <ProtectedRoute>
                <Update />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <Add />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={<Profile />}
        />
        <Route path="detail">
          <Route path="id/:dataId" element={<Detail />} />
          <Route
            path="id/:dataId/update"
            element={
              <ProtectedRoute>
                <Update />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
