// Turns a multer memory-storage file into a data URI Cloudinary can upload.
// (Replaces the `datauri` package, which pulled in a vulnerable dependency.)
const getDataUri = (file) => {
  return {
    content: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
  };
};

export default getDataUri;
