import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "./api.js";
import { useAuth } from "./AuthContext.jsx";

function ApiError({ error }) {
  return error ? <div className="form-status error" role="alert">{error}</div> : null;
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") === "pro" ? "pro" : "client");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "",
    city: "",
    neighborhood: "",
    indicativePriceXof: "",
    experience: "",
    description: "",
    available: true,
    acceptedTerms: false,
    acceptedPrivacy: false
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        acceptedTerms: form.acceptedTerms,
        acceptedPrivacy: form.acceptedPrivacy,
        ...(role === "pro" ? {
          professionalProfile: {
            category: form.category,
            city: form.city,
            neighborhood: form.neighborhood,
            indicativePriceXof: Number(form.indicativePriceXof),
            experience: Number(form.experience),
            description: form.description,
            available: form.available
          }
        } : {})
      });
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "L'inscription a échoué. Vérifiez votre connexion.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <Link className="account-brand" to="/">Barra Rapide</Link>
        <span className="eyebrow">CRÉER UN COMPTE</span>
        <h1>Rejoignez Barra Rapide</h1>
        <p>Créez un compte pour trouver un professionnel ou présenter vos services.</p>
        <ApiError error={error} />
        <form className="contact-form" onSubmit={submit}>
          <label>
            Vous êtes
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="client">Client</option>
              <option value="pro">Professionnel</option>
            </select>
          </label>
          <label>Nom complet<input required autoComplete="name" maxLength="80" value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label>E-mail<input required type="email" autoComplete="email" maxLength="254" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
          <label>Téléphone<input required type="tel" autoComplete="tel" maxLength="30" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+225 07 00 00 00 00" /></label>
          <label>Mot de passe (10 à 72 caractères)<input required type="password" autoComplete="new-password" minLength="10" maxLength="72" value={form.password} onChange={(event) => update("password", event.target.value)} /></label>
          {role === "pro" && (
            <fieldset className="profile-fields">
              <legend>Votre profil professionnel</legend>
              <label>Métier / catégorie<input required maxLength="60" value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Ex. Électricien" /></label>
              <label>Ville / commune<input required maxLength="80" value={form.city} onChange={(event) => update("city", event.target.value)} /></label>
              <label>Quartier (facultatif)<input maxLength="80" value={form.neighborhood} onChange={(event) => update("neighborhood", event.target.value)} /></label>
              <label>Tarif indicatif (FCFA)<input required type="number" min="0" step="1" value={form.indicativePriceXof} onChange={(event) => update("indicativePriceXof", event.target.value)} /></label>
              <label>Années d'expérience<input required type="number" min="0" max="80" step="1" value={form.experience} onChange={(event) => update("experience", event.target.value)} /></label>
              <label>Présentation de vos services<textarea required maxLength="1000" rows="4" value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
              <label className="check-label"><input type="checkbox" checked={form.available} onChange={(event) => update("available", event.target.checked)} /> Disponible pour de nouvelles demandes</label>
            </fieldset>
          )}
          <label className="check-label">
            <input required type="checkbox" checked={form.acceptedPrivacy} onChange={(event) => update("acceptedPrivacy", event.target.checked)} />
            J’accepte la <Link to="/confidentialite" target="_blank" rel="noreferrer">politique de confidentialité</Link>.
          </label>
          <label className="check-label">
            <input required type="checkbox" checked={form.acceptedTerms} onChange={(event) => update("acceptedTerms", event.target.checked)} />
            J’accepte les <Link to="/cgu" target="_blank" rel="noreferrer">conditions générales d’utilisation</Link>.
          </label>
          <button className="button button-dark submit-button" type="submit" disabled={sending}>
            {sending ? "Création du compte…" : "Créer mon compte"} <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="account-switch">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
        <Link className="account-back" to="/">Retour à l’accueil</Link>
      </section>
    </main>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "La connexion a échoué. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <Link className="account-brand" to="/">Barra Rapide</Link>
        <span className="eyebrow">ESPACE MEMBRE</span>
        <h1>Connexion</h1>
        <p>Connectez-vous pour gérer votre compte et vos mises en relation.</p>
        <ApiError error={error} />
        <form className="contact-form" onSubmit={submit}>
          <label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Mot de passe<input required type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <Link className="forgot-password-link" to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          <button className="button button-dark submit-button" type="submit" disabled={sending}>{sending ? "Connexion…" : "Se connecter"}</button>
        </form>
        <p className="account-switch">Nouveau sur Barra Rapide ? <Link to="/inscription">Créer un compte</Link></p>
        <Link className="account-back" to="/">Retour à l’accueil</Link>
      </section>
    </main>
  );
}

export function PasswordRecoveryPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  async function submitRequest(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "La demande n’a pas pu être envoyée. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  async function submitReset(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Le mot de passe n’a pas pu être modifié. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <Link className="account-brand" to="/">Barra Rapide</Link>
        <span className="eyebrow">RÉCUPÉRATION DU COMPTE</span>
        <h1>{token ? "Nouveau mot de passe" : "Mot de passe oublié ?"}</h1>
        <p>{token
          ? "Choisissez un nouveau mot de passe pour votre compte."
          : "Indiquez l’adresse e-mail associée à votre compte. Si elle correspond, vous recevrez un lien de réinitialisation."}</p>
        <ApiError error={error} />
        {success && <div className="form-status success" role="status">{success}</div>}
        {!success?.startsWith("Votre mot de passe") && (
          <form className="contact-form" onSubmit={token ? submitReset : submitRequest}>
            {token ? (
              <>
                <label>Nouveau mot de passe (10 à 72 caractères)<input required type="password" autoComplete="new-password" minLength="10" maxLength="72" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
                <label>Confirmer le mot de passe<input required type="password" autoComplete="new-password" minLength="10" maxLength="72" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
                <button className="button button-dark submit-button" type="submit" disabled={sending}>{sending ? "Modification…" : "Modifier mon mot de passe"}</button>
              </>
            ) : (
              <>
                <label>E-mail<input required type="email" autoComplete="email" maxLength="254" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                <button className="button button-dark submit-button" type="submit" disabled={sending}>{sending ? "Envoi…" : "Recevoir un lien de réinitialisation"}</button>
              </>
            )}
          </form>
        )}
        {success?.startsWith("Votre mot de passe")
          ? <p className="account-switch"><Link to="/connexion">Se connecter</Link></p>
          : <p className="account-switch">Vous vous souvenez de votre mot de passe ? <Link to="/connexion">Se connecter</Link></p>}
        <Link className="account-back" to="/">Retour à l’accueil</Link>
      </section>
    </main>
  );
}
