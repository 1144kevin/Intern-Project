import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import { message } from "antd";
import "./add.scss";
import { addBookData, getSectionsData } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import BookForm from "../../components/BookForm/bookForm";
import { useAuth } from "../../context/authContext";
import { sectionDataType } from "../../assets/data";

function Add() {
  const [formData, setFormData] = useState({
    user_id: "",
    id: "",
    section_id: "__other__",
    image: "",
    title: "",
    body: "",
  });
  const [sections, setSections] = useState<sectionDataType[]>([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    async function fetchSections() {
      try {
        const sectionList = await getSectionsData();
        setSections(sectionList);
      } catch (error) {
        console.error("載入區域失敗:", error);
        message.error("區域載入失敗，請重新整理後再試");
      }
    }

    fetchSections();
  }, []);

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
      section_id: formData.section_id === "__other__" ? null : formData.section_id,
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
        onSectionChange={(value) =>
          setFormData((prevData) => ({ ...prevData, section_id: value }))
        }
        onSubmit={handleSubmit}
        onFileChange={handleFileChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
        sections={[{ id: "__other__", name: "其他" }, ...sections]}
        showSectionSelector
      />
    </Layout>
  );
}

export default Add;
