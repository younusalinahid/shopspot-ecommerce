package com.ecommerce.util;

import java.util.Arrays;

/**
 * Builds image links instead of embedding images as base64 in JSON.
 * Embedded images made product lists several MB, which caused slow pages and
 * "ClientAbortException: SocketTimeoutException" when the browser gave up.
 */
public final class ImageUrls {

    private ImageUrls() {
    }

    /** "/api/public/products/{id}/image?v={content hash}", or null when the product has no image. */
    public static String product(Long productId, byte[] image) {
        if (productId == null || image == null || image.length == 0) return null;
        // The hash changes when the image changes, so browsers can cache the URL for a long time
        return "/api/public/products/" + productId + "/image?v=" + Integer.toHexString(Arrays.hashCode(image));
    }
}
