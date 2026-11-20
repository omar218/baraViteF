import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "./api.js";
import { useAuth } from "./AuthContext.jsx";

function formatXof(amount) {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

export function ProfessionalPage() {
  const { id } = useParams();
  const [professional, setProfessional] = useState(null);
  const [unlockPrice, setUnlockPrice] = useState(null);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);
  const [searchParams] = useSearchParams();
  const { user, loading, sessionError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get(`/pros/${id}`)
      .then(({ data }) => {
        if (active) setProfessional(data.professional);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Impossible de charger ce profil.");
      });
    api.get("/payments/unlock-price")
      .then(({ data }) => {
        if (active) setUnlockPrice(data);
      })
      .catch((requestError) => {
        if (active) setPaymentError(requestError.response?.data?.message || "Le paiement n’est pas disponible pour le moment.");
      });
    return () => { active = false; };
  }, [id]);

  async function unlockContact() {
    if (!user) {
      navigate("/connexion");
      return;
    }
    if (user.role !== "client") {
      setError("Seuls les comptes clients peuvent débloquer un contact.");
      return;
    }
    setPaying(true);
    setError("");
    try {
      const { data } = await api.post("/payments/init-unlock", { proId: id });
      window.location.assign(data.paymentUrl);
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        try {
          const { data } = await api.get(`/pros/${id}`);
          setProfessional(data.professional);
          if (data.professional.isUnlocked) {
            setError("");
            setPaying(false);
            return;
          }
        } catch (refreshError) {
          setError(refreshError.response?.data?.message || "Impossible d’actualiser le profil.");
          setPaying(false);
          return;
        }
      }
      setError(requestError.response?.data?.message || "Le paiement ne peut pas être initialisé.");
      setPaying(false);
    }
  }

  if (error && !professional) {
    return <main className="account-page"><section className="account-card"><div className="form-status error">{error}</div><Link to="/">Retour à l’annuaire</Link></section></main>;
  }
  if (!professional) return <main className="account-page"><section className="account-card">Chargement du profil…</section></main>;

  const unlocked = Boolean(professional.isUnlocked && professional.phone);
  const rawPhone = unlocked ? professional.phone.trim() : "";
  const phoneDigits = rawPhone.replace(/\D/g, "");
  const whatsappNumber = unlocked && phoneDigits.length >= 8 && phoneDigits.length <= 15
    ? rawPhone.startsWith("00")
      ? phoneDigits.slice(2)
      : rawPhone.startsWith("+") || phoneDigits.startsWith("225")
        ? phoneDigits
        : `225${phoneDigits}`
    : "";
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";
  const paymentSuccess = searchParams.get("payment") === "success";

  return (
    <main className="account-page">
      <article className="professional-profile">
        <Link className="account-back" to="/">← Retour aux professionnels</Link>
        {sessionError && <div className="form-status error" role="status">{sessionError}</div>}
        {paymentSuccess && <div className="form-status success" role="status">Paiement confirmé. Le contact est débloqué.</div>}
        {error && <div className="form-status error" role="alert">{error}</div>}
        <span className="eyebrow">{professional.trade}</span>
        <h1>{professional.name}</h1>
        <p className="profile-location">{professional.city}{professional.neighborhood ? ` · ${professional.neighborhood}` : ""}</p>
        <p>{professional.description}</p>
        <dl className="profile-facts">
          <div><dt>Expérience</dt><dd>{professional.experience} ans</dd></div>
          <div><dt>Note</dt><dd>{Number(professional.rating || 0).toFixed(1)} / 5</dd></div>
          <div><dt>Disponibilité</dt><dd>{professional.available ? "Disponible" : "Indisponible"}</dd></div>
          {professional.indicativePriceXof !== null && <div><dt>Tarif indicatif</dt><dd>{formatXof(professional.indicativePriceXof)} FCFA</dd></div>}
        </dl>
        {unlocked ? (
          <div className="unlocked-contact">
            <h2>Coordonnées débloquées</h2>
            <a href={`tel:${professional.phone}`}>Appeler {professional.phone}</a>
            {whatsappLink && <a className="button button-dark submit-button" href={whatsappLink} target="_blank" rel="noopener noreferrer">Contacter sur WhatsApp ↗</a>}
          </div>
        ) : (
          <section className="unlock-panel">
            <h2>Débloquer le contact</h2>
            <p>Le numéro et les coordonnées directes restent masqués jusqu’à la confirmation du paiement Mobile Money.</p>
            {paymentError && <div className="form-status error" role="alert">{paymentError}</div>}
            {unlockPrice && <p className="unlock-price">{formatXof(unlockPrice.amount)} FCFA</p>}
            {!loading && !user && <p><Link to="/connexion">Connectez-vous comme client</Link> pour continuer.</p>}
            {user?.role === "pro" && <p>Les comptes professionnels ne peuvent pas débloquer de contacts.</p>}
            {(user?.role === "client" || (!loading && !user)) && (
              <button className="button button-dark submit-button" type="button" onClick={unlockContact} disabled={paying || loading || !unlockPrice}>
                {paying ? "Préparation du paiement…" : "Payer et débloquer"} <span aria-hidden="true">↗</span>
              </button>
            )}
          </section>
        )}
      </article>
    </main>
  );
}

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Vérification du paiement…");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const transactionId = searchParams.get("transaction_id");
    if (!transactionId) {
      setError("Identifiant de paiement absent de l’URL de retour.");
      return undefined;
    }

    let active = true;
    let timeout;
    let attempt = 0;
    async function checkStatus() {
      try {
        const { data } = await api.get(`/payments/status/${encodeURIComponent(transactionId)}`);
        if (!active) return;
        if (data.status === "SUCCESS") {
          navigate(`/pros/${data.proId}?payment=success`, { replace: true });
          return;
        }
        if (data.status === "FAILED") {
          setError("Le paiement a échoué. Aucun contact n’a été débloqué.");
          return;
        }
        attempt += 1;
        if (attempt >= 30) {
          setStatus("Le paiement est toujours en cours. Rechargez cette page dans quelques instants pour vérifier son statut.");
          return;
        }
        setStatus("Paiement en attente de confirmation…");
        timeout = window.setTimeout(checkStatus, 3000);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Impossible de vérifier le paiement.");
      }
    }
    checkStatus();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [navigate, searchParams]);

  return (
    <main className="account-page">
      <section className="account-card">
        <span className="eyebrow">PAIEMENT MOBILE MONEY</span>
        <h1>Confirmation</h1>
        {error ? <div className="form-status error" role="alert">{error}</div> : <p role="status">{status}</p>}
        <Link to="/">Retour à l’annuaire</Link>
      </section>
    </main>
  );
}
