// Script to delete all users from database
// Run with: npx tsx scripts/delete-all-users.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log('🔍 Finding all users...');
    
    const users = await prisma.user.findMany();
    console.log(`📧 Found ${users.length} users`);
    
    // Delete related records first (due to foreign key constraints)
    console.log('\n🗑️  Deleting related records...');
    
    // Delete bookings
    const bookingsDeleted = await prisma.booking.deleteMany({});
    console.log(`   ✅ Deleted ${bookingsDeleted.count} bookings`);
    
    // Delete price alerts
    const priceAlertsDeleted = await prisma.priceAlert.deleteMany({});
    console.log(`   ✅ Deleted ${priceAlertsDeleted.count} price alerts`);
    
    // Delete notifications
    const notificationsDeleted = await prisma.notification.deleteMany({});
    console.log(`   ✅ Deleted ${notificationsDeleted.count} notifications`);
    
    // Now delete all users
    console.log('\n👥 Deleting all users...');
    const result = await prisma.user.deleteMany({});
    
    console.log(`\n🎉 Successfully deleted ${result.count} users and all related data!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
