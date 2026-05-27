import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import app from "./app.ts";
import { connectDB } from "./config/db";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth";
import doctorRoutes from "./routes/doctors";
import serviceRoutes from "./routes/services";
import bookingRoutes from "./routes/bookings";
import articleRoutes from "./routes/articles";
import reviewRoutes from "./routes/reviews";
import medicalRecordRoutes from "./routes/medicalRecords";
import medicalRoutes from "./routes/medical";
import adminRoutes from "./routes/admin";
import doctorDashboardRoutes from "./routes/doctorDashboard";
import urgentRequestRoutes from "./routes/urgentRequests";
import userRoutes from "./routes/users";
import { initSocket } from "./socket";
import { DentalBot } from "./bot/bot";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const waitForDatabase = async () => {
  const timeoutMs = Number(process.env.DB_CONNECT_TIMEOUT_MS) || 7000;
  let timeout: NodeJS.Timeout;
  await Promise.race([
    connectDB().finally(() => clearTimeout(timeout)),
    new Promise<void>((resolve) => {
      timeout = setTimeout(() => {
        console.warn(`Database connection timed out after ${timeoutMs}ms. Continuing startup.`);
        resolve();
      }, timeoutMs);
    }),
  ]);
};

async function startServer() {
  console.log("Starting backend server...");
  console.log("Current working directory:", process.cwd());
  console.log("__dirname:", __dirname);

  try {
    await waitForDatabase();
    console.log("Database connection process completed");
  } catch (err) {
    console.error("Database connection failed:", err);
  }

  console.log("Configuring API routes...");
  app.use("/api/auth", authRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/articles", articleRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/medical-records", medicalRecordRoutes);
  app.use("/api/medical", medicalRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/doctor", doctorDashboardRoutes);
  app.use("/api/urgent-requests", urgentRequestRoutes);
  app.use("/api/users", userRoutes);

  app.use("/api/*", (req, res) => {
    console.warn(`API 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  const publicPath = path.join(__dirname, "public");
  console.log("Serving backend public files from:", publicPath);
  app.use(express.static(publicPath));

  app.get("/operator-panel.html", (_req, res) => {
    const panelPath = path.join(__dirname, "public", "operator-panel.html");
    res.sendFile(panelPath);
  });

  const PORT = Number(process.env.PORT) || 3000;

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Backend running on http://localhost:${PORT}`);
  });

  let dentalBot: DentalBot | null = null;
  try {
    dentalBot = new DentalBot();
    dentalBot.launch();
    console.log("Telegram bot startup scheduled");
  } catch (error) {
    console.error("Failed to launch Telegram bot:", error);
  }

  initSocket(server, dentalBot);

  const shutdown = () => {
    if (dentalBot) dentalBot.stop();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch(console.error);

export { startServer };
