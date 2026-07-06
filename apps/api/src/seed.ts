import { db } from "./infrastructure/db/client.js";
import {
  clinics,
  users,
  specialties,
  practitioners,
  scheduleTemplates,
  patients,
} from "./infrastructure/db/schema.js";
import { hashPassword } from "./infrastructure/auth/password.js";

export async function seedDatabase(): Promise<void> {
  const [existingClinic] = await db.select().from(clinics).limit(1);
  if (existingClinic) {
    process.env.DEFAULT_CLINIC_ID = existingClinic.id;
    console.log("[seed] Database already seeded");
    return;
  }

  const [clinic] = await db
    .insert(clinics)
    .values({ name: "Clínica Demo Smooth Flow", timezone: "America/Santiago" })
    .returning();

  process.env.DEFAULT_CLINIC_ID = clinic.id;

  const passwordHash = await hashPassword("Password123!");

  const staff = await db
    .insert(users)
    .values([
      {
        clinicId: clinic.id,
        email: "dueno@smoothflow.cl",
        passwordHash,
        role: "dueno",
        givenName: "Carlos",
        familyName: "Méndez",
      },
      {
        clinicId: clinic.id,
        email: "secretaria1@hospital.org",
        passwordHash,
        role: "secretaria",
        givenName: "María",
        familyName: "López",
      },
      {
        clinicId: clinic.id,
        email: "doctor@smoothflow.cl",
        passwordHash,
        role: "medico",
        givenName: "Roberto",
        familyName: "Chen",
      },
    ])
    .returning();

  const dueno = staff.find((s) => s.role === "dueno")!;
  const doctor = staff.find((s) => s.role === "medico")!;

  const [specialty] = await db
    .insert(specialties)
    .values([
      { clinicId: clinic.id, name: "Medicina General", description: "Atención primaria" },
      { clinicId: clinic.id, name: "Pediatría", description: "Atención infantil" },
    ])
    .returning();

  const [practitioner] = await db
    .insert(practitioners)
    .values({
      clinicId: clinic.id,
      userId: doctor.id,
      specialtyId: specialty.id,
      givenName: doctor.givenName,
      familyName: doctor.familyName,
      email: doctor.email,
    })
    .returning();

  await db.insert(scheduleTemplates).values([
    {
      practitionerId: practitioner.id,
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    },
    {
      practitionerId: practitioner.id,
      dayOfWeek: 2,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    },
    {
      practitionerId: practitioner.id,
      dayOfWeek: 3,
      startTime: "09:00",
      endTime: "13:00",
      slotDurationMinutes: 30,
    },
    {
      practitionerId: practitioner.id,
      dayOfWeek: 4,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    },
    {
      practitionerId: practitioner.id,
      dayOfWeek: 5,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    },
  ]);

  const [patientUser] = await db
    .insert(users)
    .values({
      clinicId: clinic.id,
      email: "paciente@smoothflow.cl",
      passwordHash,
      role: "paciente",
      givenName: "Ana",
      familyName: "García",
    })
    .returning();

  await db.insert(patients).values({
    clinicId: clinic.id,
    userId: patientUser.id,
    givenName: patientUser.givenName,
    familyName: patientUser.familyName,
    email: patientUser.email,
  });

  console.log("[seed] Demo data created:");
  console.log("  Dueño:      dueno@smoothflow.cl / Password123!");
  console.log("  Secretaria: secretaria1@hospital.org / Password123!");
  console.log("  Doctor:     doctor@smoothflow.cl / Password123!");
  console.log("  Paciente:   paciente@smoothflow.cl / Password123!");
  console.log(`  Clinic ID:  ${clinic.id}`);
  void dueno;
}
