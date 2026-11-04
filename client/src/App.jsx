import { useEffect, useState } from "react";

const categories = [
  { label: "Tous les métiers", icon: "✳" },
  { label: "Électricien", icon: "ϟ" },
  { label: "Plombière", icon: "⌁" },
  { label: "Mécanicien", icon: "⚙" },
  { label: "Menuisier", icon: "⌑" },
  { label: "Peintre", icon: "◒" }
];

const universes = [
  { title: "Santé, pharmacies & soins d'urgence", icon: "✚", search: "médecin", description: "Médecins, infirmiers et pharmacies de garde, disponibles 24/7.", services: "Consultations · Soins à domicile · Pharmacies" },
  { title: "Urgences techniques 24/7", icon: "ϟ", search: "plombier", description: "Un dépannage rapide pour les pannes qui ne peuvent pas attendre.", services: "Plomberie · Électricité · Serrurerie" },
  { title: "Habitat, immobilier & BTP", icon: "⌂", search: "immobilier", description: "Des projets immobiliers aux travaux et rénovations de votre logement.", services: "Terrains · Construction · Rénovation" },
  { title: "Mobilité & véhicules", icon: "◉", search: "mécanicien", description: "Des solutions pour acheter, louer, entretenir ou réparer vos véhicules.", services: "Auto · Moto · Mécanique express" },
  { title: "Logistique & livraison express", icon: "➜", search: "livraison", description: "Faites acheminer vos courses, colis et plis entre les communes.", services: "Courses · Colis · Plis" },
  { title: "High-tech & sécurité", icon: "⌘", search: "informatique", description: "Installation et dépannage de vos équipements et réseaux.", services: "Informatique · Caméras · Wi-Fi" },
  { title: "Personnel & services pro", icon: "♙", search: "employé de maison", description: "Trouvez du personnel de confiance pour la maison et vos activités.", services: "Cuisine · Entretien · Gardiennage" },
  { title: "Événementiel & traiteurs", icon: "✦", search: "traiteur", description: "Organisez vos événements avec des professionnels et le bon matériel.", services: "Traiteurs · Sonorisation · Matériel de fête" },
  { title: "Soins & vétérinaires", icon: "♡", search: "vétérinaire", description: "Prenez soin de vos animaux, à domicile ou pendant vos déplacements.", services: "Vétérinaires · Toilettage · Garde & pension" },
  { title: "Nettoyage & pressing", icon: "✳", search: "pressing", description: "Confiez le grand ménage, les tissus d'ameublement ou votre linge.", services: "Ménage · Canapés & matelas · Collecte de linge" },
  { title: "Assistance administrative", icon: "▤", search: "formalités", description: "Soyez accompagné dans vos démarches par des facilitateurs de confiance.", services: "Certificats · Cartes grises · Formalités foncières & douanières" }
];

const categoryColors = ["mint", "peach", "lilac", "yellow", "blue", "pink"];

function initials(name = "") {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

async function fetchProfessionals(search, trade) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (trade) query.set("trade", trade);
  const response = await fetch(`/api/professionals?${query}`);
  if (!response.ok) throw new Error("Impossible de charger les professionnels.");
  return response.json();
}

