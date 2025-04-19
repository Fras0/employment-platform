import multer, { StorageEngine, Multer, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// Define the uploads directory
const uploadsDir: string = path.join(__dirname, "./../uploads");

console.log("Uploading to directory:", uploadsDir);
// Check if the directory exists, if not, create it
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage settings
const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Export the multer upload middleware
export const upload = multer({ storage: storage });
