import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

function getToken(req) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer ([^\s]+)$/i);
  return match ? match[1] : null;
}

export async function protect(req, _res, next) {
  try {
    const token = getToken(req);
    if (!token) throw new AppError(401, "Authentification requise.");
    if (!process.env.JWT_SECRET) throw new AppError(500, "La configuration JWT est indisponible.");

    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: "barra-rapide" });
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError(401, "Session invalide. Veuillez vous reconnecter.");
    if ((payload.ver ?? 0) !== (user.tokenVersion ?? 0)) {
      throw new AppError(401, "Session invalide. Veuillez vous reconnecter.");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, "Session invalide ou expirée. Veuillez vous reconnecter."));
    }
    next(error);
  }
}

export async function optionalProtect(req, _res, next) {
  if (!getToken(req)) return next();
  return protect(req, _res, next);
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError(401, "Authentification requise."));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "Accès interdit pour ce compte."));
    next();
  };
}
