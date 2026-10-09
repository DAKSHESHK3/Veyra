import fs from "fs";
import path from "path";

/**
 * Migration Utility: Reads legacy Python/Tkinter Students_Enrollment.csv
 * and outputs Supabase SQL migration statements or JSON for import.
 */

async function migrateLegacyData() {
  const csvPath = path.resolve(__dirname, "../legacy/Students_Enrollment.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("Legacy CSV not found at:", csvPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Parse header
  const header = lines[0].split(",");
  const nameIdx = header.findIndex((h) => h.trim().toLowerCase().includes("name"));
  const rollIdx = header.findIndex((h) => h.trim().toLowerCase().includes("roll"));

  console.log("Found legacy enrollment records:");
  const students = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const name = parts[nameIdx]?.trim();
    const roll = parts[rollIdx]?.trim();
    if (name && roll) {
      // Capitalize name
      const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      students.push({
        roll_number: roll,
        full_name: normalizedName,
        class_name: "CS-5th",
        semester: "5th Semester",
      });
      console.log(` - Roll ${roll}: ${normalizedName}`);
    }
  }

  // Generate SQL
  let sql = `-- MIGRATION SCRIPT GENERATED FROM LEGACY DATA\n`;
  sql += `-- Insert default legacy subjects\n`;
  sql += `INSERT INTO public.subjects (name, code, class_name, semester) VALUES\n`;
  sql += `  ('English Literature', 'ENG101', 'CS-5th', '5th Semester'),\n`;
  sql += `  ('Hindi Language & Comm', 'HIN101', 'CS-5th', '5th Semester')\n`;
  sql += `ON CONFLICT (code) DO NOTHING;\n\n`;

  sql += `-- Insert legacy students\n`;
  sql += `INSERT INTO public.students (roll_number, full_name, class_name, semester) VALUES\n`;
  const studentSqlRows = students.map(
    (s) => `  ('${s.roll_number}', '${s.full_name}', '${s.class_name}', '${s.semester}')`
  );
  sql += studentSqlRows.join(",\n") + "\nON CONFLICT (roll_number, class_name) DO NOTHING;\n";

  const outputPath = path.resolve(__dirname, "../supabase/migrations/002_legacy_seed_migration.sql");
  fs.writeFileSync(outputPath, sql, "utf-8");
  console.log(`\nSuccessfully created migration SQL at:\n${outputPath}`);
}

migrateLegacyData().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
