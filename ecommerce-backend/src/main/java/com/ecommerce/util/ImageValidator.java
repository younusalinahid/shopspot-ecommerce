package com.ecommerce.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/** Accepts only real JPEG / PNG / WebP / GIF images (checked by file signature, not by name). */
public final class ImageValidator {

    private ImageValidator() {
    }

    public static byte[] readImage(MultipartFile file, long maxBytes) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please choose an image");
        }
        if (file.getSize() > maxBytes) {
            throw new RuntimeException("Image must be smaller than " + (maxBytes / (1024 * 1024)) + " MB");
        }
        byte[] bytes = file.getBytes();
        if (!isImage(bytes)) {
            throw new RuntimeException("Only JPG, PNG, WebP or GIF images are allowed");
        }
        return bytes;
    }

    /** MIME type for a validated image, used when serving it back. */
    public static String contentType(byte[] b) {
        if (b == null || b.length < 12) return "application/octet-stream";
        if ((b[0] & 0xFF) == 0x89 && b[1] == 'P') return "image/png";
        if (b[0] == 'G' && b[1] == 'I' && b[2] == 'F') return "image/gif";
        if (b[0] == 'R' && b[1] == 'I' && b[8] == 'W') return "image/webp";
        return "image/jpeg";
    }

    public static boolean isImage(byte[] b) {
        if (b == null || b.length < 12) return false;
        boolean jpeg = (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean gif = b[0] == 'G' && b[1] == 'I' && b[2] == 'F';
        boolean webp = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        return jpeg || png || gif || webp;
    }
}
