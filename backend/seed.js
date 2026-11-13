const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const vm = require("vm");
const db = require("./database");

// Helper to safely load INITIAL_MUSEUMS from frontend/src/data/mockData.js
async function loadSourceData() {
  const mockDataPath = path.resolve(__dirname, "../frontend/src/data/mockData.js");

  if (!fs.existsSync(mockDataPath)) {
    throw new Error(`mockData.js not found at: ${mockDataPath}`);
  }

  // Strategy 1: Dynamic import via file:// URL
  try {
    const fileUrl = pathToFileURL(mockDataPath).href;
    const importedModule = await import(fileUrl);
    if (importedModule && Array.isArray(importedModule.INITIAL_MUSEUMS)) {
      console.log("Successfully loaded mock data via dynamic ES module import.");
      return importedModule.INITIAL_MUSEUMS;
    }
  } catch (importErr) {
    console.warn("Direct ES module import was unavailable:", importErr.message);
  }

  // Strategy 2: Clean VM-based extraction without altering mockData.js
  try {
    const rawContent = fs.readFileSync(mockDataPath, "utf-8");
    // Convert 'export const XYZ = ' to 'var XYZ = ' so it executes in a sandbox
    const runnableCode = rawContent.replace(/export\s+const\s+/g, "var ");
    const sandboxContext = vm.createContext({});
    vm.runInContext(runnableCode, sandboxContext);

    if (sandboxContext.INITIAL_MUSEUMS && Array.isArray(sandboxContext.INITIAL_MUSEUMS)) {
      console.log("Successfully extracted mock data via clean VM parser fallback.");
      return sandboxContext.INITIAL_MUSEUMS;
    }
  } catch (fallbackErr) {
    console.error("Fallback parser error:", fallbackErr.message);
  }

  throw new Error("Failed to load INITIAL_MUSEUMS from frontend/src/data/mockData.js");
}

// Helper to parse numeric ID from 'mus-1' -> 1
function extractNumericId(id) {
  if (typeof id === "number") return id;
  const match = String(id).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Helper to parse openingHours into opening_time and closing_time
function parseHours(openingHours) {
  if (!openingHours || typeof openingHours !== "string") {
    return { opening_time: "09:00 AM", closing_time: "06:00 PM" };
  }
  const parts = openingHours.split("-");
  if (parts.length >= 2) {
    const opening = parts[0].trim();
    // Strip trailing parenthetical notes like (Wed & Fri till 09:45 PM)
    const closing = parts[1].split("(")[0].trim();
    return { opening_time: opening, closing_time: closing };
  }
  return { opening_time: openingHours.trim(), closing_time: "" };
}

async function seed() {
  console.log("Starting museum database seeding...");

  const rawMuseums = await loadSourceData();
  console.log(`Found ${rawMuseums.length} museums in mockData.js.`);

  // Prepared statement for museum upsert (prevents duplicate records on multiple runs)
  const upsertMuseum = db.prepare(`
    INSERT INTO museums (
      id,
      name,
      city,
      category,
      description,
      address,
      ticket_price,
      rating,
      image,
      opening_time,
      closing_time
    ) VALUES (
      @id,
      @name,
      @city,
      @category,
      @description,
      @address,
      @ticket_price,
      @rating,
      @image,
      @opening_time,
      @closing_time
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      city = excluded.city,
      category = excluded.category,
      description = excluded.description,
      address = excluded.address,
      ticket_price = excluded.ticket_price,
      rating = excluded.rating,
      image = excluded.image,
      opening_time = excluded.opening_time,
      closing_time = excluded.closing_time
  `);

  // Prepared statement for exhibitions upsert
  const upsertExhibition = db.prepare(`
    INSERT INTO exhibitions (
      id,
      museum_id,
      title,
      description,
      start_date,
      end_date,
      image
    ) VALUES (
      @id,
      @museum_id,
      @title,
      @description,
      @start_date,
      @end_date,
      @image
    )
    ON CONFLICT(id) DO UPDATE SET
      museum_id = excluded.museum_id,
      title = excluded.title,
      description = excluded.description,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      image = excluded.image
  `);

  // Run in a single transaction for atomicity and performance
  const runTransaction = db.transaction((museumList) => {
    let museumCount = 0;
    let exhibitionCount = 0;

    for (const museum of museumList) {
      const numericId = extractNumericId(museum.id);
      const { opening_time, closing_time } = parseHours(museum.openingHours);

      const ticketPrice =
        museum.ticket_price ??
        museum.basePrice ??
        museum.prices?.adult ??
        0;

      upsertMuseum.run({
        id: numericId,
        name: museum.name,
        city: museum.city,
        category: museum.category || "",
        description: museum.description || "",
        address: museum.address || "",
        ticket_price: ticketPrice,
        rating: museum.rating || 0,
        image: museum.image || "",
        opening_time,
        closing_time
      });
      museumCount++;

      // Seed exhibitions if present
      if (Array.isArray(museum.exhibitions)) {
        for (const exh of museum.exhibitions) {
          const exhId = extractNumericId(exh.id);
          const dates = (exh.dateRange || "").split("-");
          const startDate = dates[0] ? dates[0].trim() : "";
          const endDate = dates[1] ? dates[1].trim() : startDate;

          upsertExhibition.run({
            id: exhId,
            museum_id: numericId,
            title: exh.title || "",
            description: exh.description || "",
            start_date: startDate,
            end_date: endDate,
            image: exh.image || ""
          });
          exhibitionCount++;
        }
      }
    }

    return { museumCount, exhibitionCount };
  });

  const { museumCount, exhibitionCount } = runTransaction(rawMuseums);

  // Verification from database
  const totalMuseums = db.prepare("SELECT COUNT(*) AS count FROM museums").get().count;
  const totalExhibitions = db.prepare("SELECT COUNT(*) AS count FROM exhibitions").get().count;

  console.log(`\n========================================`);
  console.log(` Database Seeding Completed Successfully`);
  console.log(`========================================`);
  console.log(`Museums processed in this run:  ${museumCount}`);
  console.log(`Total museums in database:      ${totalMuseums}`);
  console.log(`Exhibitions seeded:             ${exhibitionCount}`);
  console.log(`Total exhibitions in database:  ${totalExhibitions}`);
  console.log(`========================================\n`);

  return { totalMuseums, totalExhibitions };
}

if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed with error:", err);
      process.exit(1);
    });
}

module.exports = { seed, loadSourceData };
