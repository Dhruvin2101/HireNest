import multer from "multer";

// Unknown API route -> JSON 404 (instead of Express's HTML page).
export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found", success: false });
};

// Last-resort error handler. Upload/parse problems become 400s with a clear message;
// anything else is logged and returned as a generic 500 without internal details.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Unexpected file upload"
          : "Invalid file upload";
    return res.status(400).json({ message, success: false });
  }
  if (err.name === "UploadError" || err.type === "entity.parse.failed") {
    const message = err.name === "UploadError" ? err.message : "Invalid JSON body";
    return res.status(400).json({ message, success: false });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request is too large", success: false });
  }

  console.error(err);
  res
    .status(err.status && err.status < 500 ? err.status : 500)
    .json({ message: "Something went wrong", success: false });
};
