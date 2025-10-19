/**
 * @fileoverview Sample models demonstrating the use of BaseModel for ORM operations.
 * This file provides example User and Post models with relations and casting.
 */

import { BaseModel, BaseModelOptions } from './model/base.js';
import { GamanORM } from './orm.js';

/**
 * Interface representing a User entity in the database.
 */
interface User {
	id: number;
	name: string;
	email: string;
	created_at: Date;
	settings: Record<string, any>;
}

/**
 * UserModel extends BaseModel to provide ORM functionality for the 'users' table.
 * It includes data casting for specific fields and demonstrates a hasMany relation.
 *
 * @example
 * ```typescript
 * const userModel = new UserModel(orm);
 * const users = await userModel.find({ active: true });
 * const posts = await userModel.hasManyPosts(1);
 * ```
 */
export class UserModel extends BaseModel<User> {
	static options: BaseModelOptions<User> = {
		table: 'users',
		casts: {
			id: 'int',
			created_at: 'datetime',
			settings: 'json',
		},
	};

	constructor(orm: GamanORM) {
		super(orm, UserModel.options);
	}

	/**
	 * Defines a hasMany relation to PostModel.
	 * Retrieves all posts associated with a specific user.
	 * @param userId The ID of the user to get posts for.
	 * @returns A promise resolving to an array of Post objects.
	 */
	async hasManyPosts(userId: number): Promise<Post[]> {
		return this.hasMany(PostModel.options, PostModel, 'user_id', 'id', userId);
	}
}

/**
 * Interface representing a Post entity in the database.
 */
interface Post {
	id: number;
	user_id: number;
	title: string;
	content: string;
	published: boolean;
}

/**
 * PostModel extends BaseModel to provide ORM functionality for the 'posts' table.
 * It includes data casting and demonstrates a belongsTo relation.
 *
 * @example
 * ```typescript
 * const postModel = new PostModel(orm);
 * const posts = await postModel.find({ published: true });
 * const user = await postModel.belongsToUser(1);
 * ```
 */
export class PostModel extends BaseModel<Post> {
	static options: BaseModelOptions<Post> = {
		table: 'posts',
		casts: {
			id: 'int',
			user_id: 'int',
			published: 'boolean',
		},
	};

	constructor(orm: GamanORM) {
		super(orm, PostModel.options);
	}

	/**
	 * Defines a belongsTo relation to UserModel.
	 * Retrieves the user associated with a specific post.
	 * @param postId The ID of the post to get the user for.
	 * @returns A promise resolving to a User object or null.
	 */
	async belongsToUser(postId: number): Promise<User | null> {
		return this.belongsTo(UserModel.options, UserModel, 'id', 'id', postId);
	}
}
