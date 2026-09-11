require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: { roles: true, company: true }
  });
  console.log(JSON.stringify(users.map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    roles: u.roles.map(r => r.name),
    company: u.company ? u.company.name : null
  })), null, 2));
}

main().then(() => { prisma.$disconnect(); pool.end(); }).catch(e => console.error(e));
