import { Router } from "express";
import mongoose from "mongoose";
import ContactRequest from "../models/ContactRequest.js";
import Professional from "../models/Professionals.js";
import { parseGeoPoint } from "../services/geolocation.js";
import { validateProfessionalRegistration } from "../services/professional-registration.js";
import { getSearchTerms } from "../services/search.js";

const router = Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/", async (req, res, next) => {
  const registration = validateProfessionalRegistration(req.body);
  if (registration.error) {
    return res.status(400).json({ message: registration.error });
  }

  try {
    await Professional.create(registration.data);
    res.status(201).json({ message: "Votre profil professionnel a bien été créé." });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const geolocation = parseGeoPoint(req.query.lat, req.query.lng);
    if (geolocation.error) {
      return res.status(400).json({ message: geolocation.error });
    }

    const filter = { available: true };
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";

    if (search) {
      const terms = getSearchTerms(search);
      if (terms.length) {
        filter.$and = terms.map((term) => {
          const safeTerm = new RegExp(escapeRegex(term), "i");
          return {
            $or: [
              { name: safeTerm },
              { trade: safeTerm },
              { city: safeTerm },
              { description: safeTerm }
            ]
          };
        });
      } else {
        const safeSearch = new RegExp(escapeRegex(search), "i");
        filter.$or = [
          { name: safeSearch },
          { trade: safeSearch },
          { city: safeSearch },
          { description: safeSearch }
        ];
      }
    }

    if (typeof req.query.trade === "string" && req.query.trade.trim()) {
      filter.trade = new RegExp(`^${escapeRegex(req.query.trade.trim().slice(0, 60))}$`, "i");
    }

    const professionals = geolocation.point
      ? await Professional.aggregate([
          {
            $geoNear: {
              near: geolocation.point,
              distanceField: "distanceMeters",
              spherical: true,
              key: "location",
              query: filter
            }
          },
          {
            $project: {
              name: 1,
              trade: 1,
              city: 1,
              description: 1,
              experience: 1,
              rating: 1,
              verified: 1,
              distanceMeters: 1
            }
          },
          { $limit: 50 }
        ])
      : await Professional.find(filter)
          .select("name trade city description experience rating verified")
          .sort({ rating: -1, verified: -1, name: 1 })
          .limit(50);
    res.json(professionals);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/contact", async (req, res, next) => {
  try {
    const { name, phone, message = "" } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Professionnel introuvable." });
    }
    if (
      typeof name !== "string" || !name.trim() || name.trim().length > 80 ||
      typeof phone !== "string" || !phone.trim() || phone.trim().length > 30 ||
      typeof message !== "string" || message.length > 1000
    ) {
      return res.status(400).json({ message: "Vérifiez votre nom, votre téléphone et votre message." });
    }

    const professional = await Professional.findById(req.params.id);
    if (!professional || !professional.available) {
      return res.status(404).json({ message: "Ce professionnel n'est pas disponible." });
    }

    const request = await ContactRequest.create({
      professional: professional._id,
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim()
    });
    res.status(201).json({ message: "Votre demande a bien été envoyée.", id: request.id });
  } catch (error) {
    next(error);
  }
});

export default router;
