import mongoose from "mongoose";
import ConnectionUnlock from "../models/ConnectionUnlock.js";
import Professional from "../models/Professionals.js";
import AppError from "../utils/AppError.js";
import { createAccentInsensitiveRegex } from "../utils/search.js";

function serializeProfessional(professional, unlocked = false) {
  return {
    _id: professional._id,
    name: professional.name,
    trade: professional.trade,
    city: professional.city,
    neighborhood: professional.neighborhood || "",
    description: professional.description,
    experience: professional.experience,
    rating: professional.rating || 0,
    verified: professional.verified || false,
    available: professional.available,
    indicativePriceXof: professional.indicativePriceXof ?? null,
    isUnlocked: unlocked,
    ...(unlocked ? { phone: professional.phone } : {})
  };
}

export async function listPros(req, res, next) {
  try {
    const filter = {};
    const trade = typeof req.query.trade === "string" ? req.query.trade.trim().slice(0, 60) : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim().slice(0, 60) : "";
    const city = typeof req.query.city === "string" ? req.query.city.trim().slice(0, 80) : "";
    const neighborhood = typeof req.query.neighborhood === "string" ? req.query.neighborhood.trim().slice(0, 80) : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";
    const available = req.query.available;

    if (trade || category) filter.trade = createAccentInsensitiveRegex(trade || category, true);
    if (city) filter.city = createAccentInsensitiveRegex(city);
    if (neighborhood) filter.neighborhood = createAccentInsensitiveRegex(neighborhood);
    if (available === "false") filter.available = false;
    else if (available !== "all") filter.available = true;
    if (search) {
      const matcher = createAccentInsensitiveRegex(search);
      filter.$or = [
        { name: matcher },
        { trade: matcher },
        { city: matcher },
        { neighborhood: matcher },
        { description: matcher }
      ];
    }

    const hasLatitude = req.query.lat !== undefined;
    const hasLongitude = req.query.lng !== undefined;
    let professionals;
    if (hasLatitude || hasLongitude) {
      const latitude = Number(req.query.lat);
      const longitude = Number(req.query.lng);
      if (
        !hasLatitude || !hasLongitude || typeof req.query.lat !== "string" || typeof req.query.lng !== "string" ||
        !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
      ) {
        throw new AppError(400, "Latitude et longitude doivent être fournies avec des valeurs valides.");
      }
      professionals = await Professional.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [longitude, latitude] },
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
            neighborhood: 1,
            description: 1,
            experience: 1,
            rating: 1,
            verified: 1,
            available: 1,
            indicativePriceXof: 1,
            distanceMeters: 1
          }
        },
        { $limit: 50 }
      ]);
    } else {
      professionals = await Professional.find(filter)
        .select("name trade city neighborhood description experience rating verified available indicativePriceXof")
        .sort({ rating: -1, verified: -1, name: 1 })
        .limit(50)
        .lean();
    }

    let unlockedIds = new Set();
    if (req.user?.role === "client" && professionals.length) {
      const unlocks = await ConnectionUnlock.find({
        clientId: req.user._id,
        proId: { $in: professionals.map((professional) => professional._id) }
      }).select("proId").lean();
      unlockedIds = new Set(unlocks.map((unlock) => String(unlock.proId)));
    }

    res.json(professionals.map((professional) =>
      serializeProfessional(professional, unlockedIds.has(String(professional._id)))
    ));
  } catch (error) {
    next(error);
  }
}

export async function getPro(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(400, "Identifiant de professionnel invalide.");
    const professional = await Professional.findById(req.params.id)
      .select("name trade city neighborhood description experience rating verified available indicativePriceXof phone")
      .lean();
    if (!professional) throw new AppError(404, "Professionnel introuvable.");

    let unlocked = false;
    if (req.user?.role === "client") {
      unlocked = Boolean(await ConnectionUnlock.exists({
        clientId: req.user._id,
        proId: professional._id
      }));
    }
    res.json({ professional: serializeProfessional(professional, unlocked) });
  } catch (error) {
    next(error);
  }
}
