#!/bin/sh
sleep 1
npx prisma generate
sleep 1
npx prisma migrate dev
sleep 1
npm run start:prod