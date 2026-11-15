import assert from "node:assert/strict";
import test from "node:test";
import { validateProfessionalRegistration } from "../services/professional-registration.js";

test("validates and trims professional registration fields", () => {
  assert.deepEqual(
    validateProfessionalRegistration({
      name: "  Aïcha Coulibaly ",
      trade: " Plombière ",
      city: " Abidjan ",
      description: " Dépannage à domicile. ",
      phone: " +225 07 00 00 00 00 ",
      experience: 5,
      location: { type: "Point", coordinates: [-4.0083, 5.36] },
      verified: true,
      available: false
    }),
    {
      data: {
        name: "Aïcha Coulibaly",
        trade: "Plombière",
        city: "Abidjan",
        description: "Dépannage à domicile.",
        phone: "+225 07 00 00 00 00",
        experience: 5,
        location: { type: "Point", coordinates: [-4.0083, 5.36] }
      }
    }
  );
});

test("rejects missing, oversized, and invalid experience values", () => {
  const registration = {
    name: "Aïcha Coulibaly",
    trade: "Plombière",
    city: "Abidjan",
    description: "Dépannage à domicile.",
    phone: "+225 07 00 00 00 00",
    experience: 5,
    location: { type: "Point", coordinates: [-4.0083, 5.36] }
  };

  assert.ok(validateProfessionalRegistration(null).error);
  assert.ok(validateProfessionalRegistration({ ...registration, name: " " }).error);
  assert.ok(validateProfessionalRegistration({ ...registration, description: "x".repeat(1001) }).error);
  assert.ok(validateProfessionalRegistration({ ...registration, experience: -1 }).error);
  assert.ok(validateProfessionalRegistration({ ...registration, experience: 2.5 }).error);
  assert.ok(validateProfessionalRegistration({ ...registration, experience: 81 }).error);
  assert.ok(validateProfessionalRegistration({ ...registration, location: null }).error);
});
