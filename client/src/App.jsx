import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api.js";
import { useAuth } from "./AuthContext.jsx";

const categories = [
  { label: "Tous les métiers", icon: "✳" },
  { label: "Électricien", icon: "ϟ" },
  { label: "Plombière", icon: "⌁" },
  { label: "Mécanicien", icon: "⚙" },
  { label: "Menuisier", icon: "⌑" },
  { label: "Peintre", icon: "◒" }
];

const quickServices = [
  { title: "Électricité", detail: "Pannes & installations", icon: "ϟ", search: "électricien" },
  { title: "Plomberie", detail: "Fuites & sanitaires", icon: "⌁", search: "plombier" },
  { title: "Informatique", detail: "Dépannage & réseau", icon: "⌘", search: "informatique" },
  { title: "Urgence 24/7", detail: "Un pro près de vous", icon: "↗", search: "urgence technique" }
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

function locationErrorMessage(error) {
  if (error.code === 1) return "Autorisez l'accès à votre position dans les réglages du navigateur.";
  if (error.code === 2) return "Votre position ne peut pas être déterminée.";
  if (error.code === 3) return "La demande de localisation a expiré. Réessayez.";
  return "La géolocalisation n'est pas disponible sur cet appareil.";
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => reject(new Error(locationErrorMessage(error))),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

function requestErrorMessage(error, fallback) {
  return error.response?.data?.message || (error instanceof TypeError ? fallback : error.message || fallback);
}

async function fetchProfessionals(search, trade, location, city, neighborhood, available) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (trade) query.set("trade", trade);
  if (city) query.set("city", city);
  if (neighborhood) query.set("neighborhood", neighborhood);
  query.set("available", available);
  if (location) {
    query.set("lat", String(location.latitude));
    query.set("lng", String(location.longitude));
  }
  const { data } = await api.get(`/pros?${query}`);
  return data;
}

function ProfessionalCard({ professional, index }) {
  return (
    <article className="professional-card">
      <div className="card-top">
        <div className={`avatar ${categoryColors[index % categoryColors.length]}`} aria-hidden="true">{initials(professional.name)}</div>
        <span className={`availability-badge${professional.available ? "" : " unavailable"}`}><span aria-hidden="true">●</span> {professional.available ? "Disponible" : "Indisponible"}</span>
        {professional.verified && <span className="verified"><span aria-hidden="true">✓</span> Vérifié</span>}
        <span className="rating"><span aria-hidden="true">★</span> {Number(professional.rating || 0).toFixed(1)}</span>
      </div>
      <div className="card-copy">
        <span className="trade">{professional.trade}</span>
        <h3>{professional.name}</h3>
        <p className="location"><span aria-hidden="true">⌖</span> {professional.city} <span className="dot">·</span> {professional.experience} ans d'expérience</p>
        {Number.isFinite(professional.distanceMeters) && (
          <p className="professional-distance">À {professional.distanceMeters < 1000
            ? `${Math.round(professional.distanceMeters)} m`
            : `${(professional.distanceMeters / 1000).toFixed(1)} km`} de vous</p>
        )}
        <p className="description">{professional.description}</p>
      </div>
      <Link className="button button-light card-contact" to={`/pros/${professional._id}`}>
        Voir le profil et les coordonnées <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [activeTrade, setActiveTrade] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("true");
  const [cityInput, setCityInput] = useState("");
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [availabilityInput, setAvailabilityInput] = useState("true");
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientLocation, setClientLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ kind: "", text: "" });
  const [locatingClient, setLocatingClient] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const { user, logout, sessionError } = useAuth();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchProfessionals(search, activeTrade, clientLocation, cityFilter, neighborhoodFilter, availabilityFilter)
      .then((items) => {
        if (active) setProfessionals(items);
      })
      .catch((requestError) => {
        if (active) {
          setError(`${requestErrorMessage(requestError, "Connexion impossible.")} Vérifiez que le serveur et MongoDB sont démarrés.`);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [search, activeTrade, clientLocation, cityFilter, neighborhoodFilter, availabilityFilter]);

  function submitFilters(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setCityFilter(cityInput.trim());
    setNeighborhoodFilter(neighborhoodInput.trim());
    setAvailabilityFilter(availabilityInput);
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

  async function toggleNearbyProfessionals() {
    if (clientLocation) {
      setClientLocation(null);
      setLocationStatus({ kind: "", text: "" });
      return;
    }

    setLocatingClient(true);
    setLocationStatus({ kind: "", text: "" });
    try {
      const location = await getCurrentLocation();
      setClientLocation(location);
      setLocationStatus({ kind: "success", text: "Les professionnels disponibles sont triés par proximité." });
    } catch (error) {
      setLocationStatus({ kind: "error", text: error.message });
    } finally {
      setLocatingClient(false);
    }
  }

  function exploreUniverse(searchTerm) {
    setActiveTrade("");
    setSearchInput(searchTerm);
    setSearch(searchTerm);
    document.getElementById("artisans").scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#artisans">Aller directement aux professionnels</a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Barra Rapide, accueil">
          <img src="/logo1.jpeg" alt="Barra Rapide" className="brand-logo" />
          <span className="brand-name">Barra Rapide</span>
        </a>
        <nav className="main-nav" aria-label="Navigation principale">
          <a className="nav-active" href="#univers">Nos 11 univers</a>
          <a href="#artisans">Trouver un pro</a>
          <a href="#comment-ca-marche">Comment ça marche</a>
        </nav>
        <Link className="pro-link" to="/inscription?role=pro">
          <span className="pro-link-full">Vous êtes artisan ?</span>
          <span className="pro-link-compact">Devenir pro</span>
          <span className="pro-link-arrow" aria-hidden="true">↗</span>
        </Link>
        {user ? (
          <button className="account-nav" type="button" onClick={logout}>Déconnexion</button>
        ) : (
          <Link className="account-nav" to="/connexion">Connexion</Link>
        )}
      </header>

      <main>
        {sessionError && <div className="session-alert" role="status">{sessionError}</div>}
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-badge">Service rapide 24/7 • Côte d'Ivoire</div>
            <h1>Votre prochain service,<br />en <span>quelques minutes.</span></h1>
            <p className="hero-description">Trouvez un professionnel fiable pour les urgences, les travaux, les soins et les démarches du quotidien, près de chez vous.</p>
            <div className="quick-start">
              <div className="quick-start-heading">
                <span>Par où commencer ?</span>
                {SpeechRecognition && (
                  <button className="voice-search" type="button" onClick={startVoiceSearch} aria-label="Rechercher par la voix" title="Rechercher par la voix">
                    🎙 <span>Recherche vocale</span>
                  </button>
                )}
              </div>
              <div className="quick-service-grid">
                {quickServices.map((service) => (
                  <button className="quick-service" key={service.title} type="button" onClick={() => exploreUniverse(service.search)}>
                    <span className="quick-service-icon" aria-hidden="true">{service.icon}</span>
                    <span className="quick-service-copy"><strong>{service.title}</strong><small>{service.detail}</small></span>
                    <span className="quick-service-arrow" aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </div>
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
          <div className="hero-visual" aria-label="Logo Barra Rapide">
            <div className="network-card">
              <div className="network-orbit orbit-one" />
              <div className="network-orbit orbit-two" />
              <div className="network-orbit orbit-three" />
              <img src="/logo1.jpeg" alt="Logo Barra Rapide" className="hero-logo" />
            </div>
          </div>
          <div className="hero-side-note">DES TALENTS LOCAUX, DES SOLUTIONS RAPIDES <span>———</span></div>
        </section>

        <section className="universes" id="univers">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BARRA RAPIDE, À VOS CÔTÉS AU QUOTIDIEN</span>
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
          <div className="nearby-control">
            <button className="location-button" type="button" onClick={toggleNearbyProfessionals} disabled={locatingClient} aria-pressed={Boolean(clientLocation)}>
              <span aria-hidden="true">⌖</span>
              {locatingClient ? "Localisation en cours…" : clientLocation ? "Désactiver le tri par proximité" : "Voir les professionnels près de moi"}
            </button>
            {locationStatus.text && <span className={`location-message ${locationStatus.kind}`} role={locationStatus.kind === "error" ? "alert" : "status"}>{locationStatus.text}</span>}
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
          <form className="directory-filters" onSubmit={submitFilters}>
            <label>Métier ou besoin<input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Ex. électricien" maxLength="80" /></label>
            <label>Ville / commune<input value={cityInput} onChange={(event) => setCityInput(event.target.value)} placeholder="Ex. Abidjan" maxLength="80" /></label>
            <label>Quartier<input value={neighborhoodInput} onChange={(event) => setNeighborhoodInput(event.target.value)} placeholder="Ex. Cocody" maxLength="80" /></label>
            <label>Disponibilité
              <select value={availabilityInput} onChange={(event) => setAvailabilityInput(event.target.value)}>
                <option value="true">Disponibles</option>
                <option value="all">Tous</option>
                <option value="false">Indisponibles</option>
              </select>
            </label>
            <button className="button button-dark" type="submit">Appliquer les filtres</button>
          </form>
          <div className="results-row">
            <h3>Les pros du moment <span>({professionals.length})</span></h3>
            <span className="sort-note">{clientLocation ? "Triés par proximité" : "Les mieux notés"}</span>
          </div>
          {loading && <div className="notice" role="status">Recherche des professionnels…</div>}
          {!loading && error && <div className="notice notice-error" role="alert">{error}</div>}
          {!loading && !error && professionals.length === 0 && (
            <div className="notice">
              {clientLocation
                ? "Aucun professionnel disponible avec une position enregistrée ne correspond à cette recherche."
                : "Aucun professionnel ne correspond à cette recherche. Essayez un autre métier ou une autre ville."}
            </div>
          )}
          {!loading && !error && professionals.length > 0 && (
            <div className="professional-grid">
              {professionals.map((professional, index) => (
                <ProfessionalCard key={professional._id} professional={professional} index={index} />
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
            <article><span className="step-number">03</span><h3>Débloquez le contact</h3><p>Payez en Mobile Money et recevez les coordonnées du professionnel après confirmation.</p></article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="Barra Rapide, accueil"><img src="/logo1.jpeg" alt="Barra Rapide" className="brand-logo" /><span className="brand-name">Barra Rapide</span></a>
        <span>Le savoir-faire local, à portée de main.</span>
        <nav className="legal-links" aria-label="Informations légales">
          <Link to="/confidentialite">Confidentialité</Link>
          <Link to="/cgu">CGU</Link>
        </nav>
        <span>© 2026 Barra Rapide · Côte d'Ivoire</span>
      </footer>
    </div>
  );
}
