import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function JobTypeSelection({ category, onBack, onSelectJob }) {
  
  const jobs = [
    { id: 'kurulum', name: 'Kurulum', sub: 'Yeni cihaz kurulumu', icon: 'add-circle-outline', active: true, color: '#10b981' },
    { id: 'sokme', name: 'Sökme', sub: 'Yakında', icon: 'remove-circle-outline', active: false, color: '#9ca3af' },
    { id: 'ariza', name: 'Arıza', sub: 'Yakında', icon: 'alert-circle-outline', active: false, color: '#9ca3af' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aktivite Türü Seçimi</Text>
      </View>

      {/* Üst Bilgi Paneli (Seçili Kategori) */}
      <View style={styles.categoryInfo}>
        <Text style={styles.infoLabel}>SEÇİLİ KATEGORİ</Text>
        <Text style={styles.categoryName}>{category.name.toUpperCase()}</Text>
      </View>

      <View style={styles.listTitleContainer}>
        <Text style={styles.listTitle}>TALEP TİPİNİ BELİRLEYİN</Text>
      </View>

      {/* İş Tipleri Listesi */}
      <View style={styles.jobList}>
        {jobs.map((job) => (
          <TouchableOpacity 
            key={job.id}
            style={[styles.jobItem, !job.active && styles.inactiveItem]}
            onPress={() => job.active ? onSelectJob(job) : Alert.alert('Bilgi', `${job.name} işlemi henüz MVP kapsamında değildir.`)}
          >
            <View style={styles.jobLeft}>
              <View style={[styles.iconBox, { backgroundColor: job.active ? '#f0fdf4' : '#f3f4f6' }]}>
                <Ionicons name={job.icon} size={24} color={job.color} />
              </View>
              <View>
                <Text style={[styles.jobName, !job.active && styles.inactiveText]}>{job.name.toUpperCase()}</Text>
                <Text style={styles.jobSub}>{job.sub.toUpperCase()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={job.active ? "#004a99" : "#ccc"} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  
  categoryInfo: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1 },
  categoryName: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic', marginTop: 2 },

  listTitleContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  listTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1.5 },

  jobItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  jobLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  jobName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  jobSub: { fontSize: 10, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  inactiveItem: { backgroundColor: '#fafafa' },
  inactiveText: { color: '#9ca3af' }
});