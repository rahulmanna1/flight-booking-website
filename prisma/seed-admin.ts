import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flightbooker.com' },
    update: {
      role: 'SUPER_ADMIN', // Ensure role is updated
    },
    create: {
      email: 'admin@flightbooker.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      preferences: JSON.stringify({
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      }),
      frequentFlyerNumbers: JSON.stringify([]),
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123');
  console.log('👤 Role:', admin.role);
  console.log('');
  console.log('⚠️  IMPORTANT: Change this password in production!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
