# BaraViteF

BaraViteFais met en relation les clients avec des professionnels du secteur informel. Le projet comprend une interface React responsive et une API Node.js / Express connectée à MongoDB.

## Fonctionnalités du MVP

- Recherche de professionnels par métier, ville, nom ou description.
- Filtres par métier et profils avec expérience, note et statut vérifié.
- Formulaire de prise de contact enregistré dans MongoDB.
- Jeu de données de démonstration pour découvrir l'interface.
- Recherche vocale (navigateurs compatibles) et recherche de besoins formulés en langage naturel.
- Modèles de base pour les dossiers KYC/KYB, dispatch d'urgence, paiements XOF, jalons et portefeuilles.

## Prérequis

- Node.js 20.19+ ou 22.12+
- MongoDB local ou une instance MongoDB Atlas

## Installation

À la racine du projet :

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Copiez `.env.example` vers `server/.env` et renseignez `MONGODB_URI`. L'API charge également `server/.env.server` comme solution de repli si `MONGODB_URI` n'est pas défini dans `server/.env`. Pour MongoDB local, la valeur par défaut est :

```env
MONGODB_URI=mongodb://127.0.0.1:27017/BaraViteFe
PORT=5000
CLIENT_URL=http://localhost:5173
```

Avec MongoDB démarré, chargez les professionnels de démonstration :

```bash
npm run seed --prefix server
```

Démarrez ensuite l'API et le frontend :

```bash
npm run dev
```

L'interface est disponible à [http://localhost:5173](http://localhost:5173) et le contrôle de santé de l'API à [http://localhost:5000/api/health](http://localhost:5000/api/health).

## API

- `GET /api/health` — état de l'API et de MongoDB.
- `GET /api/professionals?search=...&trade=...` — recherche (maximum 50 résultats).
- `POST /api/professionals/:id/contact` — enregistre une demande de contact. Corps JSON : `{ "name": "...", "phone": "...", "message": "..." }`.

## Fondations des modules stratégiques

Les modèles `ProviderVerification`, `EmergencyDispatch`, `PaymentTransaction`, `ProjectMilestone` et `Wallet` structurent les données sans conserver de pièces d'identité en base : les dossiers de vérification ne stockent que des clés d'objets privés. Les justificatifs KYC/KYB requis, les paliers d'urgence (5, 10 et 20 km), le délai de réponse de 45 secondes et le calcul de commission de 10 % sont définis côté serveur.

Ces éléments ne constituent pas encore des intégrations de production. Les dépôts de pièces et selfies, les décisions de validation back-office, l'authentification/autorisation, la recherche PostGIS, la file Redis, les notifications push, le calcul du tarif kilométrique, les paiements Mobile Money, les webhooks vérifiés, le séquestre et les retraits nécessitent des fournisseurs et des secrets de déploiement dédiés. Aucun endpoint public n'expose ou ne modifie ces données tant qu'une authentification et les contrôles d'accès ne sont pas en place. Ne pas utiliser les champs de vérification historique `verified` comme preuve KYC pour autoriser des missions.

L'API de démonstration repose sur MongoDB et ne réalise pas de dispatch géospatial de production : l'index GeoJSON préparé n'est pas un substitut à PostGIS. Avant la mise en service, il faudra également ajouter le contrôle OTP de fin d'intervention, des écritures de ledger idempotentes et une réconciliation fiable avec les webhooks du prestataire de paiement.

Lancer les tests des règles de calcul et de recherche :

```bash
npm test --prefix server
```
