# Songle 🎵

Wordle'dan ilham alınan müzik tahmin oyunu. Oyuncular şarkı kliplerini dinleyerek şarkı adını tahmin etmeye çalışır. Vanilla JavaScript, HTML ve CSS ile geliştirilmiştir.

## 🎮 Hakkında

Songle, oyuncuları kısa ses kliplerinden şarkıları tanımlamaya zorlayan interaktif web tabanlı bir müzik tahmin oyunudur. Oyun, Türkçe ve yabancı şarkıların yanı sıra dizi ve film müzikleri de dahil olmak üzere çeşitli müzik kategorileri içerir.

**"Şarkıyı tahmin et. Atmosferi hisset."**

## ✨ Özellikler

### 🎵 Oyun Özellikleri

- **Dinamik Kategoriler**: Admin paneli üzerinden tamamen özelleştirilebilir kategoriler ve alt kategoriler
- **Oyun Başına 20 Soru**: Her oyun genişletilmiş oynanış için 20 sorudan oluşur
- **30 Saniyelik Zamanlayıcı**: Her tur için ek zorluk için zaman sınırı
- **Albüm Kapağı İpuçları**: Giderek netleşen albüm sanat eseri ile görsel ipuçları
- **Akıllı Cevap Eşleştirme**: %75 benzerlik eşiği ile şarkı başlıkları için gelişmiş bulanık string eşleştirme
- **Puan Takibi**: Kalan zamana dayalı gerçek zamanlı puan hesaplama
- **Pas Özelliği**: Tab tuşu veya pas butonu ile zor soruları atlama
- **Detaylı Sonuçlar**: Kapsamlı oyun istatistikleri ve soru analizi
- **Ses Kontrolü**: localStorage ile kalıcı ses ayarları
- **Mobil Optimizasyon**: Dokunmatik kontroller ve duyarlı tasarım

### 🎨 Kullanıcı Arayüzü

- **Modern Tasarım**: Yumuşak animasyonlar ve geçişlerle temiz, neumorfik UI
- **Duyarlı Düzen**: Masaüstü, tablet ve mobil cihazlarda mükemmel çalışır
- **Türkçe Dil Desteği**: Uygun Türkçe karakter desteği ile tamamen yerelleştirilmiş arayüz
- **Müzik Görselleştirici**: Oynatma sırasında ilerleme çubuğu ile animasyonlu müzik notası
- **Dinamik Kategori Seçimi**: Veritabanından gerçek zamanlı kategori yükleme
- **Tema Desteği**: Otomatik geçiş ile Açık ve Koyu mod
- **Erişilebilirlik**: Klavye navigasyon desteği (Enter, Tab, Escape tuşları)

### 🔧 Teknik Özellikler

- **Vanilla JavaScript**: Framework bağımlılığı yok, saf ES6+ modülleri
- **RESTful API**: Tüm oyun verileri için tam backend entegrasyonu
- **Modüler Mimari**: Temiz, sürdürülebilir kod yapısı
- **Gerçek Zamanlı Güncellemeler**: Her 10 saniyede bir otomatik kategori yenileme
- **Ses Yönetimi**: Hata kurtarma ile MP3 dosya işleme
- **Görsel Yönetimi**: Bulanık efektler ile albüm kapağı depolama
- **Deezer Entegrasyonu**: Deezer API'den doğrudan şarkı arama ve indirme
- **Kapsamlı Loglama**: Tüm admin işlemlerinin tam denetim izi
- **Kullanıcı Yönetimi**: Şifre güvenliği ile rol tabanlı erişim kontrolü

### 🛡️ Admin Panel Özellikleri

