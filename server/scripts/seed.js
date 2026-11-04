import "dotenv/config";
import mongoose from "mongoose";
import Professional from "../models/Professional.js";

const professionals = [
  {
    name: "Jean-Marc Kouassi",
    trade: "Électricien",
    city: "Abidjan",
    description: "Installation, dépannage et mise aux normes de vos installations électriques.",
    phone: "+225 07 00 00 01 01",
    experience: 8,
    rating: 4.9,
    verified: true
  },
  {
    name: "Aminata Koné",
    trade: "Plombière",
    city: "Abidjan",
    description: "Réparation de fuites, sanitaires et installation de chauffe-eau.",
    phone: "+225 07 00 00 02 02",
    experience: 6,
    rating: 4.8,
    verified: true
  },
  {
    name: "Moussa Diabaté",
    trade: "Mécanicien",
    city: "Bouaké",
    description: "Entretien et réparation de véhicules toutes marques, diagnostic inclus.",
    phone: "+225 07 00 00 03 03",
    experience: 10,
    rating: 4.7,
    verified: true
  },
  {
    name: "Serge Yao",
    trade: "Menuisier",
    city: "Abidjan",
    description: "Meubles sur mesure, portes et travaux de menuiserie intérieure.",
    phone: "+225 07 00 00 04 04",
    experience: 5,
    rating: 4.6
  },
  {
    name: "Fatou Bamba",
    trade: "Peintre",
    city: "Yamoussoukro",
    description: "Peinture intérieure et extérieure avec finitions soignées.",
    phone: "+225 07 00 00 05 05",
    experience: 7,
    rating: 4.8,
    verified: true
  },
  {
    name: "Koffi N'Guessan",
    trade: "Électricien",
    city: "San-Pédro",
    description: "Dépannage rapide, éclairage, prises et installation de tableaux.",
    phone: "+225 07 00 00 06 06",
    experience: 4,
    rating: 4.5
  }
];

if (!process.env.MONGODB_URI) {
  console.error("La variable MONGODB_URI est obligatoire. Copiez .env.example dans server/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Professional.deleteMany({});
  await Professional.insertMany(professionals);
  console.log(`${professionals.length} professionnels de démonstration ajoutés.`);
} catch (error) {
  console.error("Impossible d'ajouter les données de démonstration :", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
