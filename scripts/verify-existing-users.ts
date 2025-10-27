// Script to mark all existing users as email verified
// Run with: npx tsx scripts/verify-existing-users.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyExistingUsers() {
  try {
    console.log('🔍 Finding all users...');
    
    const users = await prisma.user.findMany();
    
    console.log(`📧 Found ${users.length} users`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      const prefs = JSON.parse(user.preferences);
      
      // Check if already verified
      if (!prefs.emailVerified) {
        prefs.emailVerified = true;
        
        // Remove any pending verification tokens
        delete prefs.verificationToken;
        delete prefs.verificationTokenExpiry;
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            preferences: JSON.stringify(prefs)
          }
        });
        
        console.log(`✅ Verified user: ${user.email}`);
        updatedCount++;
      } else {
        console.log(`ℹ️  Already verified: ${user.email}`);
      }
    }
    
    console.log(`\n🎉 Successfully verified ${updatedCount} users!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyExistingUsers();
