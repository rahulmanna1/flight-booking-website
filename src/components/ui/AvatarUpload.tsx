'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, User, Camera } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess, onRemove }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadSuccess(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
            {preview ? (
              <Image
                src={preview}
                alt="Avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          {/* Camera overlay button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={uploading}
            />

            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            
            <p className="text-sm text-gray-600 mb-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
              >
                Click to upload
              </button>
              {' '}or drag and drop
            </p>
            
            <p className="text-xs text-gray-500">
              JPEG, PNG or WebP (max. 5MB)
            </p>
          </div>

          {/* Actions */}
          {preview && !uploading && (
            <div className="mt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading image...</span>
        </div>
      )}
    </div>
  );
}
