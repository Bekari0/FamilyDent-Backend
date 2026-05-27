import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express from "express";
import { connectDB } from "./config/db";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.ts";;
import { createServer as createViteServer } from "vite";
import doctorRoutes from "./routes/doctor";
import serviceRoutes from "./routes/service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("Starting integrated server...");
  console.log("Current working directory:", process.cwd());
  console.log("__dirname:", __dirname);

  try {
    await connectDB();
    console.log("Database connection process completed");
  } catch (err) {
    console.error("Database connection failed:", err);
  }

  console.log("Configuring API routes...");
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/services", serviceRoutes);


  app.use("/api/*", (req, res) => {
    console.warn(`API 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  const publicPath = path.join(__dirname, "public");
  console.log("Serving public from:", publicPath);
  app.use(express.static(publicPath));


  if (process.env.NODE_ENV !== "production") {
    console.log("Detected development mode. Starting Vite middleware...");
    try {
      const rootPath = path.join(__dirname, ".."); // Поднимаемся на уровень выше (в familydent)
      console.log("Vite root path:", rootPath);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        root: rootPath,
      });
      app.use(vite.middlewares);

      app.use("*", (req, res) => {
        const indexPath = path.join(__dirname, "..", "index.html");
        console.log("Serving index.html from:", indexPath);
        res.sendFile(indexPath);
      });

      console.log("Vite middleware started successfully");
    } catch (err) {
      console.error("Failed to start Vite middleware:", err);
    }
  } else {
    console.log("Detected production mode. Serving static files...");
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Server running on http://localhost:${PORT}`);
  });
}
