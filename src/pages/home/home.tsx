import { useState, useEffect } from 'react';
import Layout from '../../Layout';
import SearchBar from '../../components/SearchBar/searchBar';
import BookList from '../../components/BookList/bookList';
import { Row, Col, Spin, message, Modal, Input, FloatButton, Select } from 'antd';
import { projectDataType, sectionDataType } from '../../assets/data';
import './home.scss';
import { toggleFavorite } from '../../redux/favoriteSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
	createSection,
	deleteSection,
	getBookData,
	getSectionsData,
	updateSectionName,
} from '../../api/api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/authContext';

const Home = () => {
	const [data, setData] = useState<projectDataType[]>([]);
	const [sections, setSections] = useState<sectionDataType[]>([]);
	const [search, setSearch] = useState('');
	const [searchList, setSearchList] = useState<projectDataType[]>(data);
	const [bookLoading, setBookLoading] = useState(false); //setBookLoading
	const [sectionModalOpen, setSectionModalOpen] = useState(false);
	const [newSectionName, setNewSectionName] = useState('');
	const [creatingSection, setCreatingSection] = useState(false);
	const [editSectionModalOpen, setEditSectionModalOpen] = useState(false);
	const [deleteSectionModalOpen, setDeleteSectionModalOpen] = useState(false);
	const [selectedSectionId, setSelectedSectionId] = useState<string>('');
	const [editingSectionName, setEditingSectionName] = useState('');
	const [updatingSection, setUpdatingSection] = useState(false);
	const [deletingSection, setDeletingSection] = useState(false);

	//取 Redux 的 dispatch 函數。這個函數允許你在組件中分派（dispatch）actions，以更新 Redux store 中的狀態。
	const dispatch = useDispatch();
	const { user } = useAuth();

	//用於從 Redux store 中提取特定的狀態。在這裡，useSelector 從 RootState 中提取 state.book.book，即 Redux store 中管理的書籍列表。
	//state 是整個 Redux store 的狀態。第一個 book 代表 book slice，第二個 book 代表 FavoriteState 中的 book 屬性，它是一個書籍數組。
	const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode); // Get the theme state

	const handleSearch = (value: string) => {
		setSearch(value);
		// const newList = data.filter((book) =>
		//   book?.title?.toLowerCase().includes(value.toLowerCase())
		// );
		// setSearchList(newList);
	};

	const sortAZ = () => {
		//... 是展開運算符，它將 data 數組中的所有元素展開並複製到一個新的數組中。
		//localeCompare 是字符串的內建方法，用於比較兩個字符串的順序，並返回一個表示這兩個字符串相對順序的數值。這個數值可以用來判斷哪個字符串應該排在前面。
		const sortedList = [...data].sort((a, b) => a.title.localeCompare(b.title));
		setSearchList(sortedList);
	};

	function sortZA() {
		const sortedList = [...data].sort((a, b) => b.title.localeCompare(a.title));
		setSearchList(sortedList);
	}

	const handleFavoriteToggle = (book: projectDataType) => {
		dispatch(toggleFavorite(book.id!));
	};

	useEffect(() => {
		async function fetchBooks() {
			try {
				setBookLoading(true);
				const [allBooks, allSections] = await Promise.all([
					getBookData(),
					getSectionsData(),
				]);
				const sortedList = [...allBooks].sort((a, b) =>
					a.title.localeCompare(b.title)
				);
				setSearchList(sortedList);
				setData(sortedList);
				setSections(allSections);
			} catch (error) {
				console.error('Failed to fetch books on home page:', error);
				message.error('首頁資料載入失敗，請重新整理後再試');
				setSearchList([]);
				setData([]);
				setSections([]);
			} finally {
				setBookLoading(false);
			}
		}
		fetchBooks();
	}, []);

	useEffect(() => {
		const filteredList = data.filter((book) =>
			book?.title?.toLowerCase().includes(search.toLowerCase())
		);
		setSearchList(filteredList);
	}, [search, data]);

	// Set the CSS variable for spin dot color
	useEffect(() => {
		document.documentElement.style.setProperty(
			'--spin-dot-color',
			isDarkMode ? '#fff' : '#000'
		);
	}, [isDarkMode]);

	const groupedSections = sections.map((section) => ({
		...section,
		books: searchList.filter((book) => book.section_id === section.id),
	}));

	const otherSectionBooks = searchList.filter((book) => !book.section_id);
	const dividerColor = isDarkMode
		? 'rgba(255, 255, 255, 0.28)'
		: 'rgba(0, 0, 0, 0.2)';

	const handleCreateSection = async () => {
		const sectionName = newSectionName.trim();
		if (!sectionName) {
			message.error('請輸入區域名稱');
			return;
		}

		if (!user) {
			message.error('請先登入再新增區域');
			return;
		}

		setCreatingSection(true);
		try {
			const createdSection = await createSection(sectionName, user.id);
			setSections((prev) => [...prev, createdSection]);
			message.success('新增區域成功');
			setNewSectionName('');
			setSectionModalOpen(false);
		} catch (error) {
			console.error('Failed to create section:', error);
			message.error('新增區域失敗，請稍後再試');
		} finally {
			setCreatingSection(false);
		}
	};

	const handleOpenEditSectionModal = () => {
		if (sections.length === 0) {
			message.info('目前沒有可編輯的區域');
			return;
		}
		const firstSection = sections[0];
		setSelectedSectionId(firstSection.id);
		setEditingSectionName(firstSection.name);
		setEditSectionModalOpen(true);
	};

	const handleOpenDeleteSectionModal = () => {
		if (sections.length === 0) {
			message.info('目前沒有可刪除的區域');
			return;
		}
		setSelectedSectionId(sections[0].id);
		setDeleteSectionModalOpen(true);
	};

	const handleSelectSectionForEdit = (sectionId: string) => {
		setSelectedSectionId(sectionId);
		const target = sections.find((section) => section.id === sectionId);
		setEditingSectionName(target?.name || '');
	};

	const handleUpdateSection = async () => {
		const nextName = editingSectionName.trim();
		if (!selectedSectionId) {
			message.error('請先選擇區域');
			return;
		}
		if (!nextName) {
			message.error('區域名稱不可為空');
			return;
		}

		setUpdatingSection(true);
		try {
			const updated = await updateSectionName(selectedSectionId, nextName);
			setSections((prev) =>
				prev.map((section) =>
					section.id === updated.id ? { ...section, name: updated.name } : section
				)
			);
			message.success('區域名稱已更新');
			setEditSectionModalOpen(false);
		} catch (error) {
			console.error('Failed to update section:', error);
			message.error('更新區域名稱失敗，請稍後再試');
		} finally {
			setUpdatingSection(false);
		}
	};

	const handleDeleteSection = async () => {
		if (!selectedSectionId) {
			message.error('請先選擇區域');
			return;
		}

		setDeletingSection(true);
		try {
			await deleteSection(selectedSectionId);
			setSections((prev) =>
				prev.filter((section) => section.id !== selectedSectionId)
			);
			setData((prev) =>
				prev.map((book) =>
					book.section_id === selectedSectionId
						? { ...book, section_id: null }
						: book
				)
			);
			message.success('區域已刪除');
			setDeleteSectionModalOpen(false);
		} catch (error) {
			console.error('Failed to delete section:', error);
			message.error('刪除區域失敗，請稍後再試');
		} finally {
			setDeletingSection(false);
		}
	};

	const sectionOptions = sections.map((section) => ({
		label: section.name,
		value: section.id,
	}));

	const handleInputEnter = (
		event: React.KeyboardEvent<HTMLInputElement>,
		action: () => Promise<void> | void
	) => {
		const nativeEvent = event.nativeEvent as KeyboardEvent;
		if (nativeEvent.isComposing) return;
		action();
	};

	return (
		<Layout>
			<Row
				style={{
					backgroundColor: isDarkMode ? '#000' : '#fff',
					color: isDarkMode ? '#fff' : '#000',
				}}
			>
				<Col span={24} className="title">
					<h1>首頁</h1>
				</Col>
				<Col span={24} className="searchBar">
					<SearchBar
						onSearch={handleSearch}
						onSortAZ={sortAZ}
						onSortZA={sortZA}
					/>
				</Col>
				<Col span={18} offset={3} style={{ minHeight: '100vh' }}>
					{bookLoading ? (
						<Spin size="large" className="loading" />
					) : (
						<>
							{search && (
								<h2 className="searchResult">
									找到{searchList.length}筆與{search}有關
								</h2>
							)}

							{groupedSections.map((section) => (
								<section className="projectSection" key={section.id}>
									<h2 className="projectSection__title">{section.name}</h2>
									<div
										className="projectSection__divider"
										style={{ backgroundColor: dividerColor }}
									/>
									<BookList
										bookList={section.books}
										handleFavorite={handleFavoriteToggle}
									/>
								</section>
							))}

							<section className="projectSection">
								<h2 className="projectSection__title">其他</h2>
								<div
									className="projectSection__divider"
									style={{ backgroundColor: dividerColor }}
								/>
								<BookList
									bookList={otherSectionBooks}
									handleFavorite={handleFavoriteToggle}
								/>
							</section>
							{groupedSections.length === 0 && otherSectionBooks.length === 0 && (
								<h2 className="searchResult">目前還沒有區域與專案，請先新增區域。</h2>
							)}
						</>
					)}
				</Col>
			</Row>
			<FloatButton.Group
				trigger="hover"
				className="sectionFloatButtons"
				icon={<PlusOutlined style={{ color: '#000' }} />}
				tooltip="區域管理"
			>
				<FloatButton
					className="sectionFloatButtons__item"
					icon={<PlusOutlined style={{ color: '#000' }} />}
					tooltip="新增區域"
					onClick={() => setSectionModalOpen(true)}
				/>
				<FloatButton
					className="sectionFloatButtons__item"
					icon={<EditOutlined style={{ color: '#000' }} />}
					tooltip="編輯區域"
					onClick={handleOpenEditSectionModal}
				/>
				<FloatButton
					className="sectionFloatButtons__item"
					icon={<DeleteOutlined style={{ color: '#000' }} />}
					tooltip="刪除區域"
					onClick={handleOpenDeleteSectionModal}
				/>
			</FloatButton.Group>
				<Modal
				title="新增區域"
				open={sectionModalOpen}
				onOk={handleCreateSection}
				onCancel={() => setSectionModalOpen(false)}
				okText="建立"
				cancelText="取消"
				confirmLoading={creatingSection}
			>
				<Input
					placeholder="例如：遊戲、網頁、後端"
					value={newSectionName}
					onChange={(e) => setNewSectionName(e.target.value)}
					onPressEnter={(e) => handleInputEnter(e, handleCreateSection)}
				/>
			</Modal>
			<Modal
				title="編輯區域名稱"
				open={editSectionModalOpen}
				onOk={handleUpdateSection}
				onCancel={() => setEditSectionModalOpen(false)}
				okText="確認修改"
				cancelText="取消"
				confirmLoading={updatingSection}
			>
				<Select
					placeholder="請選擇要編輯的區域"
					style={{ width: '100%', marginBottom: '1rem' }}
					options={sectionOptions}
					value={selectedSectionId || undefined}
					onChange={handleSelectSectionForEdit}
				/>
				<Input
					placeholder="請輸入新的區域名稱"
					value={editingSectionName}
					onChange={(e) => setEditingSectionName(e.target.value)}
					onPressEnter={(e) => handleInputEnter(e, handleUpdateSection)}
				/>
			</Modal>
			<Modal
				title="刪除區域"
				open={deleteSectionModalOpen}
				onOk={handleDeleteSection}
				onCancel={() => setDeleteSectionModalOpen(false)}
				okText="確認刪除"
				cancelText="取消"
				confirmLoading={deletingSection}
				okButtonProps={{ danger: true }}
				>
					<Select
						placeholder="請選擇要刪除的區域"
					style={{ width: '100%', marginBottom: '1rem' }}
					options={sectionOptions}
					value={selectedSectionId || undefined}
					onChange={(value) => setSelectedSectionId(value)}
					/>
					<p style={{ margin: 0 }}>
						刪除區域後，原本在該區域的專案會自動移到「其他」。
					</p>
				</Modal>
		</Layout>
	);
};

export default Home;
