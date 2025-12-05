import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;

class ImageCompressionService {
  static const int maxFileSizeBytes = 10 * 1024 * 1024; // 10 MB
  static const int targetFileSizeBytes = 2 * 1024 * 1024; // 2 MB target
  static const int minQuality = 50;
  static const int maxQuality = 95;
  static const int initialQuality = 85;

  /// Compress an image file to reduce its size
  ///
  /// [file] - The image file to compress
  /// Returns the compressed file or the original if compression fails
  Future<File> compressImage(File file) async {
    try {
      final fileSize = await file.length();

      // If file is already small enough, return it
      if (fileSize <= targetFileSizeBytes) {
        return file;
      }

      // Get temporary directory for compressed file
      final tempDir = await getTemporaryDirectory();
      final targetPath = path.join(
        tempDir.path,
        'compressed_${path.basename(file.path)}',
      );

      // Try compression with initial quality
      File? compressedFile = await _compressWithQuality(
        file,
        targetPath,
        initialQuality,
      );

      if (compressedFile != null) {
        final compressedSize = await compressedFile.length();

        // If still too large, try with lower quality
        if (compressedSize > targetFileSizeBytes) {
          compressedFile = await _compressWithQuality(
            file,
            targetPath,
            minQuality,
          );
        }

        return compressedFile ?? file;
      }

      return file;
    } catch (e) {
      // If compression fails, return original file
      return file;
    }
  }

  /// Compress multiple images
  ///
  /// [files] - List of image files to compress
  /// Returns list of compressed files
  Future<List<File>> compressImages(List<File> files) async {
    final List<File> compressedFiles = [];

    for (final file in files) {
      final compressed = await compressImage(file);
      compressedFiles.add(compressed);
    }

    return compressedFiles;
  }

  /// Compress image with specific quality
  Future<File?> _compressWithQuality(
    File file,
    String targetPath,
    int quality,
  ) async {
    try {
      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        quality: quality,
        minWidth: 1920,
        minHeight: 1920,
        format: CompressFormat.jpeg,
      );

      return result != null ? File(result.path) : null;
    } catch (e) {
      return null;
    }
  }

  /// Validate image file size
  ///
  /// [file] - The image file to validate
  /// Returns true if file size is within limits
  Future<bool> validateImageSize(File file) async {
    try {
      final fileSize = await file.length();
      return fileSize <= maxFileSizeBytes;
    } catch (e) {
      return false;
    }
  }

  /// Get human-readable file size
  ///
  /// [bytes] - File size in bytes
  /// Returns formatted string (e.g., "2.5 MB")
  String formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    } else {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
  }
}
