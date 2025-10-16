import { API_URL, APP_STAGE } from "../app-config";
// import { toast } from "../utils";


/**
 * Fetch user details by ID.
 * @param {string} id - User ID.
 * @param {string} token - Bearer token.
 * @returns {Promise<object>} The user object from backend.
 */
export const getUser = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/users/profile/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
};


/**
 * Reusable function for uploading files to a server via API
 *
 * @async
 * @function uploadFile
 * @param {Object} options - Configuration options for the file upload
 * @param {string} options.uploadUrl - Base URL of the API endpoint
 * @param {{uri: string, fileName: string, type: string}} options.file - File object containing uri, fileName and type
 * @param {string} options.path - Destination path for the storage
 * @param {Function} [options.onProgress] - Callback for upload progress (receives boolean)
 * @param {Function} [options.onSuccess] - Success callback (receives response data)
 * @param {Function} [options.onError] - Error callback (receives error object)
 * @returns {Promise<void>} - Promise that resolves when upload completes
 *
 * @example
 * await uploadFile({
 *   file: {
 *     uri: 'file://path/to/file.jpg',
 *     fileName: 'image.jpg',
 *     type: 'image/jpeg'
 *   },
 *   path: 'production/images/uploaded-image.jpg',
 *   onProgress: (isUploading) => console.log(isUploading),
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (err) => console.error('Error:', err)
 * });
 */

export const uploadFile = async options => {
  const { uploadUrl, file, path, onProgress, onSuccess, onError } = options;

  const formData = new FormData();
  formData.append('image', {
    uri: file.uri,
    name: file.fileName,
    type: file.type,
  });
  formData.append('path', `${APP_STAGE}/${path}`.toLowerCase());

  try {
    if (onProgress) onProgress(true);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed. Please try after few minutes');
    }
    const result = await response.json();
    if (onSuccess) onSuccess(result);
  } catch (error) {
    if (onError) onError(error);
  } finally {
    if (onProgress) onProgress(false);
  }
};
