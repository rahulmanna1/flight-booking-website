import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-prisma';
import cloudinary, { isCloudinaryConfigured, avatarUploadOptions } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Image upload service not configured' },
        { status: 503 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...avatarUploadOptions,
          public_id: `user_${authResult.userId}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error: any) {
    console.error('Avatar upload error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Image upload service not configured' },
        { status: 503 }
      );
    }

    // Get public_id from request body
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'No public_id provided' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error: any) {
    console.error('Avatar delete error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
