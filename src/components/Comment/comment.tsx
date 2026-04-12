import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	LikeOutlined,
	LikeFilled,
	EditOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import { Avatar, List, Input, Button, Rate, Row, Col, message } from 'antd';
import {
	createComment,
	deleteComment,
	getCommentsByProjectId,
	updateComment,
} from '../../api/api';
import { commentDataType, projectDataType } from '../../assets/data';
import { RootState } from '../../redux/store';
import { toggleLike } from '../../redux/commentSlice';
import './comment.scss';
import { useAuth } from '../../context/authContext';
import { useEffect } from 'react';

const faceImage = Array.from({ length: 6 }).map((_, i) => ({
	id: `${i}`,
	avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
}));

function Comment({
	book,
	onRatingUpdate,
}: {
	book: projectDataType;
	onRatingUpdate: (updatedRating: number) => void;
}) {
	const { TextArea } = Input;
	const dispatch = useDispatch();
	const { user, profile } = useAuth();
	const likedComments = useSelector(
		(state: RootState) => state.comment.likedComments
	);
	const [comments, setComments] = useState<commentDataType[]>([]);
	const [newComment, setNewComment] = useState('');
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editedContent, setEditedContent] = useState<string>('');
	const [currentRating, setCurrentRating] = useState<number>(0);
	const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

	useEffect(() => {
		async function fetchComments() {
			if (!book.id) return;
			try {
				const allComments = await getCommentsByProjectId(book.id);
				setComments(allComments);
				onRatingUpdate(calculateAverageRating(allComments));
			} catch (error) {
				console.error('Failed to fetch comments:', error);
				message.error('留言載入失敗，請重新整理後再試');
				setComments([]);
				onRatingUpdate(0);
			}
		}

		fetchComments();
	}, [book.id, onRatingUpdate]);

	function calculateAverageRating(commentList: commentDataType[]) {
		if (commentList.length === 0) return 0;

		const total = commentList.reduce((sum, item) => sum + item.rating, 0);
		return Number((total / commentList.length).toFixed(1));
	}

	async function handleAddComment() {
		if (!user || !profile) {
			message.error('請先登入後再留言');
			return;
		}

		if (!book.id) return;
		if (!newComment.trim()) {
			message.error('請輸入留言內容');
			return;
		}
		if (!currentRating) {
			message.error('請先評分');
			return;
		}

		const randomNumber = Math.floor(Math.random() * 6);
		const created = await createComment({
			project_id: book.id,
			user_id: user.id,
			content: newComment.trim(),
			rating: currentRating,
			user_image: faceImage[randomNumber].avatar,
		});

		const nextComments = [...created, ...comments];
		message.success('評論新增成功');
		setComments(nextComments);
		setNewComment('');
		setCurrentRating(0);
		onRatingUpdate(calculateAverageRating(nextComments));
	}

	async function handleDeleteComment(commentId: string) {
		await deleteComment(commentId);
		const nextComments = comments.filter((comment) => comment.id !== commentId);
		message.success('評論刪除成功');
		setComments(nextComments);
		onRatingUpdate(calculateAverageRating(nextComments));
	}

	function handleEditClick(commentId: string, currentContent: string) {
		setEditingCommentId(commentId);
		setEditedContent(currentContent);
		setCurrentRating(
			comments.find((comment) => comment.id === commentId)?.rating || 0
		);
	}

	async function handleSaveEdit(commentId: string) {
		if (!editedContent.trim()) {
			message.error('請輸入留言內容');
			return;
		}

		const updatedRows = await updateComment(commentId, {
			content: editedContent.trim(),
			rating: currentRating,
		});
		const updatedComment = updatedRows[0];
		const updatedComments = comments.map((comment) =>
			comment.id === commentId
				? updatedComment
				: comment
		);
		message.success('修改完成');
		setComments(updatedComments);
		setEditingCommentId(null);
		setEditedContent('');
		setCurrentRating(0);
		onRatingUpdate(calculateAverageRating(updatedComments));
	}

	function handleToggleLike(commentId: string) {
		dispatch(toggleLike(commentId));
	}

	function handleRatingChange(value: number) {
		setCurrentRating(value);
	}

	return (
		<List
			itemLayout="vertical"
			size="small"
			pagination={{
				pageSize: 3,
			}}
			dataSource={comments}
			footer={
				<Row style={{ height: 150 }} gutter={[8, 8]}>
					<Col span={24}>
						{editingCommentId ? (
							<TextArea
								rows={4}
								value={editedContent}
								style={{
									backgroundColor: '#fff',
								}}
								onChange={(e) => setEditedContent(e.target.value)}
							/>
						) : (
							<TextArea
								rows={4}
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
							/>
						)}
					</Col>
					<Col
						span={24}
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								gap: '1rem',
							}}
						>
							<p style={{ color: isDarkMode ? '#fff' : '#000' }}>評分</p>
							<Rate
								value={currentRating}
								onChange={(value) => handleRatingChange(value)}
							/>
						</div>
						{!user ? (
							<Button
								disabled
								className={
									isDarkMode
										? 'comment-login-btn comment-login-btn--dark'
										: 'comment-login-btn comment-login-btn--light'
								}
							>
								請先登入後留言
							</Button>
						) : editingCommentId ? (
							<Button type="primary" onClick={() => handleSaveEdit(editingCommentId)}>
								儲存
							</Button>
						) : (
							<Button
								type="primary"
								htmlType="submit"
								onClick={handleAddComment}
							>
								送出
							</Button>
						)}
					</Col>
				</Row>
			}
			renderItem={(item) => (
				<List.Item
					key={item.id}
					actions={[
						likedComments[item.id] ? (
							<LikeFilled
								style={{ color: isDarkMode ? '#fff' : '#000' }}
								className="like-icon"
								onClick={() => handleToggleLike(item.id)}
							/>
						) : (
							<LikeOutlined
								style={{ color: isDarkMode ? '#fff' : '' }}
								className="like-icon"
								onClick={() => handleToggleLike(item.id)}
							/>
						),
						...(user && item.user_id === user.id
							? [
									<EditOutlined
										style={{ color: isDarkMode ? '#fff' : '' }}
										className="edit-icon"
										onClick={() => handleEditClick(item.id, item.content)}
									/>,
									<DeleteOutlined
										style={{ color: isDarkMode ? '#fff' : '' }}
										className="delete-icon"
										onClick={() => handleDeleteComment(item.id)}
									/>,
							  ]
							: []),
					]}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
						<List.Item.Meta
							avatar={<Avatar src={item.user_image} />}
							title={
								<span style={{ color: isDarkMode ? '#fff' : '#000' }}>
									{item.profiles?.[0]?.username || 'Unknown user'}
								</span>
							}
							description={
								<span style={{ color: isDarkMode ? '#fff' : '#000' }}>
									{item.content}
								</span>
							}
						/>
						<Rate
							value={item.rating}
							onChange={(value) => handleRatingChange(value)}
							disabled={true}
						/>
					</div>
				</List.Item>
			)}
		/>
	);
}

export default Comment;
