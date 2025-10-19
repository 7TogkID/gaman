import { BaseModel, BaseModelOptions } from './model/base.js';
import { GamanORM } from './orm.js';

interface User {
	id: number;
	name: string;
	email: string;
	created_at: Date;
	settings: object;
}

export class UserModel extends BaseModel<User> {
	constructor(orm: GamanORM) {
		const options: BaseModelOptions<User> = {
			table: 'users',
			casts: {
				id: 'int',
				created_at: 'datetime',
				settings: 'json',
			},
		};
		super(orm, options);
	}

	// Example relation: User has many posts
	hasManyPosts() {
		return this.hasMany(PostModel, 'user_id');
	}
}

interface Post {
	id: number;
	user_id: number;
	title: string;
	content: string;
	published: boolean;
}

export class PostModel extends BaseModel<Post> {
	constructor(orm: GamanORM) {
		const options: BaseModelOptions<Post> = {
			table: 'posts',
			casts: {
				id: 'int',
				user_id: 'int',
				published: 'boolean',
			},
		};
		super(orm, options);
	}

	// Example relation: Post belongs to user
	belongsToUser() {
		return this.belongsTo(UserModel, 'user_id');
	}
}
