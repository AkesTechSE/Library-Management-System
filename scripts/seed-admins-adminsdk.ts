import admin, { adminAuth, adminDb } from "../lib/firebase/admin";

async function seedAdmins() {
  const admins = (() => {
    const raw = process.env.ADMIN_SEEDS;
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Array<{ email: string; password: string; displayName: string; role: "admin" }>;
    } catch {
      return [];
    }
  })();

  if (!admins.length) {
    console.error("No ADMIN_SEEDS found. Set ADMIN_SEEDS as a JSON array of admin users.");
    process.exit(1);
  }

  for (const adminUser of admins) {
    try {
      // Create user in Firebase Auth
      const userRecord = await adminAuth.createUser({
        email: adminUser.email,
        password: adminUser.password,
        displayName: adminUser.displayName,
      });
      // Add user profile to Firestore
      await adminDb.collection("users").doc(userRecord.uid).set({
        email: adminUser.email,
        displayName: adminUser.displayName,
        role: adminUser.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Seeded admin: ${adminUser.email}`);
    } catch (err) {
      console.error(`Failed to seed admin ${adminUser.email}:`, err);
    }
  }
}

seedAdmins().then(() => {
  console.log("Seeding complete.");
  process.exit(0);
});
