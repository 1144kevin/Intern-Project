import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import { message } from "antd";
import "./update.scss";
import { getBookById, updateBookData } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import BookForm from "../../components/BookForm/bookForm";
import { useAuth } from "../../context/authContext";
import { projectDataType } from "../../assets/data";

// Define a type for the book data
const Update = () => {
  const { dataId } = useParams();
  const [book, setBook] = useState<projectDataType | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!dataId) return;
    getBookById(dataId).then(setBook);
  }, [dataId]);

  const [formData, setFormData] = useState({
    user_id: book?.user_id || "",
    id: book?.id || "",
    image: book?.image || "",
    title: book?.title || "",
    body: book?.body || "",
  });

  useEffect(() => {
    if (!book) return;

    setFormData({
      user_id: book.user_id,
      id: book.id || "",
      image: book.image || "",
      title: book.title || "",
      body: book.body || "",
    });
  }, [book]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!user) {
      message.error("請先登入");
      return;
    }

    if (book?.user_id !== user.id) {
      message.error("你沒有權限更新這筆資料");
      return;
    }

    if (formData.title && formData.body) {
      updateBookData(formData).then(()=>{
        message.success("更新成功");
        navigate(-1);
      });
    }
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

  return (
    <Layout>
      <BookForm
        formData={formData}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
        onFileChange={
          handleFileChange as (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => void
        }
        isUpdate
      />
    </Layout>
  );
};

export default Update;
