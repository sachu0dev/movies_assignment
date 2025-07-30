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

router.get(
  "/my",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        type = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { userId: req.user!.id };

      if (search && search !== "") {
        const searchTerm = search as string;
        where.OR = [
          { title: { contains: searchTerm } },
          { director: { contains: searchTerm } },
          { location: { contains: searchTerm } },
        ];
      }

      if (type && type !== "" && type !== "all") {
        where.type = type;
      }

      const orderBy: any = {};
      if (sortBy === "createdAt") {
        orderBy.createdAt = sortOrder;
      } else if (sortBy === "title") {
        orderBy.title = sortOrder;
      } else if (sortBy === "director") {
        orderBy.director = sortOrder;
      } else if (sortBy === "yearTime") {
        orderBy.yearTime = sortOrder;
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
          orderBy,
          skip,
          take: Number(limit),
        }),
        prisma.entry.count({ where }),
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

router.get("/community", async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      type = "",
      sortBy = "likes",
      sortOrder = "desc",
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isReleased: true };

    if (search && search !== "") {
      const searchTerm = search as string;
      where.OR = [
        { title: { contains: searchTerm } },
        { director: { contains: searchTerm } },
        { location: { contains: searchTerm } },
      ];
    }

    if (type && type !== "" && type !== "all") {
      where.type = type;
    }

    const orderBy: any = {};
    if (sortBy === "likes") {
      orderBy.likes = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === "title") {
      orderBy.title = sortOrder;
    } else if (sortBy === "director") {
      orderBy.director = sortOrder;
    } else if (sortBy === "yearTime") {
      orderBy.yearTime = sortOrder;
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
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.entry.count({ where }),
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

router.get("/search", async (req: Request, res: Response) => {
  try {
    const validatedData = searchSchema.parse(req.query);
    const { query, type, year, director, page = 1, limit = 10 } = validatedData;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { director: { contains: query } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (year) {
      where.yearTime = { contains: year };
    }

    if (director) {
      where.director = { contains: director };
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

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = idSchema.parse(req.params);

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Entry not found",
      });
    }

    return res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: JSON.parse(error.message),
      });
    }

    console.error("Get entry by ID error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

router.get(
  "/:id/interaction",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);
      const userId = req.user!.id;

      const interaction = await prisma.userEntryInteraction.findUnique({
        where: {
          userId_entryId: {
            userId,
            entryId: id,
          },
        },
      });

      return res.json({
        success: true,
        data: {
          action: interaction?.action || null,
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

      console.error("Get user interaction error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);
      const validatedData = updateEntrySchema.parse(req.body);

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

router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);

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
router.post(
  "/:id/release",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);

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

router.post(
  "/:id/like",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);
      const userId = req.user!.id;

      const entry = await prisma.entry.findUnique({
        where: { id },
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          error: "Entry not found",
        });
      }

      const existingInteraction = await prisma.userEntryInteraction.findUnique({
        where: {
          userId_entryId: {
            userId,
            entryId: id,
          },
        },
      });

      let likeIncrement = 0;
      let dislikeDecrement = 0;

      if (existingInteraction) {
        if (existingInteraction.action === "like") {
          await prisma.userEntryInteraction.delete({
            where: { id: existingInteraction.id },
          });
          likeIncrement = -1;
        } else if (existingInteraction.action === "dislike") {
          await prisma.userEntryInteraction.update({
            where: { id: existingInteraction.id },
            data: { action: "like" },
          });
          likeIncrement = 1;
          dislikeDecrement = -1;
        }
      } else {
        await prisma.userEntryInteraction.create({
          data: {
            userId,
            entryId: id,
            action: "like",
          },
        });
        likeIncrement = 1;
      }

      const updatedEntry = await prisma.entry.update({
        where: { id },
        data: {
          likes: { increment: likeIncrement },
          dislikes: { increment: dislikeDecrement },
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

      return res.json({
        success: true,
        data: updatedEntry,
        message:
          likeIncrement > 0
            ? "Entry liked successfully"
            : "Like removed successfully",
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
  }
);

router.post(
  "/:id/dislike",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = idSchema.parse(req.params);
      const userId = req.user!.id;

      const entry = await prisma.entry.findUnique({
        where: { id },
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          error: "Entry not found",
        });
      }

      const existingInteraction = await prisma.userEntryInteraction.findUnique({
        where: {
          userId_entryId: {
            userId,
            entryId: id,
          },
        },
      });

      let dislikeIncrement = 0;
      let likeDecrement = 0;

      if (existingInteraction) {
        if (existingInteraction.action === "dislike") {
          await prisma.userEntryInteraction.delete({
            where: { id: existingInteraction.id },
          });
          dislikeIncrement = -1;
        } else if (existingInteraction.action === "like") {
          await prisma.userEntryInteraction.update({
            where: { id: existingInteraction.id },
            data: { action: "dislike" },
          });
          dislikeIncrement = 1;
          likeDecrement = -1;
        }
      } else {
        await prisma.userEntryInteraction.create({
          data: {
            userId,
            entryId: id,
            action: "dislike",
          },
        });
        dislikeIncrement = 1;
      }

      const updatedEntry = await prisma.entry.update({
        where: { id },
        data: {
          dislikes: { increment: dislikeIncrement },
          likes: { increment: likeDecrement },
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

      return res.json({
        success: true,
        data: updatedEntry,
        message:
          dislikeIncrement > 0
            ? "Entry disliked successfully"
            : "Dislike removed successfully",
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
  }
);

export default router;
