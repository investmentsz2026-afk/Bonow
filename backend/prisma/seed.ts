import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la siembra de datos iniciales (Seeding)...');

  // 1. Crear Roles Básicos
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador general del sistema con acceso total.',
    },
  });

  const businessRole = await prisma.role.upsert({
    where: { name: 'BUSINESS' },
    update: {},
    create: {
      name: 'BUSINESS',
      description: 'Cuenta de empresa comercial o negocio socio.',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Usuario cliente o miembro del club.',
    },
  });

  console.log('✅ Roles creados o verificados (ADMIN, BUSINESS, USER)');

  // 2. Crear Usuario Administrador Principal
  const adminEmail = 'admin@wynni.com';
  const hashedPassword = bcrypt.hashSync('admin123password', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Principal',
      status: 'ACTIVE',
      isEmailVerified: true,
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
  });

  console.log(`✅ Usuario Admin verificado: ${adminUser.email} (Password: admin123password)`);

  // 3. Crear Categorías por Defecto
  const defaultCategories = [
    { name: 'GASTRONOMÍA & RESTAURANTES', slug: 'gastronomia', icon: 'Utensils' },
    { name: 'ENTRETENIMIENTO & ESTILO DE VIDA', slug: 'entretenimiento', icon: 'Film' },
    { name: 'SALUD & BIENESTAR', slug: 'salud-bienestar', icon: 'HeartPulse' },
    { name: 'VIAJES & HOTELES', slug: 'viajes-hoteles', icon: 'Plane' },
    { name: 'TECNOLOGÍA & SERVICIOS', slug: 'tecnologia-servicios', icon: 'ShoppingBag' },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });
  }

  console.log('✅ Categorías por defecto creadas correctamente');
  console.log('🎉 Siembra completada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
