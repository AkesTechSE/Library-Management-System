import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Try both import styles for compatibility
import { adminAuth, adminDb } from "../lib/firebase/admin";
import admin from "firebase-admin";

type AdminSeed = {
  email: string;
  password: string;
  displayName: string;
  role: "admin";
};

const admins: AdminSeed[] = (() => {
  const raw = process.env.ADMIN_SEEDS;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdminSeed[];
  } catch {
    return [];
  }
})();

async function seedAdmins() {
  if (!admins.length) {
    console.error("No ADMIN_SEEDS found. Set ADMIN_SEEDS as a JSON array of admin users.");
    process.exit(1);
  }

  for (const adminUser of admins) {
    try {
      let userRecord;

      // 🔍 Check if user already exists
      try {
        userRecord = await adminAuth.getUserByEmail(adminUser.email);
        console.log(`⚠️  Admin already exists: ${adminUser.email}`);
      } catch {
        // 👤 Create user if not found
        userRecord = await adminAuth.createUser({
          email: adminUser.email,
          password: adminUser.password,
          displayName: adminUser.displayName,
        });
        console.log(`✅ Created auth user: ${adminUser.email}`);
      }

      // 📄 Upsert Firestore user doc
      await adminDb.collection("users").doc(userRecord.uid).set(
        {
          email: adminUser.email,
          displayName: adminUser.displayName,
          role: adminUser.role,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`✅ Firestore updated: ${adminUser.email}`);
    } catch (err) {
      console.error(`❌ Failed for ${adminUser.email}`, err);
    }
  }
}

seedAdmins().then(() => {
  console.log("🎉 Admin seeding complete.");
  process.exit(0);
});