function ContactDialog({ professional, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState({ kind: "", text: "" });
  const [sending, setSending] = useState(false);

  if (!professional) return null;

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setStatus({ kind: "", text: "" });
    try {
      const response = await fetch(`/api/professionals/${professional._id}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Votre demande n'a pas pu être envoyée.");
      setStatus({ kind: "success", text: result.message });
      setForm({ name: "", phone: "", message: "" });
    } catch (error) {
      setStatus({ kind: "error", text: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fermer">×</button>
        <span className="eyebrow">PRISE DE CONTACT</span>
        <h2 id="dialog-title">Contacter {professional.name}</h2>
        <p>Envoyez votre demande à {professional.name}, {professional.trade.toLowerCase()} à {professional.city}.</p>
        {status.text && <div className={`form-status ${status.kind}`} role="status">{status.text}</div>}
        <form onSubmit={submit} className="contact-form">
          <label>
            Votre nom
            <input required maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex. Marie Konan" />
          </label>
          <label>
            Votre téléphone
            <input required maxLength="30" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+225 07 00 00 00 00" />
          </label>
          <label>
            Votre besoin <span className="optional">(facultatif)</span>
            <textarea maxLength="1000" rows="3" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Décrivez brièvement votre demande…" />
          </label>
          <button className="button button-dark submit-button" type="submit" disabled={sending}>
            {sending ? "Envoi en cours…" : "Envoyer ma demande"} <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>
    </div>
  );
}

function ProfessionalCard({ professional, index, onContact }) {
  return (
    <article className="professional-card">
      <div className="card-top">
        <div className={`avatar ${categoryColors[index % categoryColors.length]}`} aria-hidden="true">{initials(professional.name)}</div>
        {professional.verified && <span className="verified"><span aria-hidden="true">✓</span> Vérifié</span>}
        <span className="rating"><span aria-hidden="true">★</span> {Number(professional.rating || 0).toFixed(1)}</span>
      </div>
      <div className="card-copy">
        <span className="trade">{professional.trade}</span>
        <h3>{professional.name}</h3>
        <p className="location"><span aria-hidden="true">⌖</span> {professional.city} <span className="dot">·</span> {professional.experience} ans d'expérience</p>
        <p className="description">{professional.description}</p>
      </div>
      <button className="button button-light card-contact" type="button" onClick={() => onContact(professional)}>
        Contacter <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [activeTrade, setActiveTrade] = useState("");
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contacting, setContacting] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchProfessionals(search, activeTrade)
      .then((items) => {
        if (active) setProfessionals(items);
      })
      .catch((requestError) => {
        if (active) setError(`${requestError.message} Vérifiez que le serveur et MongoDB sont démarrés.`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [search, activeTrade]);

  function submitSearch(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function startVoiceSearch() {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setSearchInput(transcript);
      setActiveTrade("");
      setSearch(transcript);
      setVoiceMessage("");
    };
    recognition.onerror = () => setVoiceMessage("La recherche vocale n'a pas abouti. Réessayez ou saisissez votre besoin.");
    setVoiceMessage("À votre écoute…");
    recognition.start();
  }

  function selectTrade(label) {
    setActiveTrade(label === "Tous les métiers" ? "" : label);
  }

  function exploreUniverse(searchTerm) {
    setActiveTrade("");
    setSearchInput(searchTerm);
    setSearch(searchTerm);
    document.getElementById("artisans").scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="BaraViteFe, accueil">
          <img src="/logo1.jpeg" alt="BaraViteFe" className="brand-logo" />
          <span className="brand-name">BaraViteFe</span>
        </a>
        <nav className="main-nav" aria-label="Navigation principale">
          <a className="nav-active" href="#univers">Nos 11 univers</a>
          <a href="#artisans">Trouver un pro</a>
          <a href="#comment-ca-marche">Comment ça marche</a>
        </nav>
        <a className="pro-link" href="#artisans">Vous êtes artisan ? <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-badge">Service rapide 24/7 • Côte d'Ivoire</div>
            <h1>Votre prochain service,<br />en <span>quelques minutes.</span></h1>
            <p className="hero-description">Trouvez un professionnel fiable pour les urgences, les travaux, les soins et les démarches du quotidien, près de chez vous.</p>
            <form className="search-bar" onSubmit={submitSearch}>
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input aria-label="Métier ou besoin" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Un métier, un besoin…" />
              {SpeechRecognition && <button className="voice-search" type="button" onClick={startVoiceSearch} aria-label="Rechercher par la voix" title="Rechercher par la voix">🎙</button>}
              <span className="search-divider" />
              <span className="search-pin" aria-hidden="true">⌖</span>
              <span className="search-city">Côte d'Ivoire</span>
              <button type="submit" aria-label="Rechercher">→</button>
            </form>
            {voiceMessage && <p className="voice-message" role="status">{voiceMessage}</p>}
            <div className="cta-row">
              <button className="primary-button" type="button" onClick={() => document.getElementById("artisans").scrollIntoView({ behavior: "smooth" })}>Trouver un pro</button>
              <a className="secondary-button" href="#comment-ca-marche">Comment ça marche</a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars" aria-hidden="true"><span>JK</span><span>AK</span><span>MD</span></div>
              <p><strong>Des pros de confiance</strong><br />à portée de main.</p>
            </div>
            <div className="hero-meta">
              <div><strong>24/7</strong><span>Disponibilité</span></div>
              <div><strong>+300</strong><span>Prestataires</span></div>
              <div><strong>4.8/5</strong><span>Note moyenne</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-label="Logo BaraViteFe">
            <div className="network-card">
              <div className="network-orbit orbit-one" />
              <div className="network-orbit orbit-two" />
              <div className="network-orbit orbit-three" />
              <img src="/logo1.jpeg" alt="Logo BaraViteFe" className="hero-logo" />
            </div>
          </div>
          <div className="hero-side-note">DES TALENTS LOCAUX, DES SOLUTIONS RAPIDES <span>———</span></div>
        </section>

        <section className="universes" id="univers">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BaraViteFe, À VOS CÔTÉS AU QUOTIDIEN</span>
              <h2>11 univers, <span>une seule app.</span></h2>
            </div>
            <p>Les services essentiels réunis au même endroit,<br />pour vous simplifier la vie partout en Côte d'Ivoire.</p>
          </div>
          <div className="universe-grid">
            {universes.map((universe, index) => (
              <article className="universe-card" key={universe.title}>
                <div className={`universe-icon ${categoryColors[index % categoryColors.length]}`} aria-hidden="true">{universe.icon}</div>
                <h3>{universe.title}</h3>
                <p>{universe.description}</p>
                <span className="universe-services">{universe.services}</span>
                <button className="universe-link" type="button" onClick={() => exploreUniverse(universe.search)}>
                  Rechercher un pro <span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="directory" id="artisans">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FAITES APPEL AUX BONS TALENTS</span>
              <h2>Un pro pour chaque <span>besoin.</span></h2>
            </div>
            <p>Des artisans passionnés, près de chez vous.<br />Le savoir-faire local n'a jamais été aussi proche.</p>
          </div>
          <div className="category-list" role="group" aria-label="Filtrer par métier">
            {categories.map((category) => {
              const selected = (category.label === "Tous les métiers" && !activeTrade) || category.label === activeTrade;
              return (
                <button key={category.label} type="button" className={`category-chip${selected ? " selected" : ""}`} onClick={() => selectTrade(category.label)} aria-pressed={selected}>
                  <span aria-hidden="true">{category.icon}</span>{category.label}
                </button>
              );
            })}
          </div>
          <div className="results-row">
            <h3>Les pros du moment <span>({professionals.length})</span></h3>
            <span className="sort-note">Les mieux notés <span aria-hidden="true">⌄</span></span>
          </div>
          {loading && <div className="notice" role="status">Recherche des professionnels…</div>}
          {!loading && error && <div className="notice notice-error" role="alert">{error}</div>}
          {!loading && !error && professionals.length === 0 && (
            <div className="notice">Aucun professionnel ne correspond à cette recherche. Essayez un autre métier ou une autre ville.</div>
          )}
          {!loading && !error && professionals.length > 0 && (
            <div className="professional-grid">
              {professionals.map((professional, index) => (
                <ProfessionalCard key={professional._id} professional={professional} index={index} onContact={setContacting} />
              ))}
            </div>
          )}
        </section>

        <section className="how-it-works" id="comment-ca-marche">
          <span className="eyebrow">SIMPLE COMME BONJOUR</span>
          <h2>Votre prochain pro<br />est à <span>trois clics.</span></h2>
          <div className="steps">
            <article><span className="step-number">01</span><h3>Choisissez un métier</h3><p>Parcourez les profils ou cherchez le service dont vous avez besoin.</p></article>
            <article><span className="step-number">02</span><h3>Trouvez votre pro</h3><p>Comparez les avis, l'expérience et les disponibilités près de chez vous.</p></article>
            <article><span className="step-number">03</span><h3>Entrez en contact</h3><p>Envoyez votre demande directement à l'artisan, sans intermédiaire.</p></article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="BaraViteFe, accueil"><img src="/logo1.jpeg" alt="BaraViteFe" className="brand-logo" /><span className="brand-name">BaraViteFe</span></a>
        <span>Le savoir-faire local, à portée de main.</span>
        <span>© 2026 BaraViteFe · Côte d'Ivoire</span>
      </footer>
      <ContactDialog professional={contacting} onClose={() => setContacting(null)} />
    </div>
  );
}
