import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import {
  createEntrySchema,
  updateEntrySchema,
  searchSchema,
  idSchema,
} from "../utils/validation";

const router = Router();
const prisma = new PrismaClient();

// Create new entry
router.post(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = createEntrySchema.parse(req.body);

      const entry = await prisma.entry.create({
        data: {
          ...validatedData,
          userId: req.user!.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: entry,
        message: "Entry created successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: JSON.parse(error.message),
        });
      }

      console.error("Create entry error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Get user's entries (My List)
router.get(
  "/my",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [entries, total] = await Promise.all([
        prisma.entry.findMany({
          where: { userId: req.user!.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: Number(limit),
        }),
        prisma.entry.count({
          where: { userId: req.user!.id },
        }),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      return res.json({
        success: true,
        data: entries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      });
    } catch (error) {
      console.error("Get my entries error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Get community entries (public entries sorted by likes)
router.get("/community", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where: { isReleased: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { likes: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.entry.count({
        where: { isReleased: true },
      }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    return res.json({
      success: true,
      data: entries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get community entries error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Search and filter entries
router.get("/search", async (req: Request, res: Response) => {
  try {
    const validatedData = searchSchema.parse(req.query);
    const { query, type, year, director, page = 1, limit = 10 } = validatedData;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { director: { contains: query, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (year) {
      where.yearTime = { contains: year };
    }

    if (director) {
      where.director = { contains: director, mode: "insensitive" };
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.entry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: JSON.parse(error.message),
      });
    }

    console.error("Search entries error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Update entry
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);
      const validatedData = updateEntrySchema.parse(req.body);

      // Check if entry exists and belongs to user
      const existingEntry = await prisma.entry.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          error: "Entry not found or access denied",
        });
      }

      const entry = await prisma.entry.update({
        where: { id },
        data: validatedData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: entry,
        message: "Entry updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: JSON.parse(error.message),
        });
      }

      console.error("Update entry error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Delete entry
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);

      // Check if entry exists and belongs to user
      const existingEntry = await prisma.entry.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          error: "Entry not found or access denied",
        });
      }

      await prisma.entry.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: "Entry deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: JSON.parse(error.message),
        });
      }

      console.error("Delete entry error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Release entry to community
router.post(
  "/:id/release",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);

      // Check if entry exists and belongs to user
      const existingEntry = await prisma.entry.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          error: "Entry not found or access denied",
        });
      }

      const entry = await prisma.entry.update({
        where: { id },
        data: { isReleased: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: entry,
        message: "Entry released to community successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: JSON.parse(error.message),
        });
      }

      console.error("Release entry error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Like entry
router.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const { id } = idSchema.parse(req.params);

    const entry = await prisma.entry.update({
      where: { id },
      data: { likes: { increment: 1 } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: entry,
      message: "Entry liked successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: JSON.parse(error.message),
      });
    }

    console.error("Like entry error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Dislike entry
router.post("/:id/dislike", async (req: Request, res: Response) => {
  try {
    const { id } = idSchema.parse(req.params);

    const entry = await prisma.entry.update({
      where: { id },
      data: { dislikes: { increment: 1 } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: entry,
      message: "Entry disliked successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: JSON.parse(error.message),
      });
    }

    console.error("Dislike entry error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
