import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import "./config/load-env.js";
import professionalsRouter from "./routes/professionals.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/professionals", professionalsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Une erreur est survenue. Veuillez réessayer." });
});

if (!process.env.MONGODB_URI) {
  console.error("La variable MONGODB_URI est obligatoire. Configurez-la dans server/.env ou server/.env.server.");
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
