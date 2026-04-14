import multer from "multer";

const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export default upload;
