// Génère le jeu de données Coran LOCAL (hors-ligne) une fois pour toutes.
// Source : alquran.cloud (libre). Exécuter : `node scripts/generate-quran-data.mjs`
// Produit :
//   public/data/quran/surahs.json    → métadonnées des 114 sourates (navigation)
//   public/data/quran/uthmani.json   → texte arabe (uthmani) complet, par sourate
// Servis comme fichiers statiques → fonctionnent hors-ligne (cache Service Worker).
// Après génération, l'application n'a plus besoin d'internet pour lire le Coran.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "data", "quran");

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("→ Téléchargement de la liste des sourates…");
  const list = await getJson("https://api.alquran.cloud/v1/surah");
  const surahs = list.data.map((s) => ({
    number: s.number,
    name: s.name, // arabe
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));
  await writeFile(join(OUT, "surahs.json"), JSON.stringify(surahs));
  console.log(`  ✓ ${surahs.length} sourates → surahs.json`);

  console.log("→ Téléchargement du texte arabe complet (uthmani)…");
  const quran = await getJson("https://api.alquran.cloud/v1/quran/quran-uthmani");
  const uthmani = {};
  for (const s of quran.data.surahs) {
    uthmani[s.number] = s.ayahs.map((a) => ({ n: a.numberInSurah, text: a.text }));
  }
  await writeFile(join(OUT, "uthmani.json"), JSON.stringify(uthmani));
  const totalAyahs = Object.values(uthmani).reduce((t, a) => t + a.length, 0);
  console.log(`  ✓ ${totalAyahs} versets → uthmani.json`);

  console.log("✅ Données Coran locales générées dans app/data/quran/");
}

main().catch((e) => {
  console.error("Échec :", e.message);
  process.exit(1);
});
