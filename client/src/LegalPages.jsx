import { Link } from "react-router-dom";

function LegalLayout({ title, children }) {
  return (
    <main className="legal-page">
      <article className="legal-document">
        <Link className="account-back" to="/">← Retour à Barra Rapide</Link>
        <span className="eyebrow">INFORMATIONS JURIDIQUES</span>
        <h1>{title}</h1>
        <p className="legal-updated">Version du 20 novembre 2026</p>
        {children}
        <p className="legal-notice">Ce texte est un modèle opérationnel à valider avec le responsable de Barra Rapide et un conseil juridique avant la mise en production, notamment au regard des formalités applicables en Côte d’Ivoire.</p>
      </article>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>Cette politique explique comment Barra Rapide collecte et utilise les données personnelles des clients et des professionnels qui utilisent sa plateforme de mise en relation. Le service est destiné aux utilisateurs en Côte d’Ivoire.</p>
      <h2>Responsable du traitement et contact</h2>
      <p>Le responsable du traitement est l’entité qui exploite Barra Rapide. Son nom légal, son adresse et son adresse de contact dédiée doivent être complétés et publiés avant l’ouverture du service. Pour exercer vos droits, utilisez le canal de contact officiel indiqué sur le site ou dans l’application. Ne transmettez pas de pièce d’identité par un canal public.</p>
      <h2>Données traitées</h2>
      <ul>
        <li>Identité et compte : nom, adresse e-mail, téléphone, rôle client ou professionnel, identifiants de connexion sous forme de mot de passe haché et dates d’acceptation des conditions.</li>
        <li>Profil professionnel : métier, description, commune/ville, quartier, disponibilité, expérience et tarif indicatif.</li>
        <li>Mise en relation : contacts débloqués et demandes de contact associées.</li>
        <li>Paiement : identifiant de transaction, montant en XOF, devise, statut et références techniques renvoyées par l’agrégateur Mobile Money. Barra Rapide ne demande ni ne conserve le code PIN Mobile Money ou les données complètes de carte.</li>
        <li>Données techniques nécessaires à la sécurité et au fonctionnement, telles que journaux d’erreurs et informations de connexion. Si vous activez la recherche de proximité et autorisez le navigateur, vos coordonnées GPS sont transmises temporairement pour trier les profils ; elles ne sont pas enregistrées dans votre compte.</li>
      </ul>
      <h2>Finalités et fondements</h2>
      <p>Les données servent à créer et sécuriser les comptes, afficher et rechercher des profils, permettre une mise en relation après confirmation du paiement, gérer les transactions, prévenir la fraude, assurer l’assistance et respecter les obligations légales. Les données requises pour le compte et le paiement sont nécessaires à l’exécution du service ; les traitements optionnels reposent sur votre consentement, que vous pouvez retirer pour l’avenir.</p>
      <h2>Partage des données</h2>
      <p>Les coordonnées directes d’un professionnel sont communiquées au client concerné uniquement après confirmation par la passerelle du paiement du déblocage. Les fournisseurs d’hébergement, de base de données et de paiement reçoivent uniquement les données nécessaires à leur prestation. Ils doivent être encadrés contractuellement et, lorsqu’un transfert hors de Côte d’Ivoire est effectué, les garanties et formalités applicables doivent être vérifiées. Barra Rapide ne vend pas les données personnelles.</p>
      <h2>Durées de conservation</h2>
      <p>Les données de compte et de profil sont conservées pendant la durée d’utilisation du compte, puis supprimées ou anonymisées dans un délai cible de trois ans après la dernière activité, sauf demande valide de suppression antérieure. Les éléments comptables et de transaction sont conservés pendant la durée imposée par les obligations légales. Les journaux de sécurité sont conservés pour une durée limitée et proportionnée, définie dans la configuration opérationnelle. Les données nécessaires à un litige peuvent être conservées jusqu’à sa clôture et à l’expiration des délais applicables.</p>
      <h2>Sécurité</h2>
      <p>Barra Rapide met en œuvre des contrôles d’accès, le hachage des mots de passe, des communications chiffrées en production, la limitation des tentatives de connexion et la minimisation des données retournées à l’annuaire. Le jeton de session est conservé dans le stockage local du navigateur et expire selon sa durée de validité ; déconnectez-vous sur un appareil partagé. Aucun dispositif ne garantit une sécurité absolue ; signalez rapidement tout accès suspect par le canal de contact officiel.</p>
      <h2>Vos droits</h2>
      <p>Sous réserve des règles applicables, vous pouvez demander l’accès à vos données, leur rectification, leur effacement, la limitation ou l’opposition à certains traitements, ainsi que la portabilité lorsque celle-ci s’applique. Vous pouvez retirer un consentement sans remettre en cause les traitements antérieurs. Une vérification raisonnable de votre identité peut être nécessaire. Vous pouvez également saisir l’autorité ivoirienne compétente en matière de protection des données personnelles.</p>
      <h2>Suppression et réclamations</h2>
      <p>Adressez une demande au contact officiel de Barra Rapide en précisant l’adresse e-mail du compte et le droit exercé. La suppression d’un compte n’efface pas les pièces que la loi impose de conserver ; celles-ci sont alors restreintes et supprimées à l’échéance légale. Une réponse est fournie dans les délais prescrits par la réglementation applicable.</p>
      <h2>Mise à jour de la politique</h2>
      <p>La politique peut évoluer avec le service ou la réglementation. Les changements importants seront annoncés dans l’application et, si nécessaire, soumis à une nouvelle acceptation.</p>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Conditions générales d’utilisation">
      <p>Les présentes conditions encadrent l’accès à Barra Rapide, une plateforme qui facilite la recherche et la mise en relation entre des clients et des professionnels indépendants en Côte d’Ivoire.</p>
      <h2>Rôle de la plateforme</h2>
      <p>Barra Rapide facilite la découverte des profils et, après paiement du tarif affiché, la communication des coordonnées du professionnel. Sauf accord écrit distinct, la plateforme n’est pas partie au contrat de prestation conclu entre le client et le professionnel et ne garantit ni la qualité, ni la disponibilité, ni le résultat d’une intervention. Chaque utilisateur vérifie les informations utiles avant de conclure une prestation.</p>
      <h2>Compte et informations exactes</h2>
      <p>Vous devez fournir des informations exactes, préserver la confidentialité de vos identifiants et nous signaler tout usage non autorisé. Les professionnels maintiennent leurs coordonnées, leur métier, leur zone, leurs tarifs indicatifs et leur disponibilité à jour. La création d’un compte professionnel ne vaut pas certification ou vérification d’identité.</p>
      <h2>Déblocage du contact et paiement</h2>
      <p>Le prix en FCFA, la devise et le moyen de paiement sont affichés avant la redirection vers l’agrégateur Mobile Money. Le contact est débloqué uniquement après confirmation de la transaction par la passerelle. Une demande de remboursement ou une erreur de paiement doit être adressée à l’assistance officielle avec l’identifiant de transaction ; les droits prévus par la loi demeurent applicables.</p>
      <h2>Usage acceptable</h2>
      <p>Il est interdit de publier des informations trompeuses, d’usurper une identité, de harceler d’autres utilisateurs, de contourner les contrôles d’accès ou d’utiliser la plateforme à des fins illicites. Barra Rapide peut suspendre un compte en cas de risque de fraude ou de violation, après examen proportionné et sous réserve des recours prévus par la loi.</p>
      <h2>Disponibilité et responsabilité</h2>
      <p>Le service est fourni avec des efforts raisonnables de disponibilité et peut être temporairement interrompu pour maintenance ou sécurité. Les limitations de responsabilité ne s’appliquent pas lorsqu’elles sont interdites par la loi ni aux responsabilités qui ne peuvent être exclues.</p>
      <h2>Données personnelles et changements</h2>
      <p>La politique de confidentialité décrit les traitements de données. Les conditions peuvent évoluer ; les changements substantiels sont notifiés avant leur entrée en vigueur lorsque la réglementation l’exige. La version applicable est celle présentée au moment de votre utilisation.</p>
      <h2>Droit applicable</h2>
      <p>Les conditions sont régies par le droit applicable en Côte d’Ivoire. Les différends relèvent des juridictions compétentes, sans préjudice des règles impératives de protection des consommateurs.</p>
      <p>Pour toute question, utilisez le contact officiel de Barra Rapide publié dans l’application. Les coordonnées légales de l’exploitant doivent être complétées avant l’ouverture au public.</p>
    </LegalLayout>
  );
}
