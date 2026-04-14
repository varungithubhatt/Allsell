import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

const PORT = process.env.PORT || 5000;

await connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
