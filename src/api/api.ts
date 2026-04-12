import { PostgrestError } from '@supabase/supabase-js';
import { publicSupabase, supabase } from './supabaseClient';
import { commentDataType, projectDataType, sectionDataType } from '../assets/data';

type RawCommentRow = {
	id: string;
	project_id: string;
	user_id: string;
	content: string;
	rating: number;
	user_image: string;
	created_at?: string;
	updated_at?: string;
};

async function attachProfiles(rows: RawCommentRow[] | null): Promise<commentDataType[]> {
	if (!rows || rows.length === 0) return [];

	const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
	const { data: profileRows, error: profileError } = await publicSupabase
		.from('profiles')
		.select('id, username')
		.in('id', userIds);

	if (profileError) {
		console.error('Error fetching profiles for comments:', profileError);
		throw profileError;
	}

	const profileMap = new Map(
		(profileRows || []).map((profile) => [profile.id, profile.username])
	);

	return rows.map((row) => ({
		id: row.id,
		project_id: row.project_id,
		user_id: row.user_id,
		content: row.content,
		rating: row.rating,
		user_image: row.user_image,
		created_at: row.created_at,
		updated_at: row.updated_at,
		profiles: profileMap.has(row.user_id)
			? [{ username: profileMap.get(row.user_id)! }]
			: null,
	}));
}

export async function uploadImage(file: File): Promise<string> {
	const fileName = `${Date.now()}-${file.name}`;
	const { error } = await supabase.storage.from('images').upload(fileName, file);

	if (error) {
		console.error('Error uploading image:', error);
		throw error;
	}

	const { data: publicUrlData } = supabase.storage
		.from('images')
		.getPublicUrl(fileName);

	if (!publicUrlData?.publicUrl) {
		throw new Error('Failed to get public URL for the uploaded image.');
	}

	return publicUrlData.publicUrl;
}

export async function getBookData(): Promise<projectDataType[]> {
	const {
		data,
		error,
	}: { data: projectDataType[] | null; error: PostgrestError | null } =
		await publicSupabase
			.from('projects')
			.select('*')
			.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching project data:', error);
		throw error;
	}

	return data || [];
}

export async function getSectionsData(): Promise<sectionDataType[]> {
	const { data, error } = await publicSupabase
		.from('sections')
		.select('*')
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching sections:', error);
		throw error;
	}

	return data || [];
}

export async function createSection(
	name: string,
	createdBy: string
): Promise<sectionDataType> {
	const { data, error } = await supabase
		.from('sections')
		.insert([{ name, created_by: createdBy }])
		.select('*')
		.single();

	if (error) {
		console.error('Error creating section:', error);
		throw error;
	}

	return data as sectionDataType;
}

export async function updateSectionName(
	sectionId: string,
	name: string
): Promise<sectionDataType> {
	const { data, error } = await supabase
		.from('sections')
		.update({ name })
		.eq('id', sectionId)
		.select('*')
		.single();

	if (error) {
		console.error('Error updating section:', error);
		throw error;
	}

	return data as sectionDataType;
}

export async function deleteSection(sectionId: string): Promise<void> {
	const { error } = await supabase.from('sections').delete().eq('id', sectionId);

	if (error) {
		console.error('Error deleting section:', error);
		throw error;
	}
}

export async function getBookById(id: string): Promise<projectDataType | null> {
	const { data, error } = await publicSupabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.maybeSingle();

	if (error) {
		console.error('Error fetching project detail:', error);
		throw error;
	}

	return data;
}

export async function deleteBookData(id: string): Promise<projectDataType[]> {
	const {
		data,
		error,
	}: { data: projectDataType[] | null; error: PostgrestError | null } =
		await supabase.from('projects').delete().eq('id', id).select();

	if (error) {
		console.error('Error deleting project data:', error);
		throw error;
	}

	return data || [];
}

export async function addBookData(
	project: projectDataType
): Promise<projectDataType[]> {
	const {
		data,
		error,
	}: { data: projectDataType[] | null; error: PostgrestError | null } =
		await supabase.from('projects').insert([project]).select();

	if (error) {
		console.error('Error adding book data:', error);
		throw error;
	}

	return data || [];
}

export async function addBookWithImage(
	book: Omit<projectDataType, 'id' | 'image'>,
	file: File
): Promise<projectDataType[]> {
	const imageUrl = await uploadImage(file);
	return addBookData({ ...book, image: imageUrl });
}

export async function updateBookData(
	project: Partial<projectDataType> & { id: string }
): Promise<projectDataType[]> {
	const {
		data,
		error,
	}: { data: projectDataType[] | null; error: PostgrestError | null } =
		await supabase.from('projects').update(project).eq('id', project.id).select();

	if (error) {
		console.error('Error updating project data:', error);
		throw error;
	}

	return data || [];
}

export async function getCommentsByProjectId(
	projectId: string
): Promise<commentDataType[]> {
	const { data, error } = await publicSupabase
		.from('comments')
		.select('id, project_id, user_id, content, rating, user_image, created_at, updated_at')
		.eq('project_id', projectId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching comments:', error);
		throw error;
	}

	return attachProfiles(data as RawCommentRow[] | null);
}

export async function createComment(
	comment: Omit<commentDataType, 'id' | 'created_at' | 'updated_at' | 'profiles'>
): Promise<commentDataType[]> {
	const { data, error } = await supabase
		.from('comments')
		.insert([comment])
		.select('id, project_id, user_id, content, rating, user_image, created_at, updated_at');

	if (error) {
		console.error('Error creating comment:', error);
		throw error;
	}

	return attachProfiles(data as RawCommentRow[] | null);
}

export async function updateComment(
	commentId: string,
	payload: Pick<commentDataType, 'content' | 'rating'>
): Promise<commentDataType[]> {
	const { data, error } = await supabase
		.from('comments')
		.update({
			content: payload.content,
			rating: payload.rating,
		})
		.eq('id', commentId)
		.select('id, project_id, user_id, content, rating, user_image, created_at, updated_at');

	if (error) {
		console.error('Error updating comment:', error);
		throw error;
	}

	return attachProfiles(data as RawCommentRow[] | null);
}

export async function deleteComment(commentId: string): Promise<void> {
	const { error } = await supabase.from('comments').delete().eq('id', commentId);

	if (error) {
		console.error('Error deleting comment:', error);
		throw error;
	}
}
