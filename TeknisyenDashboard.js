import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  TextInput, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TechDashboard({ user, onLogout, onSelectRequest }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING'); // PENDING, COMPLETED vs.
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { label: 'Bekleyenler', value: 'PENDING' },
    { label: 'İptal Edilenler', value: 'CANCELLED' },
    { label: 'Tamamlananlar', value: 'COMPLETED' },

  ];

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://isletmem.online/asset/api/my-install-requests?status=${status}`);
      const data = await response.json();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error("Yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = requests.filter(req => 
      req.request_no.toLowerCase().includes(text.toLowerCase()) || 
      (req.customer_name && req.customer_name.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredRequests(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.requestCard} 
      onPress={() => onSelectRequest(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.reqBadge}>
          <Text style={styles.reqBadgeText}>{item.request_no}</Text>
        </View>
        <Text style={styles.dateText}>{item.created_at}</Text>
      </View>

      <Text style={styles.customerName}>{item.customer_name || 'İsimsiz Müşteri'}</Text>
      <Text style={styles.materialDesc}>{item.material_description}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.statusLabel}>DURUM: {item.status}</Text>
        <View style={styles.arrowBox}>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Aktivitelerim</Text>
          <Text style={styles.techCode}>Teknisyen: {user.username}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* Durum Seçimi (PWA Select Karşılığı) */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>TALEP DURUMU</Text>
        <View style={styles.statusRow}>
          {statusOptions.map((opt) => (
            <TouchableOpacity 
              key={opt.value}
              style={[styles.statusBtn, status === opt.value && styles.statusBtnActive]}
              onPress={() => setStatus(opt.value)}
            >
              <Text style={[styles.statusBtnText, status === opt.value && styles.statusBtnTextActive, { fontSize: 11 }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Arama Barı */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Talep no veya müşteri ara..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 40 }} />
      ) : (
        <FlatList 
          data={filteredRequests}
          renderItem={renderItem}
          keyExtractor={item => item.request_no}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>İş emri bulunamadı.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  techCode: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  logoutBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 12 },

  filterSection: { padding: 20, paddingBottom: 10 },
  filterLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 10, letterSpacing: 1 },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 4, backgroundColor: 'white', borderRadius: 15, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#004a99', borderColor: '#004a99' },
  statusBtnText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  statusBtnTextActive: { color: 'white' },

  searchSection: { paddingHorizontal: 20, marginBottom: 10 },
  searchIcon: { position: 'absolute', left: 35, top: 15, zIndex: 1 },
  searchInput: { backgroundColor: 'white', padding: 15, paddingLeft: 45, borderRadius: 15, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 14 },

  listContainer: { padding: 20 },
  requestCard: { backgroundColor: 'white', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reqBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  reqBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#1d4ed8' },
  dateText: { fontSize: 10, color: '#9ca3af' },
  customerName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  materialDesc: { fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  cardFooter: { marginTop: 15, pt: 15, borderTopWidth: 1, borderTopColor: '#f9fafb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 9, fontWeight: 'bold', color: '#d1d5db', letterSpacing: 1 },
  arrowBox: { backgroundColor: '#2563eb', padding: 6, borderRadius: 10 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontStyle: 'italic' }
});