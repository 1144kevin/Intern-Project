import React, { useState } from "react";
import Layout from "../../Layout";
import { message } from "antd";
import "./add.scss";
import { addBookData } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import BookForm from "../../components/BookForm/bookForm";
import { useAuth } from "../../context/authContext";

function Add() {
  const [formData, setFormData] = useState({
    user_id: "",
    id: "",
    image: "",
    title: "",
    body: "",
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          // 確保 result 是 string 類型
          setFormData((prevData) => ({ ...prevData, image: result }));
          message.success(`${file.name} 文件已準備好`);
        }
      };
      reader.onerror = () => {
        message.error(`${file.name} 文件讀取失敗`);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      message.error("請先登入");
      return;
    }

    if (!formData.title || !formData.body) {
      message.error("請先填寫完整資料");
      return;
    }

    const request = {
      ...formData,
      user_id: user.id,
      id: uuidv4(),
    };

    try {
      await addBookData(request);
      message.success("新增成功");
      navigate(`/`);
    } catch (error) {
      console.error("新增失敗:", error);
      message.error("新增失敗，請稍後再試");
    }
  };

  return (
    <Layout>
      <BookForm
        formData={formData}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
      />
    </Layout>
  );
}

export default Add;
