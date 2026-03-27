import { useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../Layout';
import { supabase } from '../../api/supabaseClient';

type RegisterFormValues = {
	email: string;
	password: string;
	username: string;
};

function Register() {
	const [submitting, setSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (values: RegisterFormValues) => {
		setSubmitting(true);

		const { error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
			options: {
				data: {
					username: values.username,
				},
			},
		});

		if (error) {
			message.error(error.message);
			setSubmitting(false);
			return;
		}

		message.success('註冊成功，請依你的 Supabase Auth 設定完成驗證後登入');
		navigate('/login', { replace: true });
		setSubmitting(false);
	};

	return (
		<Layout>
			<Row justify="center" style={{ minHeight: '100vh', paddingTop: '4rem' }}>
				<Col xs={22} sm={16} md={12} lg={8}>
					<Card title="Register">
						<Form layout="vertical" onFinish={handleSubmit}>
							<Form.Item
								label="Account (Email)"
								name="email"
								rules={[
									{ required: true, message: '請輸入帳號' },
									{ type: 'email', message: '請輸入有效 Email' },
								]}
							>
								<Input placeholder="you@example.com" />
							</Form.Item>
							<Form.Item
								label="Password"
								name="password"
								rules={[
									{ required: true, message: '請輸入密碼' },
									{ min: 6, message: '密碼至少 6 碼' },
								]}
							>
								<Input.Password />
							</Form.Item>
							<Form.Item
								label="Username"
								name="username"
								rules={[{ required: true, message: '請輸入使用者名稱' }]}
							>
								<Input />
							</Form.Item>
							<Form.Item style={{ marginBottom: 0 }}>
								<Button type="primary" htmlType="submit" loading={submitting} block>
									Register
								</Button>
							</Form.Item>
						</Form>
						<Typography.Paragraph style={{ marginTop: '1rem', marginBottom: 0 }}>
							已經有帳號？ <Link to="/login">前往登入</Link>
						</Typography.Paragraph>
					</Card>
				</Col>
			</Row>
		</Layout>
	);
}

export default Register;
