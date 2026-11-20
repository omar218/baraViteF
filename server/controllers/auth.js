import bcrypt from "bcryptjs";
import { createPasswordResetToken, hashPasswordResetToken } from "../utils/password-reset.js";
import jwt from "jsonwebtoken";
import Professional from "../models/Professionals.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from "../services/email.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s.-]{8,30}$/;

function createToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new AppError(500, "JWT_SECRET doit contenir au moins 32 caractères.");
  }
  return jwt.sign({ sub: user.id, role: user.role, ver: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "barra-rapide"
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    professionalProfile: user.professionalProfile || null,
    professionalId: user.professionalId || null
  };
}

export async function register(req, res, next) {
  const {
    name,
    email,
    password,
    phone,
    role,
    acceptedTerms,
    acceptedPrivacy,
    professionalProfile
  } = req.body || {};
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";

  if (
    !cleanName || cleanName.length > 80 || !emailPattern.test(cleanEmail) ||
    cleanEmail.length > 254 || !phonePattern.test(cleanPhone) ||
    typeof password !== "string" || password.length < 10 || Buffer.byteLength(password, "utf8") > 72 ||
    !["client", "pro"].includes(role) || acceptedTerms !== true || acceptedPrivacy !== true
  ) {
    return next(new AppError(400, "Vérifiez les champs obligatoires, le mot de passe et l'acceptation des CGU et de la politique de confidentialité."));
  }

  let proFields;
  if (role === "pro") {
    const profile = professionalProfile || {};
    const category = typeof profile.category === "string" ? profile.category.trim() : "";
    const city = typeof profile.city === "string" ? profile.city.trim() : "";
    const neighborhood = typeof profile.neighborhood === "string" ? profile.neighborhood.trim() : "";
    const description = typeof profile.description === "string" ? profile.description.trim() : "";
    if (
      !category || category.length > 60 || !city || city.length > 80 ||
      neighborhood.length > 80 || !description || description.length > 1000 ||
      !Number.isSafeInteger(profile.indicativePriceXof) || profile.indicativePriceXof < 0 ||
      !Number.isSafeInteger(profile.experience) || profile.experience < 0 || profile.experience > 80 ||
      typeof profile.available !== "boolean"
    ) {
      return next(new AppError(400, "Vérifiez votre métier, votre zone, votre tarif, votre disponibilité et votre description."));
    }
    proFields = { category, city, neighborhood, description, indicativePriceXof: profile.indicativePriceXof, experience: profile.experience, available: profile.available };
  }

  let user;
  let professional;
  try {
    user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: password,
      role,
      ...(proFields ? { professionalProfile: proFields } : {}),
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date()
    });

    if (proFields) {
      professional = await Professional.create({
        userId: user._id,
        name: cleanName,
        trade: proFields.category,
        city: proFields.city,
        neighborhood: proFields.neighborhood,
        description: proFields.description,
        phone: cleanPhone,
        experience: proFields.experience,
        indicativePriceXof: proFields.indicativePriceXof,
        available: proFields.available
      });
      user.professionalId = professional._id;
      await user.save();
    }
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (professional) await Professional.deleteOne({ _id: professional._id });
    if (user) await User.deleteOne({ _id: user._id });
    if (error.code === 11000) return next(new AppError(409, "Un compte utilise déjà cette adresse e-mail."));
    next(error);
  }
}

export async function login(req, res, next) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!emailPattern.test(email) || typeof password !== "string" || !password) {
    return next(new AppError(400, "Adresse e-mail ou mot de passe manquant."));
  }

  try {
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await user.verifyPassword(password))) {
      return next(new AppError(401, "Adresse e-mail ou mot de passe incorrect."));
    }
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function requestPasswordReset(req, res, next) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return next(new AppError(400, "Saisissez une adresse e-mail valide."));
  }
  if (!isPasswordResetEmailConfigured()) {
    return next(new AppError(503, "La récupération par e-mail n'est pas encore configurée."));
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      const { token, tokenHash } = createPasswordResetToken();
      await User.updateOne(
        { _id: user._id },
        { $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } }
      );
      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (error) {
        await User.updateOne(
          { _id: user._id, passwordResetTokenHash: tokenHash },
          { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }
        );
        console.error("Échec de l'envoi de l'e-mail de réinitialisation :", error);
        return next(new AppError(503, "L’e-mail n’a pas pu être envoyé. Réessayez plus tard."));
      }
    }

    res.json({ message: "Si un compte correspond à cette adresse, un lien de réinitialisation lui a été envoyé." });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  const { token, password } = req.body || {};
  if (
    typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token) ||
    typeof password !== "string" || password.length < 10 || Buffer.byteLength(password, "utf8") > 72
  ) {
    return next(new AppError(400, "Le lien est invalide ou expiré, ou le mot de passe ne respecte pas les critères."));
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.findOneAndUpdate(
      { passwordResetTokenHash: hashPasswordResetToken(token), passwordResetExpiresAt: { $gt: new Date() } },
      {
        $set: { passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
        $inc: { tokenVersion: 1 }
      },
      { new: true }
    );
    if (!user) return next(new AppError(400, "Le lien est invalide ou expiré. Demandez une nouvelle réinitialisation."));
    res.json({ message: "Votre mot de passe a été modifié. Vous pouvez vous connecter." });
  } catch (error) {
    next(error);
  }
}
