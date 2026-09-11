require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const notifs = await prisma.notification.findMany({
    where: { userId: 'c72c4c72-f4df-43ff-b920-8ee3bf0f5059' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(notifs, null, 2));
}

main().then(() => { prisma.$disconnect(); pool.end(); }).catch(e => console.error(e));