- **Tam Şarkı Yönetimi**: Ses ve kapak dosyaları ile şarkı ekleme, düzenleme, silme
- **Dinamik Kategori Yönetimi**: Kategoriler ve alt kategoriler oluşturma ve yönetme
- **Gelişmiş Kullanıcı Yönetimi**: Rol tabanlı izinler ile kullanıcı ekleme, düzenleme, silme
- **Kapsamlı İşlem Kayıtları**: Filtreleme ve sayfalama ile tam denetim izi
- **Dosya Yönetimi**: MP3 dosyaları ve albüm kapaklarının güvenli yükleme ve yönetimi
- **Deezer Entegrasyonu**: Doğrudan Deezer'dan şarkı arama ve indirme
- **Toplu İşlemler**: Birden fazla şarkı veya işlem kaydını seçme ve silme
- **Ayarlar Yönetimi**: Tema, sayfalama ve bildirim tercihleri
- **Sistem İzleme**: Gerçek zamanlı istatistikler ve sistem bilgileri
- **Duyarlı Tasarım**: Modern UI ile tüm cihazlarda sorunsuz çalışır

## 🚀 Kurulum

### Gereksinimler

- XAMPP (veya PHP ve MySQL ile benzer yerel sunucu)
- JavaScript etkin web tarayıcısı
- MySQL desteği ile PHP 7.4+

### Kurulum Adımları

1. **Depoyu klonlayın**

   ```bash
   git clone https://github.com/yourusername/songle.git
   cd songle
   ```

2. **Backend'i kurun**

   - Projeyi XAMPP `htdocs` klasörüne yerleştirin
   - Backend API'nin `https://songle.app/songle-backend/api` adresinde çalıştığından emin olun
   - Veritabanını oluşturmak için `songle-backend/songle.sql` dosyasını import edin
   - Veritabanı bağlantınızı `songle-backend/config/database.php` dosyasında yapılandırın

3. **Müzik dosyalarını ekleyin**

   - MP3 dosyalarını `songs/` dizinine yerleştirin
   - Albüm kapak görsellerini `kapaklar/` dizinine ekleyin
   - Admin paneli üzerinden veritabanını şarkı bilgileriyle güncelleyin

4. **Sunucuyu başlatın**
   - XAMPP Apache ve MySQL servislerini başlatın
   - Tarayıcınızda `https://songle.app` adresine gidin
   - Admin paneline `https://songle.app/admin/` adresinden erişin

## 🎯 Nasıl Oynanır

1. **Oyunu Başlatın**

   - "Oynamaya Başla" butonuna tıklayın
   - Dropdown'dan bir müzik kategorisi seçin
   - Alt kategori seçin (Rock, Pop, Hip Hop, Karışık, vb.)

2. **Oyunu Oynayın**

   - 30 saniyelik ses klibini dinleyin
   - Tahmininizi giriş alanına yazın
   - Göndermek için Enter'a basın veya geçmek için Tab'a basın
   - Şarkıyı tekrar dinlemek için tekrar oynat butonunu kullanın

3. **Puan Kazanın**

   - Doğru cevaplar kalan zamana göre puan kazandırır
   - 30 saniye = 30 puan, 1 saniye = 1 puan
   - Zor soruları geçerek oynamaya devam edin

4. **Oyunu Tamamlayın**
   - 20 soru boyunca oynayın
   - Detaylı sonuçları ve istatistikleri görüntüleyin
   - Hangi şarkıları doğru, yanlış veya geçtiğinizi görün

## 🔧 Yapılandırma

### API Yapılandırması

Oyun şarkı yönetimi için bir backend API'ye bağlanır. `apiService.js` dosyasındaki API base URL'ini güncelleyin:

```javascript
const API_BASE_URL = 'https://songle.app/songle-backend/api'
```

### Veritabanı Yapılandırması

`songle-backend/config/database.php` dosyasındaki veritabanı ayarlarını güncelleyin:

```php
$host = 'localhost'
$dbname = 'songle'
$username = 'root'
$password = ''
```

### Kategoriler

Oyun admin paneli üzerinden yönetilebilen dinamik kategorileri destekler:

