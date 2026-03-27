export interface profileDataType {
	id: string;
	username: string;
	created_at?: string;
}

export interface commentDataType {
	id: string;
	project_id: string;
	user_id: string;
	content: string;
	rating: number;
	user_image: string;
	created_at?: string;
	updated_at?: string;
	profiles?:
		| {
				username: string;
		  }[]
		| null;
}

export interface projectDataType {
	id?: string;
	user_id: string;
	image: string;
	title: string;
	body: string;
	created_at?: string;
	updated_at?: string;
	isFavorite?: boolean;
}
