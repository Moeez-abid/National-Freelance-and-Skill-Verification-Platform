/**
 * Generic response wrapper to ensure consistent API output across all modules.
 */
exports.sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

exports.sendError = (res, error = "Internal Server Error", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: typeof error === "string" ? error : error.message,
    timestamp: new Date().toISOString()
  });
};
