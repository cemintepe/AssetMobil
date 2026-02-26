import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// YENİ DOSYALAR
import StDashboard from './StDashboard';
import TeknisyenDashboard from './TeknisyenDashboard';
import ActionSelection from './ActionSelection';
import JobTypeSelection from './JobTypeSelection';
import InventorySelection from './InventorySelection';
import InstallationSummary from './InstallationSummary';
import TechRequestDetail from './TechRequestDetail';
import VerificationEquipment from './VerificationEquipment'; 

// DİL SÖZLÜĞÜ
const translations = {
  TR: {
    username: "Kullanıcı adı",
    password: "Şifre",
    login: "Giriş Yap",
    forgot: "Şifremi Unuttum",
    agreement: "Kullanıcı Sözleşmesi",
    privacy: "Gizlilik Politikası",
    error: "Hata",
    fillAll: "Lütfen tüm alanları doldurun.",
    loading: "Bağlanıyor..."
  },
  EN: {
    username: "Username",
    password: "Password",
    login: "Login",
    forgot: "Forgot Password",
    agreement: "User Agreement",
    privacy: "Privacy Policy",
    error: "Error",
    fillAll: "Please fill in all fields.",
    loading: "Connecting..."
  },
  RU: {
    username: "Имя пользователя",
    password: "Пароль",
    login: "Войти",
    forgot: "Забыли пароль?",
    agreement: "Пользовательское соглашение",
    privacy: "Политика конфиденциальности",
    error: "Ошибка",
    fillAll: "Пожалуйста, заполните все поля.",
    loading: "Соединение..."
  },
  RO: {
    username: "Nume de utilizator",
    password: "Parolă",
    login: "Autentificare",
    forgot: "Ați uitat parola?",
    agreement: "Acordul utilizatorului",
    privacy: "Politica de confidențialitate",
    error: "Eroare",
    fillAll: "Vă rugăm să completați toate câmpurile.",
    loading: "Conectare..."
  }
};

