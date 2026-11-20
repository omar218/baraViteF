import nodemailer from "nodemailer";
import AppError from "../utils/AppError.js";

function getEmailConfig() {
  const port = Number(process.env.SMTP_PORT);
  if (
    !process.env.SMTP_HOST || !Number.isInteger(port) || port < 1 || port > 65535 ||
    !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM
  ) {
    return null;
  }
  return { host: process.env.SMTP_HOST, port, user: process.env.SMTP_USER, password: process.env.SMTP_PASSWORD };
}

export function isPasswordResetEmailConfigured() {
  return Boolean(getEmailConfig() && process.env.CLIENT_URL);
}

export async function sendPasswordResetEmail(email, token) {
  const config = getEmailConfig();
  if (!config || !process.env.CLIENT_URL) {
    throw new AppError(503, "La récupération par e-mail n'est pas configurée.");
  }

  let resetUrl;
  try {
    resetUrl = new URL("/reinitialiser-mot-de-passe", process.env.CLIENT_URL);
  } catch {
    throw new AppError(503, "L’URL de l’application est invalide dans la configuration.");
  }
  if (process.env.NODE_ENV === "production" && resetUrl.protocol !== "https:") {
    throw new AppError(503, "L’URL publique de l’application doit utiliser HTTPS.");
  }
  resetUrl.searchParams.set("token", token);
  const safeUrl = resetUrl.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port !== 465,
    auth: { user: config.user, pass: config.password }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe Barra Rapide",
    text: `Vous avez demandé à modifier votre mot de passe Barra Rapide. Utilisez ce lien dans les 30 minutes : ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
    html: `<p>Vous avez demandé à modifier votre mot de passe Barra Rapide.</p><p><a href="${safeUrl}">Choisir un nouveau mot de passe</a></p><p>Ce lien expire dans 30 minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p>`
  });
}
