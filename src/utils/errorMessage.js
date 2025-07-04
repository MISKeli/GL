// utils/errorHandler.js

/**
 * Centralized error message handler for API responses
 * @param {Object} error - The error object from API calls
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle your backend's specific error format first
  // Structure: { status: 400, data: { error: { code: "...", message: "..." } } }
  if (error?.data?.error?.message) {
    return error.data.error.message;
  }

  // Handle direct message in data (fallback)
  if (error?.data?.message && error.data.message.trim()) {
    return error.data.message;
  }

  // Handle validation errors (object with multiple fields)
  if (error?.data?.errors) {
    return Object.entries(error.data.errors)
      .map(
        ([key, messages]) =>
          `${key}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
      )
      .join("\n");
  }

  // Handle direct error message
  if (error?.message) {
    return error.message;
  }

  // Handle HTTP status codes as fallback
  switch (error?.status) {
    case 400:
      return "Bad request. Please check your input data.";
    case 401:
      return "Authentication failed. Please check your credentials.";
    case 403:
      return "Access forbidden. You don't have permission to perform this action.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict. This resource may already exist.";
    case 422:
      return "Validation failed. Please check your input data.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Get error code from API response (optional utility)
 * @param {Object} error - The error object from API calls
 * @returns {string|null} - Error code or null if not found
 */
export const getErrorCode = (error) => {
  return error?.data?.error?.code || null;
};

/**
 * Check if error is a specific type
 * @param {Object} error - The error object from API calls
 * @param {string} code - The error code to check for
 * @returns {boolean} - True if error matches the code
 */
export const isErrorCode = (error, code) => {
  return getErrorCode(error) === code;
};

/**
 * Handle error with toast notification
 * @param {Object} error - The error object from API calls
 * @param {Function} toast - Toast notification function
 * @param {string} fallbackMessage - Custom fallback message (optional)
 */
export const handleErrorWithToast = (error, toast, fallbackMessage = null) => {
  const errorMessage = fallbackMessage || getErrorMessage(error);
  console.error("API Error:", error);
  toast.error(errorMessage);
};
