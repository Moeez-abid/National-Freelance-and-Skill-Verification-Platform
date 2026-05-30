import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  handleFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // ============================================
    // DEBUG LOG
    // ============================================
    console.log('📁 Uploaded file:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    const mime = file.mimetype || '';

    // ============================================
    // ALLOWED FILE TYPES
    // ============================================
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'image/gif',

      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',

      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      // PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Text
      'text/plain',
    ];

    const isValidType =
      allowedTypes.includes(mime) ||
      mime.startsWith('image/') ||
      mime.startsWith('video/');

    if (!isValidType) {
      throw new Error('Invalid file type');
    }

    // ============================================
    // SIZE VALIDATION
    // videos up to 500MB
    // others up to 20MB
    // ============================================
    if (mime.startsWith('video/')) {
      if (file.size > 500 * 1024 * 1024) {
        throw new Error('Video file too large');
      }
    } else {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('File too large');
      }
    }

    // ============================================
    // FILE TYPE DETECTION FOR FRONTEND RENDERING
    // ============================================
    let fileType:
      | 'image'
      | 'video'
      | 'pdf'
      | 'doc'
      | 'xlsx'
      | 'pptx'
      | 'txt'
      | 'file' = 'file';

    if (mime.startsWith('image/')) {
      fileType = 'image';
    } else if (mime.startsWith('video/')) {
      fileType = 'video';
    } else if (mime === 'application/pdf') {
      fileType = 'pdf';
    } else if (
      mime === 'application/msword' ||
      mime ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileType = 'doc';
    } else if (
      mime === 'application/vnd.ms-excel' ||
      mime ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      fileType = 'xlsx';
    } else if (
      mime === 'application/vnd.ms-powerpoint' ||
      mime ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      fileType = 'pptx';
    } else if (mime === 'text/plain') {
      fileType = 'txt';
    }

    // ============================================
    // FILE URL GENERATION
    // ============================================
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    // ============================================
    // SUCCESS RESPONSE
    // ============================================
    return {
      success: true,
      fileUrl,
      fileName: file.originalname,
      type: fileType,
    };
  }
}