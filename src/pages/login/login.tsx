import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Typography, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../Layout';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../context/authContext';

type LoginFormValues = {
	email: string;
	password: string;
};

function Login() {
	const [submitting, setSubmitting] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { refreshProfile } = useAuth();

	const redirectTo = (location.state as { from?: string } | null)?.from || '/';

	const handleSubmit = async (values: LoginFormValues) => {
		setSubmitting(true);

		const { data, error } = await supabase.auth.signInWithPassword({
			email: values.email,
			password: values.password,
		});

		if (error) {
			message.error(error.message);
			setSubmitting(false);
			return;
		}

		await refreshProfile(data.user.id);
		message.success('登入成功');
		navigate(redirectTo, { replace: true });
		setSubmitting(false);
	};

	return (
		<Layout>
			<Row justify="center" style={{ minHeight: '100vh', paddingTop: '4rem' }}>
				<Col xs={22} sm={16} md={12} lg={8}>
					<Card title="Login">
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
								rules={[{ required: true, message: '請輸入密碼' }]}
							>
								<Input.Password />
							</Form.Item>
							<Alert
								type="info"
								showIcon
								message="Supabase Email/Password 模式需要用 Email 當帳號欄位。"
								style={{ marginBottom: '1rem' }}
							/>
							<Form.Item style={{ marginBottom: 0 }}>
								<Button type="primary" htmlType="submit" loading={submitting} block>
									登入
								</Button>
							</Form.Item>
						</Form>
						<Typography.Paragraph style={{ marginTop: '1rem', marginBottom: 0 }}>
							還沒有帳號？ <Link to="/register">前往註冊</Link>
						</Typography.Paragraph>
					</Card>
				</Col>
			</Row>
		</Layout>
	);
}

export default Login;
