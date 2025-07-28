# CRUD GamanJS x PrismaJS

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
