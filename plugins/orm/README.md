# Gaman ORM Plugin

The Gaman ORM Plugin provides a lightweight Object-Relational Mapping (ORM) system for Gaman applications. It supports basic CRUD operations, automatic data type casting, and model relations through a provider-based architecture.

## Features

- Database-agnostic via providers (e.g., SQLite)
- Automatic data type casting (int, float, string, boolean, json, datetime)
- Model-based relations (hasMany, belongsTo, hasOne)
- Simple query interface
- Lightweight and easy to integrate

## Installation

The ORM plugin is part of the Gaman ecosystem. Ensure you have Gaman installed and include the ORM plugin in your project dependencies.

```bash
npm install @gaman/orm
```

## Setup

1. Import the necessary classes in your application:

```typescript
import { GamanORM, BaseModel, SQLiteProvider } from '@gaman/orm';
```

2. Initialize the ORM with a provider:

```typescript
const orm = new GamanORM(new SQLiteProvider());
await orm.connect();
```

3. Define your models by extending `BaseModel`:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  settings: Record<string, any>;
}

class UserModel extends BaseModel<User> {
  static options = {
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
}
```

## Usage

### Basic CRUD Operations

#### Create
```typescript
const userModel = new UserModel(orm);
await userModel.create({
  name: 'John Doe',
  email: 'john@example.com',
  settings: { theme: 'dark' }
});
```

#### Read
```typescript
// Find all users
const users = await userModel.find();

// Find users with specific criteria
const activeUsers = await userModel.find({ active: true });

// Find one user
const user = await userModel.findOne({ id: 1 });
```

#### Update
```typescript
await userModel.update({ id: 1 }, { name: 'Jane Doe' });
```

#### Delete
```typescript
await userModel.delete({ id: 1 });
```

### Data Casting

The ORM automatically casts data types based on the `casts` option in your model:

- `int` or `integer`: Converts to number
- `float` or `double`: Converts to number
- `string`: Converts to string
- `bool` or `boolean`: Converts to boolean
- `json`: Parses JSON string or keeps as object
- `datetime`: Converts to Date object

### Relations

#### hasMany
```typescript
// Assuming a Post model related to User
class PostModel extends BaseModel<Post> {
  // ... options
}

const posts = await userModel.hasManyPosts(1); // Get posts for user ID 1
```

#### belongsTo
```typescript
const user = await postModel.belongsToUser(1); // Get user for post ID 1
```

#### hasOne
```typescript
const profile = await userModel.hasOneProfile(1); // Get profile for user ID 1
```

## Providers

### SQLite Provider

The SQLite provider uses `sqlite3` and `sqlite` packages. It connects to a `data.db` file in the current directory.

```typescript
import { SQLiteProvider } from '@gaman/orm';

const provider = new SQLiteProvider();
await provider.connect();
// Perform operations
await provider.disconnect();
```

## Example Application

Here's a complete example:

```typescript
import { GamanORM, BaseModel, SQLiteProvider } from '@gaman/orm';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

class UserModel extends BaseModel<User> {
  static options = {
    table: 'users',
    casts: {
      id: 'int',
      created_at: 'datetime',
    },
  };

  constructor(orm: GamanORM) {
    super(orm, UserModel.options);
  }
}

async function main() {
  const orm = new GamanORM(new SQLiteProvider());
  await orm.connect();

  const userModel = new UserModel(orm);

  // Create a user
  await userModel.create({
    name: 'Alice',
    email: 'alice@example.com',
  });

  // Find users
  const users = await userModel.find();
  console.log(users);

  await orm.disconnect();
}

main().catch(console.error);
```

## Notes

- Ensure your database tables exist before performing operations.
- The ORM does not handle migrations; use your database tools for schema management.
- For production, consider using more robust providers or databases.

For more advanced usage, refer to the source code in `index.ts`, `orm.ts`, and `model/base.ts`.