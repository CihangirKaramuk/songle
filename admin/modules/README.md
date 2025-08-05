# API Panel Modüler Yapısı

Bu klasör, `api-panel.js` dosyasının modüler hale getirilmiş versiyonunu içerir. Ana dosya artık daha küçük ve yönetilebilir hale getirilmiştir.

## Modüller

### 1. `global-variables.js`

- Tüm global değişkenleri içerir
- Şarkı listesi, sayfa numarası, seçili şarkılar vb.
- Diğer modüller tarafından import edilir

### 2. `utils.js`

- Yardımcı fonksiyonları içerir
- Toast mesajları, uyarılar, format fonksiyonları
- Tüm modüller tarafından kullanılır

### 3. `theme.js`

- Tema yönetimi (Dark/Light mode)
- DOMContentLoaded event listener'ları

### 4. `logout.js`

- Çıkış işlemleri
- Modal dialog yönetimi

### 5. `deezer.js`

- Deezer API entegrasyonu
- Şarkı arama ve indirme işlemleri

### 6. `song-management.js`

- Şarkı CRUD işlemleri
- Şarkı listesi güncelleme
- Silme ve düzenleme fonksiyonları

### 7. `category-management.js`

- Kategori yönetimi
- Kategori CRUD işlemleri
- Alt kategori yönetimi

### 8. `settings.js`

- Ayarlar sayfası fonksiyonları
- Sistem bilgileri güncelleme

## Kullanım

Ana dosya (`api-panel.js`) tüm modülleri import eder ve global değişkenleri window objesine ekler. Bu sayede mevcut kod yapısı bozulmadan modüler hale getirilmiştir.

## Avantajlar

1. **Daha iyi organizasyon**: Her modül kendi sorumluluğuna odaklanır
2. **Bakım kolaylığı**: Hata ayıklama ve güncelleme daha kolay
3. **Yeniden kullanılabilirlik**: Modüller başka projelerde de kullanılabilir
4. **Test edilebilirlik**: Her modül ayrı ayrı test edilebilir

## Not

Bu modüler yapı, mevcut fonksiyonaliteyi hiç değiştirmeden oluşturulmuştur. Tüm fonksiyonlar ve değişkenler aynı şekilde çalışmaya devam eder.
