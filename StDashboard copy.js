import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, SafeAreaView, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StDashboard({ user, onLogout, onSelectCustomer }) {
  const [dealers, setDealers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [loadingDealers, setLoadingDealers] = useState(false); // Başlangıçta false yaptık
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDealerModal, setShowDealerModal] = useState(false);

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.toLocaleDateString('tr-TR', { weekday: 'short' });
    const month = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    return { day, month };
  };

  const { day, month } = getCurrentDate(); 

  // Otomatik yükleme kapalı, sadece butonla tetiklenecek
  useEffect(() => {
  }, []);

  const fetchDealers = async () => {
    setLoadingDealers(true);
    try {
      console.log("B/D Tablosu İndiriliyor...");
      const response = await fetch(`https://isletmem.online/asset/api/my-dealers?username=${user.username}`);
      const data = await response.json();
      console.log(`B/D'ler İndirildi: ${data.length}`);
      console.log(JSON.stringify(data, null, 2));
      setDealers(data);
      // Başarılı olduğunda kullanıcıya ufak bir bildirim verebiliriz
      if(data.length > 0) {
        Alert.alert('Başarılı', `${data.length} bayi güncellendi.`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Veriler sunucudan alınamadı.');
    } finally {
      setLoadingDealers(false);
    }
  };

  const loadCustomersByDealer = async (dealer) => {
    setSelectedDealer(dealer);
    setShowDealerModal(false);
    setLoadingCustomers(true);
    try {
      const response = await fetch(`https://isletmem.online/asset/api/my-customers?username=${user.username}&dealer_code=${dealer.dealer_code}`);
      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      Alert.alert('Hata', 'Müşteri listesi alınamadı');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = customers.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase()) || 
      item.customer_code.includes(text)
    );
    setFilteredCustomers(filtered);
  };

  const renderCustomer = ({ item }) => (
    <TouchableOpacity 
      style={styles.customerItem} 
      onPress={() => onSelectCustomer(item)}
    >
      <View style={styles.customerLeft}>
        <Text style={styles.sapCode}>SAP: {item.customer_code}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.customerName}>{item.name.toUpperCase()}</Text>
          <Ionicons name="home-outline" size={14} color="#004a99" style={{ marginLeft: 6 }} />
        </View>
        <Text style={styles.addressText}>{item.address || 'İLGİLİ KİŞİ BELİRTİLMEMİŞ'}</Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER - Sadeleşti */}
      <View style={styles.mayaHeader}>
        <View style={styles.headerTitleBadge}>
          <Text style={styles.headerTitleText}>{user.username}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDayName}>{day}</Text>
            <Text style={styles.dateText}>{month}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama Barı */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={{ marginLeft: 15 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Müşteri bul"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Bayi Seçici */}
      <View style={styles.dealerSection}>
        <TouchableOpacity style={styles.customSelect} onPress={() => setShowDealerModal(true)}>
          <Text style={[styles.selectText, !selectedDealer && { color: '#999' }]}>
            {selectedDealer ? `${selectedDealer.dealer_code} - ${selectedDealer.name}` : "Bayi seçmek için dokunun"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#004a99" />
        </TouchableOpacity>
      </View>

      {/* Liste Alanı ve Ortadaki SYNC Butonu */}
      {loadingCustomers ? (
        <View style={styles.centerMsg}>
          <ActivityIndicator size="large" color="#004a99" />
          <Text style={styles.italicMsg}>Müşteriler çekiliyor...</Text>
        </View>
      ) : filteredCustomers.length > 0 ? (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomer}
          keyExtractor={item => item.customer_code}
          style={styles.list}
        />
      ) : (
        <View style={styles.centerMsg}>
          <Ionicons name="cloud-offline-outline" size={60} color="#eee" />
          <Text style={styles.italicMsg}>
            {selectedDealer ? 'Bu bayiye ait müşteri bulunamadı.' : 'Henüz veri senkronize edilmedi.'}
          </Text>

          {/* ORTADAKİ SYNC BUTONU */}
          {!selectedDealer && (
            <TouchableOpacity 
              onPress={fetchDealers} 
              disabled={loadingDealers} 
              style={styles.centerSyncBtn}
            >
              {loadingDealers ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={styles.syncContent}>
                  <Ionicons name="cloud-download" size={20} color="white" />
                  <Text style={styles.syncText}>VERİLERİ EŞİTLE (SYNC)</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Seçim Modalı */}
      <Modal visible={showDealerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bayi Seçin</Text>
              <TouchableOpacity onPress={() => setShowDealerModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dealers}
              keyExtractor={item => item.dealer_code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dealerOption} onPress={() => loadCustomersByDealer(item)}>
                  <Text style={styles.dealerOptionText}>{item.dealer_code} - {item.name}</Text>
                  {selectedDealer?.dealer_code === item.dealer_code && (
                    <Ionicons name="checkmark-circle" size={20} color="#004a99" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{textAlign: 'center', color: '#999', marginTop: 20}}>
                  Önce "SYNC" butonu ile bayileri indirin.
                </Text>
              }
            />
            {/* MODAL EN ALTI: SYNC BUTONU */}
            <TouchableOpacity 
              style={styles.modalSyncBtn} 
              onPress={fetchDealers}
              disabled={loadingDealers}
            >
              {loadingDealers ? (
                <ActivityIndicator size="small" color="#004a99" />
              ) : (
                <View style={styles.syncContent}>
                  <Ionicons name="refresh-circle" size={22} color="#004a99" />
                  <Text style={styles.modalSyncText}>GÜNCELLE (SYNC)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  mayaHeader: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  headerTitleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerTitleText: { color: 'white', fontSize: 14, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', marginRight: 10, alignItems: 'center' },
  dateDayName: { color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: 10, marginRight: 4 },
  dateText: { color: 'white', fontSize: 12, fontWeight: '600' },
  logoutBtn: { padding: 5 },
  searchBar: { backgroundColor: '#f2f2f2', height: 50, borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: '100%', paddingHorizontal: 10, fontSize: 16, color: '#000' },
  dealerSection: { padding: 12, backgroundColor: '#f9fafb' },
  customSelect: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 },
  selectText: { fontSize: 14, fontWeight: '700', color: '#333' },
  list: { flex: 1 },
  customerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  customerLeft: { flex: 1 },
  sapCode: { fontSize: 11, color: '#999', fontWeight: 'bold', marginBottom: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  customerName: { fontSize: 15, fontWeight: 'bold', color: 'black' },
  addressText: { fontSize: 12, color: '#999', marginTop: 4, textTransform: 'uppercase' },
  centerMsg: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  italicMsg: { color: '#bbb', fontStyle: 'italic', fontSize: 14, marginTop: 10, textAlign: 'center' },
  centerSyncBtn: { marginTop: 20, backgroundColor: '#004a99', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 },
  syncContent: { flexDirection: 'row', alignItems: 'center' },
  syncText: { color: 'white', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#004a99' },
  dealerOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dealerOptionText: { fontSize: 15, color: '#333' },
  modalSyncBtn: { marginTop: 10, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', justifyContent: 'center',},
modalSyncText: { fontSize: 14, fontWeight: 'bold', color: '#004a99', marginLeft: 8}
});