<p align="right">
  <img src="https://github.com/7TogkID/gaman/blob/main/.github/images/indonesia.png?raw=true" width="23px">
</p>

<p align="center">
  <a href="https://github.com/7TogkID/gaman">
    <img src="https://github.com/7TogkID/gaman/blob/main/.github/images/gaman.png?raw=true" width="25%">
  </a>
</p>

<h1 align="center">GamanJS</h1>
<p align="center">
  <strong>GamanJS is a modern backend framework built for resilience, scalability, and simplicity.</strong>
</p>

---

## 🧠 Philosophy

"Gaman" (我慢) — patience, perseverance, and resilience. These principles are at the heart of GamanJS, empowering developers to build robust and modular web applications effortlessly.

## ✨ Packages

| Package                                        | Release Notes |
| ---------------------------------------------- | ------------- |
| [gaman](https://github.com/7TogkID/gaman)      | v0.0.28       |
| [create-gaman](packages/create-gaman)          | v0.0.1        |
| [@gaman/ejs](packages/gaman-ejs)               | v0.0.11       |
| [@gaman/static](packages/gaman-static)         | v0.0.3        |
| [@gaman/cors](packages/gaman-cors)             | v0.0.2        |
| [@gaman/basic-auth](packages/gaman-basic-auth) | v0.0.2        |
| [@gaman/cli](packages/gaman-cli)               | v0.0.8        |

## 🚀 Get Started

For complete documentation, examples, and best practices, visit the **GamanWiki**:  
[https://github.com/7TogkID/gaman/wiki](https://github.com/7TogkID/gaman/wiki)

### Create a New Project

There are two ways to scaffold a new GamanJS project:

```bash
npx create-gaman@latest
```

This will scaffold a new GamanJS project with the necessary structure.

### Run Your Project

Start your server with:

```bash
npm run dev
```

## 📂 Project Structure

After creating a new project, your file structure will look like this:

```css
src/
├── main.ts
├── main.block.ts
```

## ✏️ Example Code

Here’s a quick example to get you started: <br>
`src/main.ts`

```ts
import mainBlock from "main.block";
import gaman from "gaman";

gaman.serv({
  blocks: [mainBlock], // your blocks
  server: {
    port: 3431, // optional
    host: "0.0.0.0", // optional
  },
});
```

`src/main.block.ts`

```ts
import { defineBlock, Response } from "gaman";

export default defineBlock({
  path: "/",
  all: (ctx) => {
    console.log("middleware ALL");
  },
  routes: {
    "/": (ctx) => {
      return Response.json({ message: "❤️ Welcome to GamanJS" });
    },
    "/article/*": (ctx) => {
      ctx.locals.userName = "Angga7Togk"; // set data locals
    },
    "/article": {
      POST: [
        async (ctx) => {
          const json = await ctx.json();
          return Response.json(json /**return JSON */, { status: 200 });
        },
      ],
      "/json": {
        GET: (ctx) => {
          const userName = ctx.locals.userName;

          // return like Response.json()
          return {
            user_name_from_local: userName,
          };
        },
      },
      "/text": {
        GET: (ctx) => {
          const userName = ctx.locals.userName;

          // return like Response.text()
          return userName;
        },
      },
    },
  },
});
```

Happy coding! ❤️ GamanJS Team
