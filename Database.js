import * as SQLite from 'expo-sqlite';

// Veritabanını açıyoruz
const db = SQLite.openDatabaseSync('assets.db');

export const initDB = async () => {
  try {
    // Sadece gerekli olan dealer tablosunu kuruyoruz
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS dealers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dealer_code TEXT UNIQUE,
        name TEXT,
        st_usernames TEXT
      );
    `);
    console.log("✅ Veritabanı ve Tablo Hazır");
  } catch (error) {
    console.error("❌ DB Başlatma Hatası:", error);
  }
};

// API'den gelen veriyi topluca kaydeden fonksiyon
export const saveDealersToLocal = async (dealers, loggedInUser) => {
  try {
    await db.runAsync('DELETE FROM dealers WHERE st_usernames = ?', [loggedInUser]);
    for (const dealer of dealers) {
      await db.runAsync(
        'INSERT OR REPLACE INTO dealers (dealer_code, name, st_usernames) VALUES (?, ?, ?)',
        [dealer.dealer_code, dealer.name, loggedInUser]
      );
    }
    console.log("${loggedInUser} 💾 Bayiler SQLite'a kaydedildi."); 
  } catch (error) {
    console.error("❌ Kayıt Hatası:", error);
  }
};

// SQLite'daki bayileri çeken fonksiyon
export const getLocalDealers = async (loggedInUser) => {
  try {
    return await db.getAllAsync('SELECT * FROM dealers WHERE st_usernames = ? ORDER BY name ASC', [loggedInUser]);
  } catch (error) {
    console.error("❌ Okuma Hatası:", error);
    return [];
  }
};