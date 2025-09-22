import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const databaseUrlExists = !!process.env.DATABASE_URL;
    const jwtSecretExists = !!process.env.JWT_SECRET;
    
    // Only show first 20 characters of sensitive values for security
    const databaseUrlPreview = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set';
    
    const jwtSecretPreview = process.env.JWT_SECRET ? 
      process.env.JWT_SECRET.substring(0, 10) + '...' : 'Not set';
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      database_url_set: databaseUrlExists,
      database_url_preview: databaseUrlPreview,
      jwt_secret_set: jwtSecretExists,
      jwt_secret_preview: jwtSecretPreview,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment variables',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}