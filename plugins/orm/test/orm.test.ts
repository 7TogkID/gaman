import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GamanORM } from '../orm';
import { SQLiteProvider } from '../provider/sqlite';
import { BaseModel, BaseModelOptions } from '../model/base';

interface User {
	id: number;
	name: string;
	email: string;
	created_at: Date;
	settings: object;
}

class UserModel extends BaseModel<User> {
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

class PostModel extends BaseModel<Post> {
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

	belongsToUser() {
		return this.belongsTo(UserModel, 'user_id');
	}
}

describe('GamanORM', () => {
	let orm: GamanORM;
	let provider: SQLiteProvider;

	beforeAll(async () => {
		provider = new SQLiteProvider();
		orm = new GamanORM(provider);
		await orm.connect();

		// Create tables for testing
		await provider.db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY,
				name TEXT,
				email TEXT,
				created_at TEXT,
				settings TEXT
			)
		`);

		await provider.db.exec(`
			CREATE TABLE IF NOT EXISTS posts (
				id INTEGER PRIMARY KEY,
				user_id INTEGER,
				title TEXT,
				content TEXT,
				published INTEGER
			)
		`);
	});

	afterAll(async () => {
		await orm.disconnect();
	});

	describe('UserModel', () => {
		it('should create a user with proper casting', async () => {
			const userModel = new UserModel(orm);
			const userData = {
				name: 'John Doe',
				email: 'john@example.com',
				created_at: '2023-01-01T00:00:00Z',
				settings: '{"theme": "dark"}',
			};

			const user = await userModel.create(userData);

			expect(user.name).toBe('John Doe');
			expect(user.email).toBe('john@example.com');
			expect(user.created_at).toBeInstanceOf(Date);
			expect(user.settings).toEqual({ theme: 'dark' });
		});

		it('should find users with casting applied', async () => {
			const userModel = new UserModel(orm);
			const users = await userModel.find();

			expect(users.length).toBeGreaterThan(0);
			const user = users[0];
			expect(typeof user.id).toBe('number');
			expect(user.created_at).toBeInstanceOf(Date);
			expect(typeof user.settings).toBe('object');
		});

		it('should find one user with casting', async () => {
			const userModel = new UserModel(orm);
			const user = await userModel.findOne({ name: 'John Doe' });

			expect(user).toBeTruthy();
			expect(user?.created_at).toBeInstanceOf(Date);
		});
	});

	describe('PostModel', () => {
		it('should create a post with casting', async () => {
			const postModel = new PostModel(orm);
			const postData = {
				user_id: 1,
				title: 'Test Post',
				content: 'This is a test post',
				published: 1,
			};

			const post = await postModel.create(postData);

			expect(post.title).toBe('Test Post');
			expect(typeof post.user_id).toBe('number');
			expect(typeof post.published).toBe('boolean');
		});
	});

	describe('Relations', () => {
		it('should have relation methods available', () => {
			const userModel = new UserModel(orm);
			const postModel = new PostModel(orm);

			// These are placeholders, but should not throw errors
			expect(() => userModel.hasManyPosts()).not.toThrow();
			expect(() => postModel.belongsToUser()).not.toThrow();
		});
	});
});
