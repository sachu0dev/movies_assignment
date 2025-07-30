import { Router, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image file provided",
        });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "movies-app",
        transformation: [
          { width: 400, height: 600, crop: "fill" },
          { quality: "auto" },
        ],
      });

      return res.json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);

      if (
        error instanceof Error &&
        error.message === "Only image files are allowed"
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to upload image",
      });
    }
  }
);

router.delete("/:publicId", async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: "Public ID is required",
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Failed to delete image",
      });
    }
  } catch (error) {
    console.error("Delete image error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
