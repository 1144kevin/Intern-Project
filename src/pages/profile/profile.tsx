import { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	Card,
	Col,
	Input,
	Row,
	Space,
	Typography,
	message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../api/supabaseClient';
import './profile.scss';

function Profile() {
	const [username, setUsername] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);
	const navigate = useNavigate();
	const { user, profile, refreshProfile, signOut } = useAuth();

	useEffect(() => {
		setUsername(profile?.username || user?.user_metadata?.username || '');
	}, [profile?.username, user?.user_metadata?.username]);

	const handleSave = async () => {
		if (!user) return;

		const nextUsername = username.trim();
		if (!nextUsername) {
			message.error('姓名不能為空');
			return;
		}

		setSaving(true);
		try {
			const { data: existingProfile, error: findError } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', user.id)
				.maybeSingle();

			if (findError) {
				message.error(findError.message);
				return;
			}

			const { error } = existingProfile
				? await supabase
						.from('profiles')
						.update({ username: nextUsername })
						.eq('id', user.id)
				: await supabase.from('profiles').insert({
						id: user.id,
						username: nextUsername,
				  });

			if (error) {
				message.error(error.message);
				return;
			}

			await refreshProfile(user.id);
			setIsEditing(false);
			message.success('個人資料已更新');
		} finally {
			setSaving(false);
		}
	};

	const handleLogout = async () => {
		setLoggingOut(true);
		try {
			await signOut();
			message.success('已登出');
			navigate('/login', { replace: true });
		} finally {
			setLoggingOut(false);
		}
	};

	return (
		<Layout>
			<Row justify="center" className="profilePage">
				<Col xs={22} sm={18} md={14} lg={10}>
					<Card title="個人檔案">
						<Typography.Text>姓名</Typography.Text>
						<Input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={!isEditing}
							placeholder="按「修改名字」後可編輯，完成後按「確認修改」"
							style={{ marginTop: 8 }}
						/>
						<Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
							先按「修改名字」進入編輯，再按「確認修改」儲存。
						</Typography.Paragraph>
						<Alert
							type="info"
							showIcon
							message={`登入帳號：${user?.email || ''}`}
							style={{ marginBottom: '1rem' }}
						/>
						<Space>
							<Button type="default" onClick={() => setIsEditing(true)}>
								修改名字
							</Button>
							<Button
								type="primary"
								onClick={handleSave}
								loading={saving}
								disabled={!isEditing}
							>
								確認修改
							</Button>
							<Button danger onClick={handleLogout} loading={loggingOut}>
								登出
							</Button>
						</Space>
					</Card>
				</Col>
			</Row>
		</Layout>
	);
}

export default Profile;
