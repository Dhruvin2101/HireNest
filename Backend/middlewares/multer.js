import multer from "multer";

const storage = multer.memoryStorage();

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PDF_TYPES = ["application/pdf"];

// Thrown for a wrong file type; the error handler turns it into a 400.
export class UploadError extends Error {
  constructor(message) {
    super(message);
    this.name = "UploadError";
    this.status = 400;
  }
}

const fileFilter = (allowedByField) => (req, file, cb) => {
  const allowed = allowedByField[file.fieldname];
  if (!allowed) {
    return cb(new UploadError(`Unexpected file field "${file.fieldname}"`));
  }
  if (!allowed.types.includes(file.mimetype)) {
    return cb(new UploadError(allowed.message));
  }
  cb(null, true);
};

const imageRule = {
  types: IMAGE_TYPES,
  message: "Images must be JPG, PNG, WEBP or GIF",
};

// Profile photo at signup and company logo: one image, max 2 MB.
export const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter({ file: imageRule }),
}).single("file");

// Profile update: optional resume (PDF, field "file") and/or new photo (field "profilePhoto"), max 5 MB each.
export const uploadProfileFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: fileFilter({
    file: { types: PDF_TYPES, message: "Resume must be a PDF" },
    profilePhoto: imageRule,
  }),
}).fields([
  { name: "file", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);
