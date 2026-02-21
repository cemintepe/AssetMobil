import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  FlatList, ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InventorySelection({ customer, dealer, onBack, onSelectInventory }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      // PHP Controller'daki dealer_code parametresini gönderiyoruz
      const response = await fetch(`https://isletmem.online/asset/api/dealer-inventory?dealer_code=${dealer}`);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      Alert.alert('Hata', 'Depo stokları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.inventoryItem} 
      onPress={() => onSelectInventory(item)}
    >
      <View style={styles.itemLeft}>
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type_code}</Text>
          </View>
          <Text style={styles.stockCountText}>MEVCUT: {item.total} ADET</Text>
        </View>
        <Text style={styles.materialDesc}>{item.material_description.toUpperCase()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#004a99" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envanter Seçimi</Text>
      </View>

      {/* Müşteri ve Bayi Bilgi Paneli */}
      <View style={styles.infoBox}>
        <View style={styles.infoTop}>
          <Text style={styles.infoLabel}>MÜŞTERİ</Text>
          <Text style={styles.dealerLabel}>BAYİ: {dealer}</Text>
        </View>
        <Text style={styles.customerName}>{customer.name.toUpperCase()}</Text>
        <Text style={styles.sapCode}>SAP: {customer.customer_code}</Text>
      </View>

      <View style={styles.subTitleRow}>
        <Text style={styles.subTitle}>MEVCUT DEPO STOK</Text>
        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{inventory.length} ÜRÜN GRUBU</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#004a99" />
          <Text style={styles.loaderText}>Depo taranıyor...</Text>
        </View>
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={50} color="#eee" />
              <Text style={styles.emptyText}>Seçili bayinin deposu boş görünüyor.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  
  infoBox: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoLabel: { fontSize: 9, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1 },
  dealerLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic' },
  customerName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  sapCode: { fontSize: 12, color: '#6b7280' },

  subTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: 20 },
  subTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1 },
  countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#dbeafe' },
  countBadgeText: { fontSize: 10, color: '#1d4ed8', fontWeight: 'bold' },

  inventoryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemLeft: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  typeBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, borderWidth: 1, borderColor: '#dbeafe' },
  typeBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#2563eb' },
  stockCountText: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af' },
  materialDesc: { fontSize: 14, fontWeight: 'bold', color: '#111827' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#9ca3af', fontStyle: 'italic' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#bbb', fontStyle: 'italic', marginTop: 10 }
});