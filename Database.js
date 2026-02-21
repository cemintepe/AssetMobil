import * as SQLite from 'expo-sqlite';

// Veritabanını açıyoruz
const db = SQLite.openDatabaseSync('maya_assets.db');

export const initDB = async () => {
  try {
    // Sadece gerekli olan dealer tablosunu kuruyoruz
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS dealers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dealer_code TEXT UNIQUE,
        name TEXT
      );
    `);
    console.log("✅ Veritabanı ve Tablo Hazır");
  } catch (error) {
    console.error("❌ DB Başlatma Hatası:", error);
  }
};

// API'den gelen veriyi topluca kaydeden fonksiyon
export const saveDealersToLocal = async (dealers) => {
  try {
    for (const dealer of dealers) {
      await db.runAsync(
        'INSERT OR REPLACE INTO dealers (dealer_code, name) VALUES (?, ?)',
        [dealer.dealer_code, dealer.name]
      );
    }
    console.log("💾 Bayiler SQLite'a kaydedildi.");
  } catch (error) {
    console.error("❌ Kayıt Hatası:", error);
  }
};

// SQLite'daki bayileri çeken fonksiyon
export const getLocalDealers = async () => {
  try {
    const allRows = await db.getAllAsync('SELECT * FROM dealers ORDER BY name ASC');
    return allRows;
  } catch (error) {
    console.error("❌ Okuma Hatası:", error);
    return [];
  }
};