- **Türkçe**: Rock, Pop, Hip Hop, Karışık ve özel alt kategoriler
- **Yabancı**: Rock, Pop, Hip Hop, Karışık ve özel alt kategoriler
- **Dizi**: Türkçe, Yabancı ve özel alt kategoriler
- **Film**: Türkçe, Yabancı ve özel alt kategoriler

Kategoriler veritabanından dinamik olarak yüklenir ve admin paneli üzerinden özelleştirilebilir.

## 🛠️ Geliştirme

### Proje Yapısı

```
songle/
├── admin/                 # Admin panel dosyaları
│   ├── modules/          # Modüler JavaScript dosyaları
│   ├── api-panel.html    # Ana admin arayüzü
│   └── panel-style.css   # Admin panel stilleri
├── songle-backend/        # Backend API
│   ├── api/              # API endpoint'leri
│   ├── config/           # Yapılandırma dosyaları
│   └── songle.sql        # Veritabanı şeması
├── songs/                 # MP3 ses dosyaları
├── kapaklar/              # Albüm kapak görselleri
├── script.js              # Ana oyun mantığı
├── apiService.js          # API iletişimi
└── style.css              # Oyun stilleri
```

### Yeni Şarkı Ekleme

1. MP3 dosyalarını `songs/` dizinine yükleyin
2. Albüm kapak görsellerini `kapaklar/` dizinine ekleyin
3. Admin paneli kullanarak şarkı meta verilerini veritabanına ekleyin
4. Veya Deezer entegrasyonunu kullanarak şarkı arayın ve indirin

### Admin Panel

Admin paneline `https://songle.app/admin/` adresinden erişerek:

- Ses ve kapak dosyaları ile şarkı ekleme/düzenleme/silme
- Kategoriler ve alt kategorileri yönetme
- Ses dosyaları ve görselleri yükleme
- İşlem kayıtlarını ve sistem istatistiklerini izleme
- Rol tabanlı erişim ile yetkili personeli yönetme
- Deezer'dan şarkı arama ve indirme

### Modüler Mimari

Admin paneli ES6 modülleri ile modüler JavaScript mimarisi kullanır:

- **`global-variables.js`**: Merkezi durum yönetimi ve global değişkenler
- **`settings.js`**: İşlem kayıtları, sistem ayarları ve kullanıcı yönetimi
- **`song-management.js`**: Toplu işlemler ile tam şarkı CRUD operasyonları
- **`category-management.js`**: Dinamik kategori ve alt kategori yönetimi
- **`deezer.js`**: Şarkı arama ve indirme için Deezer API entegrasyonu
- **`utils.js`**: Yardımcı fonksiyonlar, toast mesajları ve ortak yardımcılar
- **`theme.js`**: localStorage kalıcılığı ile tema yönetimi
- **`logout.js`**: Güvenli oturum yönetimi ve çıkış işlevselliği

### Özelleştirme

- Görsel değişiklikler için `style.css` dosyasını değiştirin
- Oyun mantığını `script.js` dosyasında güncelleyin
- HTML yapısında yeni kategoriler ekleyin
- Admin panelini `admin/modules/` klasöründe özelleştirin

## 🎵 Desteklenen Ses Formatları

- **Ana Format**: MP3 dosyaları
- **Konum**: `songs/` dizini
- **İsimlendirme**: Açıklayıcı dosya adları kullanın (örn., `Sanatci-Sarki_Adi.mp3`)
- **Boyut**: Optimal performans için 10MB'ın altında önerilir

## 🖼️ Görsel Gereksinimleri

- **Format**: JPG/PNG
- **Konum**: `kapaklar/` dizini
- **İsimlendirme**: `song_[ID].jpg` formatı
- **Boyut**: 300x300px veya daha büyük önerilir
- **Kalite**: Daha iyi görsel deneyim için yüksek kalite

## 🌐 Tarayıcı Uyumluluğu

- Chrome (önerilen)
- Firefox
- Safari
- Edge
- Mobil tarayıcılar

