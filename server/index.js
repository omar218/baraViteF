import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import mongoose from "mongoose";
import "./config/load-env.js";
import authRouter from "./routes/auth.js";
import paymentsRouter from "./routes/payments.js";
import prosRouter from "./routes/pros.js";
import professionalsRouter from "./routes/professionals.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/auth", authRouter);
app.use("/api/pros", prosRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/professionals", professionalsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.status) return res.status(error.status).json({ message: error.message });
  if (error.name === "ValidationError" || error.name === "CastError" || error instanceof SyntaxError) {
    return res.status(400).json({ message: "Les données envoyées sont invalides." });
  }
  if (error.code === 11000) return res.status(409).json({ message: "Cette donnée existe déjà." });
  res.status(500).json({ message: "Une erreur est survenue. Veuillez réessayer." });
});

if (!process.env.MONGODB_URI) {
  console.error("La variable MONGODB_URI est obligatoire. Configurez-la dans server/.env ou server/.env.server.");
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Configurez JWT_SECRET avec au moins 32 caractères aléatoires dans server/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connecté.");
  app.listen(port, () => console.log(`API BaraViteFe disponible sur http://localhost:${port}`));
} catch (error) {
  console.error("Impossible de se connecter à MongoDB :", error.message);
  console.error("Vérifiez l'URI MongoDB et l'accès réseau. Avec Atlas, autorisez votre adresse IP dans Network Access.");
  process.exit(1);
}
