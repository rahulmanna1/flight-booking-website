import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Get credentials from https://cloudinary.com/console
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

// Helper function to check if Cloudinary is configured
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Upload options for avatars
export const avatarUploadOptions = {
  folder: 'flight-booker/avatars',
  transformation: [
    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
  max_file_size: 5000000 // 5MB
};