## 📱 Mobil Desteği

Oyun tamamen duyarlıdır ve dokunmatik kontroller ve uyarlanabilir düzenlerle mobil cihazlar için optimize edilmiştir. Admin paneli de mobil cihazlarda sorunsuz çalışır.

## 🔐 Güvenlik Özellikleri

- **Oturum Yönetimi**: Güvenli admin kimlik doğrulama
- **Rol Tabanlı Erişim**: Kullanıcılar için farklı izin seviyeleri
- **İşlem Loglama**: Tüm işlemlerin tam denetim izi
- **Girdi Doğrulama**: XSS ve SQL injection koruması
- **Dosya Yükleme Güvenliği**: Güvenli dosya işleme ve doğrulama

## 📊 İzleme ve Loglama

- **İşlem Kayıtları**: Zaman damgaları ile tüm admin işlemlerini takip edin
- **Kullanıcı Aktivitesi**: Kullanıcı giriş/çıkış ve işlemlerini izleyin
- **Sistem İstatistikleri**: Oyun kullanımı ve performans metriklerini görüntüleyin
- **Hata Loglama**: Kapsamlı hata takibi ve raporlama

## 🤝 Katkıda Bulunma

1. Depoyu fork edin
2. Bir özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik ekle'`)
4. Dalı push edin (`git push origin feature/harika-ozellik`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.

## 🙏 Teşekkürler

- Wordle'ın tahmin oyunu konseptinden ilham alınmıştır
- Vanilla web teknolojileri ile geliştirilmiştir
- Şarkı önerileri için Türk müzik topluluğu
- Müzik API entegrasyonu için Deezer

## 📞 Destek

Sorular, sorunlar veya katkılar için lütfen GitHub'da bir issue açın veya geliştirme ekibiyle iletişime geçin.

## 🔄 Son Güncellemeler

### v2.1.0 - Gelişmiş Oyun Deneyimi

- **Oyun Başına 20 Soru**: Kapsamlı puanlama ile genişletilmiş oynanış
- **Pas Özelliği**: Tab tuşu veya pas butonu ile zor soruları atlama
- **Detaylı Sonuçlar**: Tam oyun istatistikleri ve soru analizi
- **Ses Kontrolü**: localStorage ile kalıcı ses ayarları
- **Mobil Optimizasyon**: Gelişmiş dokunmatik kontroller ve duyarlı tasarım
- **Dinamik Kategoriler**: Veritabanından gerçek zamanlı kategori yükleme
- **Gelişmiş Puanlama**: Görsel geri bildirim ile zaman tabanlı puanlama sistemi

### v2.0.0 - Büyük Admin Panel Güncellemesi

- ES6 modülleri ile tam modüler JavaScript mimarisi
- Filtreleme ve sayfalama ile kapsamlı işlem loglama sistemi
- Rol tabanlı erişim ve şifre güvenliği ile gelişmiş kullanıcı yönetimi
- Şarkı arama ve indirme için Deezer entegrasyonu
- Şarkılar ve işlem kayıtları için toplu işlemler
- Tema desteği ve modern tasarım ile geliştirilmiş UI/UX
- Genel olarak daha iyi hata yönetimi ve doğrulama

### v1.5.0 - İşlem Kayıtları

- Tüm admin işlemleri için kapsamlı loglama eklendi
- Detaylı denetim izleri ile kullanıcı aktivite takibi
- İşlem kayıtları için gelişmiş filtreleme ve sayfalama
- Sistem izleme ve istatistik paneli

### v1.0.0 - İlk Sürüm

- 30 saniyelik zamanlayıcı ile temel oyun işlevselliği
- Şarkı yönetimi ile temel admin paneli
- Kategori ve alt kategori yönetimi
- Albüm kapağı ipuçları ve görsel geri bildirim

---

**Songle'ı oynamanın keyfini çıkarın! 🎵✨**
