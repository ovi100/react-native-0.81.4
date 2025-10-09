import { API_URL } from "../app-config";
import { toast } from "../utils";


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