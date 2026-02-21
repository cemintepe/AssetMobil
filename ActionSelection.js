import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  FlatList, ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActionSelection({ customer, dealer, onBack, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // MVP: Şimdilik API'den çekiyoruz, bir sonraki adımda SQLite entegrasyonu yapacağız
      const response = await fetch('https://isletmem.online/asset/api/action-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      Alert.alert('Hata', 'Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }) => {
    // MVP: Sadece ID'si 1 olan (Soğutucu İşlemleri) aktif, diğerleri "Yakında"
    const isActive = item.id === 1;

    return (
      <TouchableOpacity 
        style={[styles.actionItem, !isActive && styles.inactiveItem]} 
        onPress={() => isActive ? onSelectCategory(item) : Alert.alert(item.name, "Bu akış yakında aktif edilecektir.")}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.iconBox, isActive ? styles.activeIconBox : styles.inactiveIconBox]}>
            <Ionicons name="clipboard-outline" size={24} color={isActive ? "#004a99" : "#999"} />
          </View>
          <View>
            <Text style={[styles.categoryName, !isActive && styles.inactiveText]}>
              {item.name.toUpperCase()}
            </Text>
            {!isActive && <Text style={styles.soonText}>YAKINDA</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isActive ? "#004a99" : "#ccc"} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Türü Seçimi</Text>
      </View>

      {/* Müşteri Bilgi Paneli */}
      <View style={styles.customerInfoBox}>
        <View style={styles.infoBadgeRow}>
          <View style={styles.dealerBadge}>
            <Text style={styles.dealerBadgeText}>{dealer}</Text>
          </View>
          <Text style={styles.sapCodeText}>SAP: {customer.customer_code}</Text>
        </View>
        <Text style={styles.customerNameText}>{customer.name}</Text>
      </View>

      <View style={styles.listTitleContainer}>
        <Text style={styles.listTitle}>KATEGORİ SEÇİNİZ</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
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
  
  customerInfoBox: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dealerBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  dealerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#4b5563' },
  sapCodeText: { fontSize: 11, color: '#6b7280', fontFamily: 'monospace' },
  customerNameText: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase' },

  listTitleContainer: { paddingHorizontal: 20, paddingTop: 20, pb: 10 },
  listTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1.5 },
  
  listContent: { paddingHorizontal: 0 },
  actionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  activeIconBox: { backgroundColor: '#eff6ff' },
  inactiveIconBox: { backgroundColor: '#f9fafb' },
  categoryName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  inactiveItem: { backgroundColor: '#fafafa' },
  inactiveText: { color: '#9ca3af' },
  soonText: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold', marginTop: 2 },
  centerMsg: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});