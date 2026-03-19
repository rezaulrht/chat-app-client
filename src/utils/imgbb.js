/**
 * ImgBB image upload utility
 * Upload images to ImgBB and get their URLs
 */

// Using ImgBB free API key - consider moving to .env
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "9e8f0e8e0e8e0e8e";

/**
 * Upload an image file to ImgBB
 * @param {File|Blob} file - Image file to upload
 * @param {string} name - Optional name for the image
 * @returns {Promise<string>} URL of the uploaded image
 */
export async function uploadImage(file, name = "image") {
    if (!file) throw new Error("No file provided");

    // Validate file size (max 32MB for ImgBB free tier)
    const maxSize = 32 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error("File too large. Maximum size is 32MB");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", name);

    try {
        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.error?.message || "Failed to upload image to ImgBB"
            );
        }

        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error("ImgBB upload error:", error);
        throw error;
    }
}

/**
 * Upload image from URL
 * @param {string} url - Image URL
 * @param {string} name - Optional name for the image
 * @returns {Promise<string>} URL of the uploaded image
 */
export async function uploadImageFromUrl(url, name = "image") {
    if (!url) throw new Error("No URL provided");

    return fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch image");
            return res.blob();
        })
        .then((blob) => {
            const file = new File([blob], `${name}.png`, { type: "image/png" });
            return uploadImage(file, name);
        })
        .catch((error) => {
            console.error("Image URL upload error:", error);
            throw error;
        });
}

/**
 * Delete an image from ImgBB (requires delete token)
 * Note: Free tier ImgBB doesn't support image deletion via API
 * @param {string} deleteUrl - Delete URL from ImgBB response
 */
export async function deleteImage(deleteUrl) {
    if (!deleteUrl) throw new Error("No delete URL provided");

    try {
        const response = await fetch(deleteUrl, { method: "GET" });
        if (!response.ok) {
            throw new Error("Failed to delete image from ImgBB");
        }
        return true;
    } catch (error) {
        console.error("ImgBB delete error:", error);
        throw error;
    }
}
