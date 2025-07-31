<p align="right">
  <img src="https://github.com/7TogkID/gaman/blob/main/.github/images/indonesia.png?raw=true" width="23px">
</p>

<p align="center">
  <a href="https://gaman.7togk.id">
    <img src="https://github.com/7TogkID/gaman/blob/main/.github/images/gaman.png?raw=true" width="25%">
  </a>
</p>

<h1 align="center">GamanJS x PrismaJS</h1>
<p align="center">
  <strong>GamanJS is a modern backend framework built for resilience, scalability, and simplicity.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@gaman/core" alt="npm version">
  <img src="https://img.shields.io/npm/dm/@gaman/core" alt="npm download">
  <img src="https://img.shields.io/npm/l/@gaman/core" alt="npm license">
  <img src="https://img.shields.io/github/stars/7togkid/gaman" alt="github stars">
</p>

---

## !DISCLAIMER

I didn't make any validation in this CRUD so please learn it yourself :)

## How to run?

first create your `DATABASE_URL` into .env file

default `mysql://root:@127.0.0.1:3306/gaman_prisma`


If you have finished setting up the `.env` file, now please run the command below.
```bash
# install first
npm install

# setup prisma
npx prisma migrate dev
npx prisma generate

# run app
npm run dev

# for production
npm run build
npm start
```

## Documentation

visit our [official documentation](https://gaman.7togk.id)

## Contributing

**New Contributing welcome!** Check out our [Contributing Guide](CONTRIBUTING.md) for help getting started.

## Links

- [License (MIT)](https://github.com/7togkid/gaman/blob/main/LICENSE)
- [Official Website](https://gaman.7togk.id)
