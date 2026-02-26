import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Alert, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 

export default function VerificationEquipment({ customer, dealer, onBack }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // KRİTİK ÇÖZÜM: useRef anlık güncellenir, render beklemez.
  const isProcessing = useRef(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://isletmem.online/asset/api/verification/inventory/${customer.customer_code}`);
      const data = await response.json();
      if (data.status === 'success') {
        setInventory(data.inventory);
      }
    } catch (error) {
      Alert.alert('Hata', 'Envanter listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    // 1. KİLİT: Eğer bir işlem yapılıyorsa FONKSİYONDAN HEMEN ÇIK
    if (isProcessing.current) return;
    
    // Kapıyı hemen kilitle
    isProcessing.current = true;
    
    // Kamerayı anında kapat
    setScannerVisible(false);

    // Envanter kontrolü
    const item = inventory.find(i => i.barcode === data);
    
    if (!item) {
      // Hata mesajını göster
      Alert.alert(
        "Hatalı Ekipman", 
        `Barkod: ${data}\n\nBu ekipman bu noktaya ait değildir!`, 
        [{ 
          text: "Tamam", 
          onPress: () => {
            // SADECE TAMAM'A BASINCA KİLİDİ AÇ
            isProcessing.current = false;
          } 
        }],
        { cancelable: false } // Boşluğa basınca kapanmasın
      );
      return;
    }

    // Başarılı senaryo: API'ye gönder
    try {
      const response = await fetch('https://isletmem.online/asset/api/verification/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode_no: data,
          customer_code: customer.customer_code,
          user_code: 'ST001'
        })
      });
      
      const resData = await response.json();
      if (resData.status === 'success') {
        await fetchInventory();
      }
    } catch (error) {
      Alert.alert("Hata", "Sunucu hatası.");
    } finally {
      // İşlem bitince kilidi aç
      isProcessing.current = false;
    }
  };

  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("İzin Gerekli", "Kamera izni vermeniz gerekiyor.");
        return;
      }
    }
    isProcessing.current = false; // Açılışta kilidin açık olduğundan emin ol
    setScannerVisible(true);
  };

  const renderEquipment = ({ item }) => (
    <View style={[styles.equipmentCard, item.is_verified && styles.verifiedCard]}>
      <View style={styles.cardInfo}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.barcodeText}>{item.barcode}</Text>
          <View style={styles.materialBadge}>
            <Text style={styles.materialText}>{item.material_code}</Text>
          </View>
        </View>
        <Text style={styles.descriptionText} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.eqNoText}>EQ No: {item.equipment_no}</Text>
      </View>
      <View style={styles.statusIcon}>
        {item.is_verified ? (
          <Ionicons name="checkmark-circle" size={28} color="#10b981" />
        ) : (
          <View style={styles.unverifiedCircle} />
        )}
      </View>
    </View>
  );

  const verifiedCount = inventory.filter(i => i.is_verified).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envanter Doğrulama</Text>
      </View>

      <View style={styles.customerInfoBox}>
        <View style={styles.infoBadgeRow}>
          <View style={styles.dealerBadge}><Text style={styles.dealerBadgeText}>{dealer}</Text></View>
          <Text style={styles.sapCodeText}>SAP: {customer.customer_code}</Text>
        </View>
        <Text style={styles.customerNameText}>{customer.name}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.scanButton} onPress={handleOpenScanner}>
          <Ionicons name="barcode-outline" size={24} color="white" />
          <Text style={styles.scanButtonText}>BARKOD OKUT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blueFindButton} onPress={() => Alert.alert('BlueFind', 'Yakında aktif edilecek.')}>
          <Ionicons name="bluetooth" size={24} color="#0284c7" />
          <Text style={styles.blueFindText}>BLUEFIND TARA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>NOKTA ENVANTERİ</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{verifiedCount}/{inventory.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderEquipment}
          keyExtractor={item => item.barcode}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={scannerVisible} animationType="fade">
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned} // Kilidi içeride ref ile yönetiyoruz
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "code128"],
            }}
          />
          <View style={styles.overlay}>
             <View style={styles.unfocusedContainer}></View>
             <View style={styles.focusedContainer}>
                <View style={styles.focusedLine} />
             </View>
             <View style={styles.unfocusedContainer}></View>
          </View>
          <TouchableOpacity 
            style={styles.closeCameraButton} 
            onPress={() => setScannerVisible(false)}
          >
            <Text style={styles.closeCameraText}>İPTAL</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  customerInfoBox: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dealerBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  dealerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#4b5563' },
  sapCodeText: { fontSize: 11, color: '#6b7280', fontFamily: 'monospace' },
  customerNameText: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', padding: 15, backgroundColor: 'white', gap: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  scanButton: { flex: 1, backgroundColor: '#004a99', borderRadius: 12, padding: 15, alignItems: 'center', justifyContent: 'center' },
  scanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 11, marginTop: 5 },
  blueFindButton: { flex: 1, backgroundColor: '#e0f2fe', borderRadius: 12, padding: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bae6fd' },
  blueFindText: { color: '#0369a1', fontWeight: 'bold', fontSize: 11, marginTop: 5 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15 },
  listTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1.2 },
  countBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 11, fontWeight: 'bold', color: '#1d4ed8' },
  listContent: { padding: 10 },
  equipmentCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#e5e7eb' },
  verifiedCard: { borderLeftColor: '#10b981', backgroundColor: '#f0fdf4' },
  cardInfo: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  barcodeText: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginRight: 8 },
  materialBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  materialText: { fontSize: 9, color: '#6b7280', fontFamily: 'monospace' },
  descriptionText: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 2 },
  eqNoText: { fontSize: 11, color: '#6b7280' },
  statusIcon: { marginLeft: 10 },
  unverifiedCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#f3f4f6' },
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  closeCameraButton: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  closeCameraText: { color: 'white', fontWeight: 'bold' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  focusedContainer: { width: 250, height: 150, borderWidth: 2, borderColor: '#004a99' },
  unfocusedContainer: { flex: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.6)' },
  focusedLine: { width: '100%', height: 1, backgroundColor: 'red', position: 'absolute', top: '50%' }
});