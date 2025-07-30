import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: hashedPassword,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      name: "Mike Johnson",
      email: "mike@example.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Users created");

  const entries = [
    {
      title: "The Shawshank Redemption",
      type: "Movie",
      director: "Frank Darabont",
      budget: "$25,000,000",
      location: "United States",
      duration: "142 minutes",
      yearTime: "1994",
      imageUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
      isReleased: true,
      likes: 15,
      dislikes: 2,
      userId: user1.id,
    },
    {
      title: "Breaking Bad",
      type: "TV",
      director: "Vince Gilligan",
      budget: "$3,000,000 per episode",
      location: "United States",
      duration: "5 seasons",
      yearTime: "2008-2013",
      imageUrl:
        "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400",
      isReleased: true,
      likes: 23,
      dislikes: 1,
      userId: user1.id,
    },
    {
      title: "Inception",
      type: "Movie",
      director: "Christopher Nolan",
      budget: "$160,000,000",
      location: "United States",
      duration: "148 minutes",
      yearTime: "2010",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      isReleased: true,
      likes: 18,
      dislikes: 3,
      userId: user2.id,
    },
    {
      title: "Stranger Things",
      type: "TV",
      director: "The Duffer Brothers",
      budget: "$6,000,000 per episode",
      location: "United States",
      duration: "4 seasons",
      yearTime: "2016-2022",
      imageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
      isReleased: true,
      likes: 12,
      dislikes: 0,
      userId: user2.id,
    },
    {
      title: "The Dark Knight",
      type: "Movie",
      director: "Christopher Nolan",
      budget: "$185,000,000",
      location: "United States",
      duration: "152 minutes",
      yearTime: "2008",
      imageUrl:
        "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400",
      isReleased: false,
      likes: 0,
      dislikes: 0,
      userId: user3.id,
    },
    {
      title: "Game of Thrones",
      type: "TV",
      director: "David Benioff, D.B. Weiss",
      budget: "$15,000,000 per episode",
      location: "United States",
      duration: "8 seasons",
      yearTime: "2011-2019",
      imageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
      isReleased: true,
      likes: 31,
      dislikes: 5,
      userId: user3.id,
    },
    {
      title: "Pulp Fiction",
      type: "Movie",
      director: "Quentin Tarantino",
      budget: "$8,500,000",
      location: "United States",
      duration: "154 minutes",
      yearTime: "1994",
      imageUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
      isReleased: true,
      likes: 9,
      dislikes: 1,
      userId: user1.id,
    },
    {
      title: "The Office",
      type: "TV",
      director: "Greg Daniels",
      budget: "$1,000,000 per episode",
      location: "United States",
      duration: "9 seasons",
      yearTime: "2005-2013",
      imageUrl:
        "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400",
      isReleased: true,
      likes: 7,
      dislikes: 0,
      userId: user2.id,
    },
  ];

  for (const entry of entries) {
    await prisma.entry.upsert({
      where: {
        id: -1,
      },
      update: {},
      create: entry,
    });
  }

  console.log("✅ Entries created");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
