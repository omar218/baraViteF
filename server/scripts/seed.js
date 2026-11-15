import mongoose from "mongoose";
import "../config/load-env.js";
import Professional from "../models/Professionals.js";

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
  },
  {
    name: "Aïcha Coulibaly",
    trade: "Plombière",
    city: "Abidjan",
    description: "Profil de démonstration — réparation de fuites et entretien des installations sanitaires.",
    phone: "+225 00 00 00 07 07",
    experience: 5
  },
  {
    name: "Nadia Kouassi",
    trade: "Électricien",
    city: "Daloa",
    description: "Profil de démonstration — installation d'éclairage et dépannage électrique à domicile.",
    phone: "+225 00 00 00 08 08",
    experience: 6
  },
  {
    name: "Yao Koffi",
    trade: "Menuisier",
    city: "Bouaké",
    description: "Profil de démonstration — fabrication de meubles et pose de portes sur mesure.",
    phone: "+225 00 00 00 09 09",
    experience: 12
  },
  {
    name: "Adama Bamba",
    trade: "Peintre",
    city: "Korhogo",
    description: "Profil de démonstration — peinture intérieure et extérieure avec préparation des surfaces.",
    phone: "+225 00 00 00 10 10",
    experience: 7
  },
  {
    name: "Karim Traoré",
    trade: "Mécanicien",
    city: "Abidjan",
    description: "Profil de démonstration — entretien courant et diagnostic de véhicules.",
    phone: "+225 00 00 00 11 11",
    experience: 9
  },
  {
    name: "Mariam Touré",
    trade: "Plombière",
    city: "Yamoussoukro",
    description: "Profil de démonstration — installation de sanitaires et réparation de chauffe-eau.",
    phone: "+225 00 00 00 12 12",
    experience: 4
  }
];

if (!process.env.MONGODB_URI) {
  console.error("La variable MONGODB_URI est obligatoire. Copiez .env.example dans server/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Professional.bulkWrite(
    professionals.map((professional) => ({
      updateOne: {
        filter: { name: professional.name, phone: professional.phone },
        update: { $set: professional },
        upsert: true
      }
    }))
  );
  console.log(
    `${result.upsertedCount} professionnels ajoutés, ${result.modifiedCount} mis à jour.`
  );
} catch (error) {
  console.error("Impossible d'ajouter les données de démonstration :", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