export default function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Dil Durumları
  const [selectedLang, setSelectedLang] = useState('TR');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const languages = ['TR', 'EN', 'RU', 'RO'];

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(translations[selectedLang].error, translations[selectedLang].fillAll);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('https://isletmem.online/asset/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data);
        setRole(data.role);
      } else {
        Alert.alert(translations[selectedLang].error, data.message);
      }
    } catch (error) {
      Alert.alert(translations[selectedLang].error, "Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setRole(null);
    setUser(null);
  };

  const handleCreateInstallRequest = async (inventoryItem, note = '') => {
    const payload = {
      customer_code: selectedCustomer.customer_code,
      dealer_code: selectedCustomer.dealer_code || selectedCustomer.dealer_name || 'BAYİ',
      type_code: selectedJobType?.id || selectedJobType?.name || 'kurulum',
      material_description: inventoryItem.material_description,
      note: note,
      username: user?.username || ''
    };

    Alert.alert(
      'Talebi Onayla',
      `Müşteri: ${payload.customer_code}\nEkipman: ${payload.material_description}\nİş: ${payload.type_code}\nOnaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Onayla', onPress: async () => {
          try {
            const res = await fetch('https://isletmem.online/asset/api/create-install-request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
              Alert.alert('Başarılı', `Talep oluşturuldu: ${data.request_no}`);
              // reset flow back to dashboard
              setSelectedInventory(null);
              setSelectedJobType(null);
              setSelectedCategory(null);
              setSelectedCustomer(null);
            } else {
              Alert.alert('Hata', data.message || 'Talep oluşturulamadı');
            }
          } catch (e) {
            Alert.alert('Hata', 'Bağlantı hatası: ' + (e.message || ''));
          }
        } }
      ]
    );
  };

if (role === 'ST') {
  // Öncelik: seçili iş türü -> seçili kategori -> seçili müşteri -> dashboard

  if (selectedCategory && selectedCategory.id === 5) {
      return (
        <VerificationEquipment 
          customer={selectedCustomer}
          dealer={selectedCustomer.dealer_name || selectedCustomer.dealer_code || 'BAYİ'}
          onBack={() => setSelectedCategory(null)} 
        />
      );
    }


  if (selectedJobType) {
      if (selectedInventory) {
        return (
          <InstallationSummary
            customer={selectedCustomer}
            category={selectedCategory}
            jobType={selectedJobType}
            inventory={selectedInventory}
            user={user}
            onBack={() => setSelectedInventory(null)}
            onComplete={() => {
              setSelectedInventory(null);
              setSelectedJobType(null);
              setSelectedCategory(null);
              setSelectedCustomer(null);
            }}
          />
        );
      }

      return (
        <InventorySelection 
          customer={selectedCustomer}
          dealer={selectedCustomer.dealer_code}
          onBack={() => setSelectedJobType(null)} 
          onSelectInventory={(item) => setSelectedInventory(item)}
        />
      );
    }

  if (selectedCategory) {
    return (
      <JobTypeSelection 
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)} 
        onSelectJob={(job) => setSelectedJobType(job)}
      />
    );
  }

  if (selectedCustomer) {
    return (
      <ActionSelection 
        customer={selectedCustomer} 
        dealer={selectedCustomer.dealer_name || selectedCustomer.dealer_code || 'BAYİ'}
        onBack={() => setSelectedCustomer(null)} 
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />
    );

  if (selectedInventory) {
      return (
        <InstallationSummary 
          customer={selectedCustomer}
          category={selectedCategory}
          jobType={selectedJobType}
          inventory={selectedInventory}
          user={user}
          onBack={() => setSelectedInventory(null)}
          onComplete={() => {
            // İşlem bitince tüm seçimleri sıfırla ve Dashboard'a dön
            setSelectedInventory(null);
            setSelectedJobType(null);
            setSelectedCategory(null);
            setSelectedCustomer(null);
          }}
        />
      );
  }
}

return (
    <StDashboard 
      user={user} 
      onLogout={handleLogout} 
      onSelectCustomer={(item) => setSelectedCustomer(item)} 
    />
  );
}




if (role === 'T') {
  // Eğer detay seçildiyse Detay ekranını göster
  if (selectedRequest) {
    return (
      <TechRequestDetail 
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        onComplete={() => {
          setSelectedRequest(null);
          // Burada gerekirse bir yenileme fonksiyonu tetiklenebilir
        }}
      />
    );
  }

  // Hiçbir şey seçilmediyse Dashboard'u göster (onSelectRequest PROPUNU UNUTMA)
  return (
    <TeknisyenDashboard 
      user={user} 
      onLogout={handleLogout} 
      onSelectRequest={(item) => setSelectedRequest(item)} 
    />
  );
}


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.blueBackground}>
        
        {/* DİL SEÇİM MENÜSÜ */}
        <View style={styles.langWrapper}>
          <TouchableOpacity 
            style={styles.langButton} 
            onPress={() => setShowLangMenu(!showLangMenu)}
          >
            <Text style={styles.langText}>{selectedLang}</Text>
          </TouchableOpacity>

          {showLangMenu && (
            <View style={styles.langMenu}>
              {languages.map((lang, index) => (
                <TouchableOpacity 
                  key={lang} 
                  style={[
                    styles.langMenuItem, 
                    index === languages.length - 1 && { borderBottomWidth: 0 } 
                  ]}
                  onPress={() => {
                    setSelectedLang(lang);
                    setShowLangMenu(false);
                  }}
                >
                  <Text style={styles.langMenuText}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.whiteCard}>
          {/* LOGO VE GÖLGE */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>ASSET</Text>
          </View>

          <View style={styles.form}>
            {/* KULLANICI ADI */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#999" />
              <TextInput 
                style={styles.input} 
                placeholder={translations[selectedLang].username}
                placeholderTextColor="#999"
                value={username} 
                onChangeText={setUsername} 
                autoCapitalize="none" 
              />
            </View>

            {/* ŞİFRE */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" />
              <TextInput 
                style={styles.input} 
                placeholder={translations[selectedLang].password}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword} 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#999" />
              </TouchableOpacity>
            </View>

            {/* GİRİŞ BUTONU */}
            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{translations[selectedLang].login}</Text>
              )}
            </TouchableOpacity>
            
            {/* ŞİFREMİ UNUTTUM */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer} 
              onPress={() => Alert.alert(selectedLang, "Şifremi Unuttum Sayfasına yönlendirileceksiniz.")}
            >
              <Text style={styles.forgotPasswordText}>{translations[selectedLang].forgot}</Text>
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.linkText}>{translations[selectedLang].agreement}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.linkText}>{translations[selectedLang].privacy}</Text>
            </View>
            <View style={styles.version}>
              <Text style={styles.linkText}>V 1.0.0</Text>
            </View>            
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blueBackground: { flex: 1, backgroundColor: '#004a8d', justifyContent: 'center', alignItems: 'center', padding: 25 },
  whiteCard: { backgroundColor: 'white', width: '100%', borderRadius: 35, padding: 25, paddingTop: 60, alignItems: 'center', elevation: 8, overflow: 'visible' },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', position: 'absolute', top: -50, justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, zIndex: 9999 },
  logoText: { color: '#004a8d', fontWeight: 'bold', fontSize: 20 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 25, paddingHorizontal: 15, height: 50, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  button: { backgroundColor: '#3498db', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  version: { flexDirection: 'row', marginTop: 30, justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', marginTop: 30, justifyContent: 'center', alignItems: 'center' },
  linkText: { color: '#3498db', fontSize: 12 },
  divider: { marginHorizontal: 8, color: '#eee' },
  forgotPasswordContainer: { marginTop: 15, alignItems: 'center' },
  forgotPasswordText: { color: '#3498db', fontSize: 14, textDecorationLine: 'underline' },
  langWrapper: { position: 'absolute', top: 50, right: 25, zIndex: 10000, alignItems: 'flex-end' },
  langButton: { backgroundColor: 'rgba(255,255,255,0.2)', width: 50, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  langText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  langMenu: { backgroundColor: 'white', borderRadius: 10, marginTop: 5, elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, minWidth: 60 },
  langMenuItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  langMenuText: { fontWeight: 'bold', color: '#004a8d', fontSize: 13 }
});