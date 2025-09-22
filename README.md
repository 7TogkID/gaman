<p align="right">
  <img src="https://github.com/7TogkID/gaman/blob/main/.github/images/indonesia.png?raw=true" width="23px">
</p>

<p align="center">
  <a href="https://gaman.7togk.id">
    <img src="https://raw.githubusercontent.com/7TogkID/gaman/refs/heads/master/.github/images/gaman-2.png" width="100%" >
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@gaman/core" alt="npm version">
  <img src="https://img.shields.io/npm/dm/@gaman/core" alt="npm download">
  <img src="https://img.shields.io/npm/l/@gaman/core" alt="npm license">
  <img src="https://img.shields.io/github/stars/7togkid/gaman" alt="github stars">
</p>

---

## About GamanJS

**GamanJS** is a modern, lightweight Node.js web framework built with TypeScript that emphasizes simplicity, performance, and developer experience. Inspired by the Indonesian word "gaman" (meaning patience/endurance), this framework provides a robust foundation for building scalable web applications and APIs with minimal configuration.

### ✨ Key Features

- **🚀 Fast & Lightweight** - Built on top of Node.js HTTP module for optimal performance
- **📁 Convention over Configuration** - Auto-discovery of routes, middlewares, and interceptors
- **🔧 TypeScript First** - Full TypeScript support with excellent type safety
- **🧩 Plugin Ecosystem** - Rich collection of official plugins for common use cases
- **🛡️ Built-in Security** - CORS, rate limiting, and authentication plugins included
- **🔄 Hot Reload** - Development server with automatic file watching
- **📊 WebSocket Support** - Real-time communication capabilities
- **🎨 Template Engines** - Support for EJS and Nunjucks templating
- **💾 Database Integration** - ORM plugin with multiple database support
- **⚡ Modern ES Modules** - Full ESM support for modern JavaScript

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.20.8
- npm or yarn

### Installation

Create a new GamanJS project using the official scaffolding tool:

```bash
npm create gaman@latest my-app
cd my-app
npm install
npm run dev
```

Or manually install the core package:

```bash
npm install @gaman/core
```

### Basic Usage

Create a simple server:

```typescript
// src/index.ts
import { defineBootstrap } from '@gaman/core';

defineBootstrap(async (app) => {
  const server = await app.mountServer();
  console.log('🚀 Server running on http://localhost:3431');
});
```

Create your first route:

```typescript
// src/routes/hello.ts
import { Routes } from '@gaman/common';

export default new Routes()
  .get('/hello', (req, res) => {
    res.json({ message: 'Hello, GamanJS!' });
  })
  .get('/hello/:name', (req, res) => {
    res.json({ message: `Hello, ${req.params.name}!` });
  });
```

## 🧩 Official Plugins

GamanJS comes with a rich ecosystem of official plugins:

| Plugin | Description | Package |
|--------|-------------|---------|
| **CORS** | Cross-Origin Resource Sharing support | `@gaman/cors` |
| **Static** | Static file serving | `@gaman/static` |
| **Basic Auth** | HTTP Basic Authentication | `@gaman/basic-auth` |
| **Rate Limit** | Request rate limiting | `@gaman/rate-limit` |
| **Session** | Session management | `@gaman/session` |
| **Validation** | Request validation | `@gaman/validation` |
| **WebSocket** | WebSocket support | `@gaman/websocket` |
| **ORM** | Database ORM integration | `@gaman/orm` |
| **EJS** | EJS template engine | `@gaman/ejs` |
| **Nunjucks** | Nunjucks template engine | `@gaman/nunjucks` |

### Plugin Usage Example

```typescript
// src/index.ts
import { defineBootstrap } from '@gaman/core';
import cors from '@gaman/cors';
import staticFiles from '@gaman/static';

defineBootstrap(async (app) => {
  // Mount plugins
  app.mount(
    cors({ origin: '*' }),
    staticFiles({ root: './public' })
  );

  const server = await app.mountServer();
  console.log('🚀 Server running with plugins!');
});
```

## 📁 Project Structure

GamanJS follows a convention-based approach for organizing your application:

```
my-gaman-app/
├── src/
│   ├── routes/          # Route definitions (auto-discovered)
│   ├── middlewares/     # Global middlewares (auto-discovered)
│   ├── interceptors/    # Request/response interceptors (auto-discovered)
│   ├── exceptions/      # Exception handlers (auto-discovered)
│   └── index.ts         # Application entry point
├── public/              # Static files
├── gaman.config.mjs     # Configuration file
└── package.json
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run start    # Start production server
npm test         # Run tests
```

### Configuration

Create a `gaman.config.mjs` file in your project root:

```javascript
export default {
  server: {
    port: 3431,
    host: '127.0.0.1'
  },
  build: {
    outDir: 'dist'
  }
};
```

## 📚 Documentation

For comprehensive guides, API references, and examples, visit our [official documentation](https://gaman.7togk.id).

## 🤝 Contributing

We welcome contributions from the community! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Setup

```bash
git clone https://github.com/7TogkID/gaman.git
cd gaman
npm install
npm run build
npm run test
```

## 📞 Community & Support

- **📖 Documentation**: [gaman.7togk.id](https://gaman.7togk.id)
- **💬 Discord**: [Join our Discord](https://discord.gg/CQ6fEqBe8f)
- **📱 WhatsApp**: [WhatsApp Channel](https://whatsapp.com/channel/0029VbB0keR7z4kgczdSZ33s)
- **🐛 Issues**: [GitHub Issues](https://github.com/7togkid/gaman/issues)

## 📄 License

GamanJS is [MIT licensed](https://github.com/7togkid/gaman/blob/main/LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/angga7togk">angga7togk</a> and the GamanJS community
</p>
