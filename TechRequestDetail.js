import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function TechRequestDetail({ request, onBack, onComplete }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;
  
  const handleBarCodeScanned = async ({ data }) => {
    if (!scanning) return;
    setScanning(false);
    completeInstallation(data);
  };

  // Kurulum Tamamlama Fonksiyonu
  const completeInstallation = async (barcode) => {
    setLoading(true);
    try {
      const response = await fetch('https://isletmem.online/asset/api/complete-install-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: barcode,
          request_no: request.request_no
        })
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("Başarılı", "Kurulum başarıyla tamamlandı!", [{ text: "Tamam", onPress: onComplete }]);
      } else {
        Alert.alert("Hata", result.message || "Bir sorun oluştu.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya erişilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // YENİ: İptal Etme Fonksiyonu
  const cancelInstallation = async () => {
    Alert.alert(
      "Emin misiniz?",
      "Bu talebi iptal etmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Evet, İptal Et", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch('https://isletmem.online/asset/api/cancel-install-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_no: request.request_no })
              });
              const result = await response.json();
              if (result.success) {
                Alert.alert("İptal Edildi", "Talep başarıyla iptal edildi.", [{ text: "Tamam", onPress: onComplete }]);
              } else {
                Alert.alert("Hata", "İptal işlemi başarısız oldu.");
              }
            } catch (e) {
              Alert.alert("Hata", "Sunucu bağlantı hatası.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (scanning) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["code128", "qr", "ean13"] }}
        />
        <View style={styles.overlay}>
          <Text style={styles.scanText}>Cihaz Barkodunu Odaklayın</Text>
          <View style={styles.scanFrame} />
          <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setScanning(false)}>
            <Text style={styles.cancelScanText}>İptal Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Talep Detayı</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.detailCard}>
          <View style={styles.cardTop}>
            <View style={styles.badgeRow}>
              <View style={styles.reqNoBadge}><Text style={styles.reqNoText}>{request.request_no}</Text></View>
              <View style={styles.statusBadge}><Text style={styles.statusText}>{request.status}</Text></View>
            </View>
            <Text style={styles.customerName}>{request.customer_name}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={14} color="#9ca3af" />
              <Text style={styles.locText}>{request.customer_code}</Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.sectionLabel}>KURULACAK CİHAZ</Text>
            <Text style={styles.deviceText}>{request.material_description}</Text>
          </View>
        </View>

        {/* AKSİYON BUTONLARI - Sadece PENDING ise gösterilir */}
        {request.status === 'PENDING' && (
          <View style={styles.actionArea}>
            
            {/* 1. Barkod Okut Butonu */}
            <TouchableOpacity 
              style={styles.scanBtn} 
              onPress={async () => {
                if (!permission.granted) {
                  const res = await requestPermission();
                  if (!res.granted) return;
                }
                setScanning(true);
              }}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Ionicons name="qr-code-outline" size={22} color="white" />
                  <Text style={styles.scanBtnText}>Barkod Okut</Text>
                </>
              )}
            </TouchableOpacity>

            {/* 2. Bluefind Tara Butonu */}
            <TouchableOpacity 
              style={[styles.actionBtn, styles.bluefindBtn]} 
              onPress={() => Alert.alert("Bilgi", "Bluefind özelliği yakında aktif edilecektir.")}
            >
              <Ionicons name="bluetooth" size={22} color="white" />
              <Text style={styles.actionBtnText}>Bluefind Tara</Text>
            </TouchableOpacity>

            {/* 3. İptal Et Butonu */}
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]} 
              onPress={cancelInstallation}
              disabled={loading}
            >
              <Ionicons name="close-circle-outline" size={22} color="#dc2626" />
              <Text style={[styles.actionBtnText, { color: '#dc2626' }]}>Talebi İptal Et</Text>
            </TouchableOpacity>

          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  backBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 12, marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  detailCard: { backgroundColor: 'white', borderRadius: 40, padding: 25, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  reqNoBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  reqNoText: { fontSize: 10, fontWeight: 'bold', color: '#1d4ed8' },
  statusBadge: { backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#b45309' },
  customerName: { fontSize: 24, fontWeight: '900', color: '#111827', lineHeight: 30 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  locText: { fontSize: 13, color: '#6b7280', marginLeft: 5, fontWeight: '500' },
  cardBottom: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 25 },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 5 },
  deviceText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },

  // Buton Alanı
  actionArea: { marginTop: 20, gap: 12 },
  scanBtn: { backgroundColor: '#2563eb', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  
  actionBtn: { height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  bluefindBtn: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  cancelBtn: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  // Scanner Styles
  scannerContainer: { flex: 1, backgroundColor: 'black' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#3b82f6', borderRadius: 30 },
  cancelScanBtn: { marginTop: 40, padding: 15 },
  cancelScanText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});