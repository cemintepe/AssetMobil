import * as SQLite from 'expo-sqlite';

// Veritabanını açıyoruz
const db = SQLite.openDatabaseSync('assets_v1.db');

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
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_code TEXT UNIQUE,
        dealer_code TEXT,
        st_username TEXT,
        region_code TEXT,
        name TEXT,
        address TEXT,
        updated_at TEXT
      );
    `);
    console.log("✅ B/D ve Müşteri Veritabanı ve Tablo Hazır");
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

// Müşterileri topluca kaydeden fonksiyon
export const saveCustomersToLocal = async (customers, loggedInUser) => {
  try {
    // Bu kullanıcıya ait tüm müşterileri silip tazeliyoruz
    await db.runAsync('DELETE FROM customers WHERE st_username = ?', [loggedInUser]);
    
    for (const cust of customers) {
      await db.runAsync(
        `INSERT OR REPLACE INTO customers 
        (customer_code, dealer_code, st_username, region_code, name, address, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cust.customer_code, cust.dealer_code, cust.st_username, cust.region_code, cust.name, cust.address, cust.updated_at]
      );
    }
    console.log(`✅ ${loggedInUser} için toplam ${customers.length} müşteri SQLite'a yüklendi`);
  } catch (error) {
    console.error("❌ Müşteri Kayıt Hatası:", error);
  }
};

// Belirli bir bayiye ait müşterileri getiren fonksiyon
export const getLocalCustomersByDealer = async (dealerCode, loggedInUser) => {
  try {
    return await db.getAllAsync(
      'SELECT * FROM customers WHERE dealer_code = ? AND st_username = ? ORDER BY name ASC', 
      [dealerCode, loggedInUser]
    );
    return rows;
  } catch (error) {
    console.error("❌ Müşteri Okuma Hatası:", error);
    return [];
  }
};