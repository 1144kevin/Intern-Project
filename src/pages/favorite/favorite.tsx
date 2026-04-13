import Layout from '../../Layout';
import BookList from '../../components/BookList/bookList';
import { projectDataType } from '../../assets/data';
import { Col, Row, Spin, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite } from '../../redux/favoriteSlice';
import { RootState } from '../../redux/store';
import { useEffect, useState } from 'react';
import { getBookData, getBookDataCache, isBookDataCacheFresh } from '../../api/api';

const Favorite = () => {
	const favoriteIds = useSelector((state: RootState) => state.book.bookIds);
	const [allBooks, setAllBooks] = useState<projectDataType[]>(() => getBookDataCache());
	const [loading, setLoading] = useState(() => getBookDataCache().length === 0);
	const [visibleFavorites, setVisibleFavorites] = useState<projectDataType[]>([]);
	const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

	const dispatch = useDispatch();

	useEffect(() => {
		const cachedBooks = getBookDataCache();
		const cacheFresh = isBookDataCacheFresh();
		if (cachedBooks.length > 0) {
			setAllBooks(cachedBooks);
		}

		async function fetchFavoritesSource() {
			try {
				if (cachedBooks.length === 0) {
					setLoading(true);
				}
				const books = await getBookData();
				setAllBooks(books);
			} catch (error) {
				console.error('Failed to fetch favorite source books:', error);
				if (cachedBooks.length === 0) {
					message.error('收藏資料載入失敗，請重新整理後再試');
					setAllBooks([]);
				}
			} finally {
				setLoading(false);
			}
		}

		if (!cacheFresh || cachedBooks.length === 0) {
			fetchFavoritesSource();
		}
	}, []);

	useEffect(() => {
		const favoritesFromCurrentState = allBooks.filter((book) =>
			favoriteIds.includes(book.id || '')
		);

		// Preserve items already visible in this page, so unfavorite won't instantly remove.
		setVisibleFavorites((prev) => {
			const prevMap = new Map(prev.map((book) => [book.id, book]));
			favoritesFromCurrentState.forEach((book) => {
				prevMap.set(book.id, book);
			});
			return Array.from(prevMap.values());
		});
	}, [allBooks, favoriteIds]);

	const handleFavoriteToggle = (book: projectDataType) => {
		console.log(12);
		dispatch(toggleFavorite(book.id!));
	};

	return (
		<Layout>
			<Row
				style={{
					backgroundColor: isDarkMode ? '#000' : '#fff',
				}}
			>
				<Col span={24} className="title">
					<h1>收藏</h1>
				</Col>
				<Col span={16} offset={4} style={{ minHeight: '100vh' }}>
					{loading && allBooks.length === 0 ? (
						<Spin size="large" />
					) : (
						<BookList
							bookList={visibleFavorites}
							handleFavorite={handleFavoriteToggle}
						/>
					)}
				</Col>
			</Row>
		</Layout>
	);
};

export default Favorite;
