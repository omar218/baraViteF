import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { LoginPage, PasswordRecoveryPage, RegisterPage } from "./AuthPages.jsx";
import { TermsPage, PrivacyPage } from "./LegalPages.jsx";
import { PaymentReturnPage, ProfessionalPage } from "./ProfessionalPages.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/mot-de-passe-oublie" element={<PasswordRecoveryPage />} />
          <Route path="/reinitialiser-mot-de-passe" element={<PasswordRecoveryPage />} />
          <Route path="/pros/:id" element={<ProfessionalPage />} />
          <Route path="/paiement/retour" element={<PaymentReturnPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
          <Route path="/cgu" element={<TermsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
