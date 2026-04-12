import React from 'react';
import { Row, Col, Button, Input, Image, Select } from 'antd';
import { sectionDataType } from '../../assets/data';

const { TextArea } = Input;

const BookForm = ({
	formData,
	onFormChange,
	onSectionChange,
	onSubmit,
	onFileChange,
	sections = [],
	showSectionSelector = false,
	isUpdate = false,
}: {
	formData: {
		image: string;
		title: string;
		body: string;
		section_id?: string | null;
	};
	onFormChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onSectionChange?: (value: string) => void;
	onSubmit: () => void | Promise<void>;
	onFileChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	sections?: sectionDataType[];
	showSectionSelector?: boolean;
	isUpdate?: boolean;
}) => {
	return (
		<Row>
			<Col span={24} className="title">
				<h1>{isUpdate ? '更新' : '新增'}</h1>
			</Col>
			<Col span={8} offset={8} className="imagePicker">
				<Row style={{ display: 'flex', justifyContent: 'center' }}>
					<Col>
						<Image
							src={
								formData.image ||
								'https://t4.ftcdn.net/jpg/04/81/13/43/360_F_481134373_0W4kg2yKeBRHNEklk4F9UXtGHdub3tYk.jpg'
							}
							style={{ height: 200, width: 200, objectFit: 'cover' }}
						/>
					</Col>
					<Col offset={2} className="imagePicker__button">
						<input
							type="file"
							accept="image/*"
							onChange={onFileChange}
							id="upload"
							hidden
						/>
						<label htmlFor="upload">選擇檔案</label>
					</Col>
				</Row>
			</Col>

			<Col span={8} offset={8} className="title__input">
				{showSectionSelector ? (
					<Row gutter={12}>
						<Col span={12}>
							<Select
								placeholder="請選擇區域"
								style={{ width: '100%' }}
								value={formData.section_id || undefined}
								onChange={(value) => onSectionChange?.(value)}
								options={sections.map((section) => ({
									label: section.name,
									value: section.id,
								}))}
							/>
						</Col>
						<Col span={12}>
							<Input
								showCount
								maxLength={100}
								name="title"
								value={formData.title}
								onChange={onFormChange}
							/>
						</Col>
					</Row>
				) : (
					<Input
						showCount
						maxLength={100}
						name="title"
						value={formData.title}
						onChange={onFormChange}
					/>
				)}
			</Col>
			<Col span={8} offset={8} className="content__input">
				<TextArea
					showCount
					maxLength={400}
					name="body"
					value={formData.body}
					onChange={onFormChange}
					placeholder="請從此輸入內容"
					style={{ height: 120, resize: 'none' }}
				/>
			</Col>
			<Col
				span={8}
				offset={8}
				className="submitButton"
				style={{ minHeight: '35vh' }}
			>
				<Button type="primary" onClick={onSubmit}>
					{isUpdate ? '更新' : '新增'}
				</Button>
			</Col>
		</Row>
	);
};

export default BookForm;
