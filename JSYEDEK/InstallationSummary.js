import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  TextInput, Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InstallationSummary({ customer, category, jobType, inventory, user, onBack, onComplete }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const submitRequest = async () => {
    setLoading(true);
    const payload = {
      customer_code: customer.customer_code,
      dealer_code: customer.dealer_code, // Prop'tan gelen bayi kodu
      type_code: inventory.type_code,
      material_description: inventory.material_description,
      note: note,
      username: user.username
    };

    try {
      const response = await fetch('https://isletmem.online/asset/api/create-install-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setSuccessData(result.request_no);
      } else {
        Alert.alert('Hata', result.message || 'Talep oluşturulamadı.');
      }
    } catch (e) {
      Alert.alert('Bağlantı Hatası', 'Sistemle iletişim kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  // BAŞARI EKRANI (Success View)
  if (successData) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark-sharp" size={60} color="#22c55e" />
        </View>
        <Text style={styles.successTitle}>TALEP OLUŞTURULDU</Text>
        <Text style={styles.successSub}>Kurulum talebi başarıyla sistemine işlendi.</Text>
        
        <View style={styles.reqNoCard}>
          <Text style={styles.reqNoLabel}>KAYIT NUMARASI</Text>
          <Text style={styles.reqNoValue}>{successData}</Text>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={onComplete}>
          <Text style={styles.homeBtnText}>Müşterilerim</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Onayı</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          {/* Mavi Kart Kısmı */}
          <View style={styles.cardTop}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>KURULUM NOKTASI</Text>
                <Text style={styles.cardCustomerName}>{customer.name.toUpperCase()}</Text>
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{customer.customer_code}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View>
              <Text style={styles.cardLabel}>TALEP EDİLEN EKİPMAN</Text>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceName}>{inventory.material_description.toUpperCase()}</Text>
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{inventory.type_code}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bilgi Satırları */}
          <View style={styles.cardBottom}>
            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.infoLabel}>İŞLEM TİPİ</Text>
                <View style={styles.iconRow}>
                  <Ionicons name="construct-outline" size={14} color="#2563eb" />
                  <Text style={styles.infoValue}>{jobType.name.toUpperCase()}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.infoLabel}>KAYNAK</Text>
                <View style={styles.iconRow}>
                  <Ionicons name="business-outline" size={14} color="#1e40af" />
                  <Text style={styles.infoValue}>BAYİ DEPO</Text>
                </View>
              </View>
            </View>

            {/* Not Alanı */}
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>İŞLEM NOTU (OPSİYONEL)</Text>
              <TextInput 
                style={styles.noteInput}
                placeholder="Teknisyene iletmek istediğiniz notlar..."
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={submitRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>TALEBİ ONAYLA</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerInfo}>TALEBİ ONAYLADIĞINIZDA SİSTEMDE OTOMATİK İŞ EMRİ AÇILACAKTIR.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  
  content: { padding: 16 },
  summaryCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 },
  cardTop: { backgroundColor: '#1e3a8a', padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 4 },
  cardCustomerName: { fontSize: 18, fontWeight: 'bold', color: 'white', flex: 1, marginRight: 10 },
  cardBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cardBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceName: { color: 'white', fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 10 },
  typeTag: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeTagText: { color: 'white', fontSize: 11, fontWeight: 'bold' },

  cardBottom: { padding: 20 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 5 },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginLeft: 5 },

  noteSection: { paddingTop: 10 },
  noteLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' },
  noteInput: { backgroundColor: '#fffbeb', borderOutline: 'none', borderBottomWidth: 1, borderBottomColor: '#fde68a', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', color: '#111827' },

  submitBtn: { backgroundColor: '#2563eb', flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  footerInfo: { textAlign: 'center', fontSize: 10, color: '#9ca3af', fontWeight: '600', marginTop: 15, paddingHorizontal: 20 },

  // Success Styles
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWeight: 2, borderColor: '#dcfce7' },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#111827', fontStyle: 'italic' },
  successSub: { textAlign: 'center', color: '#9ca3af', marginTop: 10, marginBottom: 40, fontSize: 14 },
  reqNoCard: { backgroundColor: '#f9fafb', width: '100%', padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#f3f4f6' },
  reqNoLabel: { fontSize: 10, color: '#2563eb', fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  reqNoValue: { fontSize: 36, fontWeight: '900', color: '#1e3a8a', letterSpacing: 2 },
  homeBtn: { backgroundColor: '#2563eb', width: '100%', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});