import apiService from '../../apiService.js'
import { showSuccessToast, showModernAlert, getCurrentUserId } from './utils.js'
import { GlobalVars, updatePageSize } from './global-variables.js'

// Ayarlar sayfası fonksiyonları
async function loadAyarlar() {
  try {
    // Kullanıcı ID'sini al (login'den gelen kullanıcı bilgisi)
    const kullaniciId = getCurrentUserId() // Bu fonksiyonu implement etmeniz gerekebilir

    // API'den ayarları yükle
    const ayarlar = await apiService.getAyarlar(kullaniciId)

    // Form elemanlarını güncelle
    const temaSelect = document.getElementById('temaSecimi')
    const sayfaSelect = document.getElementById('sayfaBoyutu')
    const bildirimSelect = document.getElementById('bildirimSesi')

    if (temaSelect) temaSelect.value = ayarlar.tema
    if (sayfaSelect)
      sayfaSelect.value = ayarlar.sayfa_boyutu || GlobalVars.pageSize.toString()
    if (bildirimSelect)
      bildirimSelect.value = ayarlar.bildirim_sesi ? 'true' : 'false'

    // Sayfa boyutu değiştiğinde otomatik güncelleme için event listener ekle
    if (sayfaSelect) {
      sayfaSelect.addEventListener('change', (e) => {
        const newPageSize = parseInt(e.target.value)
        if (GlobalVars.pageSize !== newPageSize) {
          updatePageSizeAndRefresh(newPageSize)
        }
      })
    }

    // Sistem bilgilerini güncelle
    updateSistemBilgileri()
  } catch (error) {
    console.error('Ayarlar yüklenirken hata:', error)
    // Hata durumunda varsayılan değerleri kullan
    const temaSelect = document.getElementById('temaSecimi')
    const sayfaSelect = document.getElementById('sayfaBoyutu')
    const bildirimSelect = document.getElementById('bildirimSesi')

    if (temaSelect) temaSelect.value = 'dark'
    if (sayfaSelect) sayfaSelect.value = GlobalVars.pageSize.toString()
    if (bildirimSelect) bildirimSelect.value = 'true'
  }
}

async function saveAyarlar() {
  try {
    const temaSecimi = document.getElementById('temaSecimi')?.value || 'dark'
    const sayfaBoyutu =
      document.getElementById('sayfaBoyutu')?.value ||
      GlobalVars.pageSize.toString()
    const bildirimSesi =
      document.getElementById('bildirimSesi')?.value || 'true'

    // Kullanıcı ID'sini al
    const kullaniciId = getCurrentUserId()

    // API'ye ayarları gönder
    await apiService.saveAyarlar(kullaniciId, {
      tema: temaSecimi,
      sayfa_boyutu: parseInt(sayfaBoyutu),
      bildirim_sesi: bildirimSesi === 'true',
    })

    // Tema değişikliğini uygula
    if (temaSecimi === 'light') {
      document.getElementById('panelBody').classList.add('light')
      document.getElementById('themeToggle').checked = true
    } else if (temaSecimi === 'dark') {
      document.getElementById('panelBody').classList.remove('light')
      document.getElementById('themeToggle').checked = false
    }

    // Sayfa boyutunu güncelle
    const newPageSize = parseInt(sayfaBoyutu)
    if (GlobalVars.pageSize !== newPageSize) {
      updatePageSizeAndRefresh(newPageSize)
    }

    showSuccessToast('Ayarlar başarıyla kaydedildi!')
  } catch (error) {
    console.error('Ayarlar kaydedilirken hata:', error)
    showModernAlert('Ayarlar kaydedilirken hata oluştu!', 'error')
  }
}

async function updateSistemBilgileri() {
  try {
    // Sistem bilgilerini API service ile al
    const sistemData = await apiService.getSistemBilgileri()

    // Son güncelleme tarihini al
    const sonGuncelleme = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // DOM elementlerini güncelle
    const toplamSarkiElement = document.getElementById('toplamSarki')
    const toplamKategoriElement = document.getElementById('toplamKategori')
    const toplamKullaniciElement = document.getElementById('toplamKullanici')
    const toplamIslemKaydiElement = document.getElementById('son7GunIslem')
    const bugunIslemElement = document.getElementById('bugunIslem')
    const sonGuncellemeElement = document.getElementById('sonGuncelleme')

    if (toplamSarkiElement)
      toplamSarkiElement.textContent = sistemData.toplam_sarki
    if (toplamKategoriElement)
      toplamKategoriElement.textContent = sistemData.toplam_kategori
    if (toplamKullaniciElement)
      toplamKullaniciElement.textContent = sistemData.toplam_kullanici
    if (toplamIslemKaydiElement)
      toplamIslemKaydiElement.textContent = sistemData.son_7_gun_islem
    if (bugunIslemElement)
      bugunIslemElement.textContent = sistemData.bugun_islem
    if (sonGuncellemeElement) sonGuncellemeElement.textContent = sonGuncelleme
  } catch (error) {
    console.error('Sistem bilgileri güncellenirken hata:', error)
  }
}

// Sayfa boyutu değiştiğinde şarkı listesini güncelle
function updatePageSizeAndRefresh(newPageSize) {
  updatePageSize(newPageSize)

  // Şarkı listesini yeniden yükle
  if (typeof guncelleListe === 'function') {
    guncelleListe(1) // İlk sayfaya dön
  }

  // Filtreleri uygula
  if (typeof window.applyFilters === 'function') {
    window.applyFilters()
  }
}

// İşlem Kayıtları Fonksiyonları
let islemKayitlari = []
let seciliKayitlar = []
let currentPage = 1
const itemsPerPage = 10

// İşlem kayıtlarını yükle
async function loadIslemKayitlari() {
  try {
    // API'den işlem kayıtlarını al
    const islemTipiFiltre =
      document.getElementById('islemTipiFiltre')?.value || ''

    // Filtreleme parametrelerini URL'e ekle
    const params = new URLSearchParams()
    if (islemTipiFiltre) params.append('islem_tipi', islemTipiFiltre)
    // Tüm kayıtları al, sayfalama frontend'de yapılacak
    params.append('limit', 1000) // Büyük bir sayı ile tüm kayıtları al

    const response = await fetch(
      `http://localhost/songle-backend/api/islem-kayitlari.php?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      islemKayitlari = result.data
      // Toplam kayıt sayısını global değişkene kaydet (tüm kayıtlar artık frontend'de)
      window.totalIslemKayitlari = result.data?.length || 0
      // Sayfalama bilgilerini güncelle
      updatePagination(window.totalIslemKayitlari)
    } else {
      throw new Error(result.error || 'API hatası')
    }

    // Filtreleri uygula ve listeyi güncelle
    applyIslemKayitlariFilters()
  } catch (error) {
    console.error('İşlem kayıtları yüklenirken hata:', error)
    // Hata durumunda örnek veriler göster
    islemKayitlari = getSampleIslemKayitlari()
    window.totalIslemKayitlari = islemKayitlari.length
    applyIslemKayitlariFilters()
  }
}

// Örnek işlem kayıtları (backend hazır olana kadar)
function getSampleIslemKayitlari() {
  return [
    {
      id: 1,
      islem_tipi: 'sarki_ekleme',
      kaynak: 'deezer',
      kullanici_adi: 'admin',
      tarih: '2024-01-15 14:30:25',
      detay: "Shape of You - Ed Sheeran şarkısı Deezer'dan eklendi",
      sarki_adi: 'Shape of You',
      sanatci: 'Ed Sheeran',
      kategori: 'Pop',
    },
    {
      id: 2,
      islem_tipi: 'sarki_ekleme',
      kaynak: 'mp3',
      kullanici_adi: 'admin',
      tarih: '2024-01-15 13:45:12',
      detay: 'Bohemian Rhapsody - Queen şarkısı MP3 dosyası olarak yüklendi',
      sarki_adi: 'Bohemian Rhapsody',
      sanatci: 'Queen',
      kategori: 'Rock',
    },
    {
      id: 3,
      islem_tipi: 'kategori_ekleme',
      kaynak: 'manuel',
      kullanici_adi: 'admin',
      tarih: '2024-01-15 12:20:30',
      detay: 'Yeni kategori eklendi: Jazz',
      kategori_adi: 'Jazz',
    },
    {
      id: 4,
      islem_tipi: 'sarki_silme',
      kaynak: 'manuel',
      kullanici_adi: 'admin',
      tarih: '2024-01-15 11:15:45',
      detay: 'Yesterday - The Beatles şarkısı silindi',
      sarki_adi: 'Yesterday',
      sanatci: 'The Beatles',
      kategori: 'Rock',
    },
    {
      id: 5,
      islem_tipi: 'sarki_degistirme',
      kaynak: 'manuel',
      kullanici_adi: 'admin',
      tarih: '2024-01-15 10:30:20',
      detay: 'Hotel California - Eagles şarkısının bilgileri güncellendi',
      sarki_adi: 'Hotel California',
      sanatci: 'Eagles',
      kategori: 'Rock',
    },
  ]
}

// İşlem kayıtları filtrelerini uygula
function applyIslemKayitlariFilters() {
  // Filtreleme artık backend'de yapılıyor, sadece render et
  renderIslemKayitlari(islemKayitlari)
}

// İşlem kayıtlarını render et
function renderIslemKayitlari(kayitlar) {
  const listeContainer = document.getElementById('islemKayitlariListe')
  if (!listeContainer) return

  // Tüm kayıtlardan mevcut sayfa için olanları al
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedKayitlar = kayitlar.slice(startIndex, endIndex)

  listeContainer.innerHTML = paginatedKayitlar
    .map(
      (kayit) => `
    <div class="islem-kayit-item ${
      seciliKayitlar.includes(kayit.id) ? 'selected checked' : ''
    }" data-kayit-id="${kayit.id}">
      <input type="checkbox" class="islem-kayit-checkbox" data-kayit-id="${
        kayit.id
      }" ${seciliKayitlar.includes(kayit.id) ? 'checked' : ''}>
      <div class="islem-kayit-header">
        <span class="islem-kayit-tip">${getIslemTipiText(
          kayit.islem_tipi
        )}</span>
        <span class="islem-kayit-tarih">${formatTarih(kayit.tarih)}</span>
      </div>
      <div class="islem-kayit-detay">${kayit.detay}</div>
      <div class="islem-kayit-kullanici">Kullanıcı: ${kayit.kullanici_adi}</div>
    </div>
  `
    )
    .join('')

  updatePagination(kayitlar.length) // Tüm kayıtların sayısını kullan
  updateSeciliKayitlarButton()
}

// İşlem tipini Türkçe metne çevir
function getIslemTipiText(islemTipi) {
  const islemTipleri = {
    sarki_ekleme: 'Şarkı Ekleme',
    sarki_silme: 'Şarkı Silme',
    sarki_degistirme: 'Şarkı Değiştirme',
    kategori_ekleme: 'Kategori Ekleme',
    kategori_silme: 'Kategori Silme',
    kategori_degistirme: 'Kategori Değiştirme',
  }
  return islemTipleri[islemTipi] || islemTipi
}

// Tarihi formatla
function formatTarih(tarih) {
  return new Date(tarih).toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Sayfalama güncelle
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const sayfaBilgisi = document.getElementById('sayfaBilgisi')
  const oncekiBtn = document.getElementById('oncekiSayfa')
  const sonrakiBtn = document.getElementById('sonrakiSayfa')
  const dots = document.querySelectorAll('.dot')

  if (sayfaBilgisi) {
    sayfaBilgisi.textContent = `Sayfa ${currentPage} / ${totalPages}`
  }

  if (oncekiBtn) {
    oncekiBtn.disabled = currentPage <= 1
  }

  if (sonrakiBtn) {
    sonrakiBtn.disabled = currentPage >= totalPages
  }

  // Nokta animasyonlarını güncelle
  dots.forEach((dot, index) => {
    if (index < totalPages) {
      dot.style.display = 'block'
      dot.classList.toggle('active', index + 1 === currentPage)
    } else {
      dot.style.display = 'none'
    }
  })
}

// Seçili kayıtlar butonunu güncelle
function updateSeciliKayitlarButton() {
  const batchControls = document.getElementById('islemKayitlariBatchControls')
  const selectedCount = document.getElementById('islemKayitlariSelectedCount')

  if (seciliKayitlar.length > 0) {
    // Dinamik seçim kontrolünü göster
    if (batchControls) {
      batchControls.style.display = 'block'
      batchControls.classList.add('show')
    }

    // Seçili sayıyı güncelle
    if (selectedCount) {
      selectedCount.textContent = `${seciliKayitlar.length} işlem kaydı seçildi`
    }
  } else {
    // Dinamik seçim kontrolünü gizle
    if (batchControls) {
      batchControls.style.display = 'none'
      batchControls.classList.remove('show')
    }
  }
}

// İşlem kaydı detayını göster
function showIslemKayitDetay(kayitId) {
  const kayit = islemKayitlari.find((k) => k.id === kayitId)
  if (!kayit) return

  const modal = document.getElementById('islemKayitDetayModal')
  const icerik = document.getElementById('islemKayitDetayIcerik')

  if (!modal || !icerik) return

  icerik.innerHTML = `
    <div class="islem-detay-grup">
      <div class="islem-detay-baslik">İşlem Bilgileri</div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">İşlem Tipi:</span>
        <span class="islem-detay-deger">${getIslemTipiText(
          kayit.islem_tipi
        )}</span>
      </div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Kaynak:</span>
        <span class="islem-detay-deger">${
          kayit.kaynak === 'deezer'
            ? 'Deezer'
            : kayit.kaynak === 'mp3'
            ? 'MP3 Dosya'
            : 'Manuel'
        }</span>
      </div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Kullanıcı:</span>
        <span class="islem-detay-deger">${kayit.kullanici_adi}</span>
      </div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Tarih:</span>
        <span class="islem-detay-deger">${formatTarih(kayit.tarih)}</span>
      </div>
    </div>
    
    ${
      kayit.sarki_adi
        ? `
    <div class="islem-detay-grup">
      <div class="islem-detay-baslik">Şarkı Bilgileri</div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Şarkı Adı:</span>
        <span class="islem-detay-deger">${kayit.sarki_adi}</span>
      </div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Sanatçı:</span>
        <span class="islem-detay-deger">${kayit.sanatci}</span>
      </div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Kategori:</span>
        <span class="islem-detay-deger">${kayit.kategori}</span>
      </div>
    </div>
    `
        : ''
    }
    
    ${
      kayit.kategori_adi
        ? `
    <div class="islem-detay-grup">
      <div class="islem-detay-baslik">Kategori Bilgileri</div>
      <div class="islem-detay-satir">
        <span class="islem-detay-label">Kategori Adı:</span>
        <span class="islem-detay-deger">${kayit.kategori_adi}</span>
      </div>
    </div>
    `
        : ''
    }
    
    <div class="islem-detay-grup">
      <div class="islem-detay-baslik">Detay</div>
      <div class="islem-detay-aciklama">${kayit.detay}</div>
    </div>
  `

  modal.style.display = 'flex'
}

// İşlem kayıtları silme modalını göster
function showIslemKayitlariSilModal() {
  const modal = document.getElementById('islemKayitlariSilModal')
  const countSpan = document.getElementById('islemKayitlariCount')

  if (modal && countSpan) {
    countSpan.textContent = seciliKayitlar.length
    modal.classList.add('active')
  }
}

// İşlem kayıtları silme modalını gizle
function hideIslemKayitlariSilModal() {
  const modal = document.getElementById('islemKayitlariSilModal')
  if (modal) {
    modal.classList.remove('active')
  }
}

// Seçili kayıtları sil
async function deleteSeciliKayitlar() {
  if (seciliKayitlar.length === 0) return

  // Modal'ı göster
  showIslemKayitlariSilModal()
}

// Gerçek silme işlemini yap
async function performIslemKayitlariSil() {
  try {
    // API'ye silme isteği gönder
    const response = await fetch(
      'http://localhost/songle-backend/api/islem-kayitlari-sil.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kayit_ids: seciliKayitlar }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      // Modal'ı gizle
      hideIslemKayitlariSilModal()

      // Listeyi yenile
      seciliKayitlar = []
      await loadIslemKayitlari()
      showSuccessToast(result.message || 'Seçili kayıtlar başarıyla silindi!')
    } else {
      throw new Error(result.error || 'Silme işlemi başarısız')
    }
  } catch (error) {
    console.error('Kayıtlar silinirken hata:', error)
    showModernAlert('Kayıtlar silinirken hata oluştu!', 'error')
    hideIslemKayitlariSilModal()
  }
}

// Event listener'ları ekle
function setupIslemKayitlariEventListeners() {
  // Filtre değişiklikleri
  const islemTipiFiltre = document.getElementById('islemTipiFiltre')

  if (islemTipiFiltre) {
    islemTipiFiltre.addEventListener('change', () => {
      currentPage = 1
      loadIslemKayitlari()
    })
  }

  // Yenile butonu
  const yenileBtn = document.getElementById('islemKayitlariYenile')
  if (yenileBtn) {
    yenileBtn.addEventListener('click', async () => {
      // Loading animasyonunu başlat
      yenileBtn.classList.add('loading')
      yenileBtn.disabled = true

      try {
        // En az 1 saniye animasyon göster
        await Promise.all([
          loadIslemKayitlari(),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ])
      } finally {
        // Loading animasyonunu durdur
        yenileBtn.classList.remove('loading')
        yenileBtn.disabled = false
      }
    })
  }

  // Dinamik seçim kontrolleri
  const batchDeleteBtn = document.getElementById('islemKayitlariBatchDelete')
  const batchCancelBtn = document.getElementById('islemKayitlariBatchCancel')

  if (batchDeleteBtn) {
    batchDeleteBtn.addEventListener('click', deleteSeciliKayitlar)
  }

  if (batchCancelBtn) {
    batchCancelBtn.addEventListener('click', () => {
      // Tüm seçimleri temizle
      seciliKayitlar = []
      document.querySelectorAll('.islem-kayit-checkbox').forEach((checkbox) => {
        checkbox.checked = false
      })

      // Tüm seçili class'ları kaldır
      document.querySelectorAll('.islem-kayit-item').forEach((item) => {
        item.classList.remove('selected')
        item.classList.remove('checked')
      })

      updateSeciliKayitlarButton()
    })
  }

  // Sayfalama butonları
  const oncekiBtn = document.getElementById('oncekiSayfa')
  const sonrakiBtn = document.getElementById('sonrakiSayfa')

  if (oncekiBtn) {
    oncekiBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--
        // Sadece render et, API çağrısı yapma
        applyIslemKayitlariFilters()
      }
    })
  }

  if (sonrakiBtn) {
    sonrakiBtn.addEventListener('click', () => {
      // Toplam sayfa sayısını hesapla (tüm kayıtlar artık frontend'de)
      const totalPages = Math.ceil(islemKayitlari.length / itemsPerPage)
      if (currentPage < totalPages) {
        currentPage++
        // Sadece render et, API çağrısı yapma
        applyIslemKayitlariFilters()
      }
    })
  }

  // İşlem kaydı tıklama olayları
  document.addEventListener('click', (e) => {
    // İşlem kaydı detayı için tıklama
    if (
      e.target.closest('.islem-kayit-item') &&
      !e.target.closest('.islem-kayit-checkbox')
    ) {
      const kayitItem = e.target.closest('.islem-kayit-item')
      const kayitId = parseInt(kayitItem.dataset.kayitId)
      showIslemKayitDetay(kayitId)
    }

    // Checkbox tıklama
    if (e.target.classList.contains('islem-kayit-checkbox')) {
      e.stopPropagation()
      const kayitId = parseInt(e.target.dataset.kayitId)
      const isChecked = e.target.checked
      const kayitItem = e.target.closest('.islem-kayit-item')

      if (isChecked) {
        if (!seciliKayitlar.includes(kayitId)) {
          seciliKayitlar.push(kayitId)
        }
        // Seçili class'ı ekle
        if (kayitItem) {
          kayitItem.classList.add('selected')
          kayitItem.classList.add('checked')
        }
      } else {
        seciliKayitlar = seciliKayitlar.filter((id) => id !== kayitId)
        // Seçili class'ı kaldır
        if (kayitItem) {
          kayitItem.classList.remove('selected')
          kayitItem.classList.remove('checked')
        }
      }

      updateSeciliKayitlarButton()
    }
  })

  // Modal kapatma
  const detayKapatBtn = document.getElementById('islemKayitDetayKapat')
  const detayModal = document.getElementById('islemKayitDetayModal')

  if (detayKapatBtn) {
    detayKapatBtn.addEventListener('click', () => {
      if (detayModal) {
        detayModal.style.display = 'none'
      }
    })
  }

  if (detayModal) {
    detayModal.addEventListener('click', (e) => {
      if (e.target === detayModal) {
        detayModal.style.display = 'none'
      }
    })
  }

  // İşlem kayıtları silme modal event listener'ları
  const silModal = document.getElementById('islemKayitlariSilModal')
  const silCancelBtn = document.getElementById('islemKayitlariSilCancel')
  const silConfirmBtn = document.getElementById('islemKayitlariSilConfirm')

  if (silModal) {
    silModal.addEventListener('click', (e) => {
      if (e.target === silModal) {
        hideIslemKayitlariSilModal()
      }
    })
  }

  if (silCancelBtn) {
    silCancelBtn.addEventListener('click', hideIslemKayitlariSilModal)
  }

  if (silConfirmBtn) {
    silConfirmBtn.addEventListener('click', performIslemKayitlariSil)
  }
}

// İşlem kayıtları seçimlerini temizle
function clearIslemKayitlariSelections() {
  // Tüm seçimleri temizle
  seciliKayitlar = []

  // Tüm checkbox'ları sıfırla
  document.querySelectorAll('.islem-kayit-checkbox').forEach((checkbox) => {
    checkbox.checked = false
  })

  // Tüm seçili class'ları kaldır
  document.querySelectorAll('.islem-kayit-item').forEach((item) => {
    item.classList.remove('selected')
    item.classList.remove('checked')
  })

  // Batch controls'ı gizle
  const batchControls = document.getElementById('islemKayitlariBatchControls')
  if (batchControls) {
    batchControls.style.display = 'none'
    batchControls.classList.remove('show')
  }

  updateSeciliKayitlarButton()
}

// Test işlem kaydı oluştur (geliştirme için)
async function testIslemKaydiOlustur() {
  try {
    const kullaniciId = getCurrentUserId()
    const kullaniciAdi = getCurrentUserName()

    const testData = {
      islem_tipi: 'test_islem',
      kaynak: 'test',
      kullanici_id: kullaniciId,
      kullanici_adi: kullaniciAdi,
      detay: 'Test işlem kaydı - ' + new Date().toLocaleString('tr-TR'),
      sarki_adi: 'Test Şarkı',
      sanatci: 'Test Sanatçı',
      kategori: 'Test-Kategori',
    }

    const response = await fetch(
      'http://localhost/songle-backend/api/islem-kayit-ekle.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      }
    )

    if (response.ok) {
      showSuccessToast('Test işlem kaydı oluşturuldu!')
      await loadIslemKayitlari() // Listeyi yenile
    } else {
      throw new Error('Test işlem kaydı oluşturulamadı')
    }
  } catch (error) {
    console.error('Test işlem kaydı hatası:', error)
    showModernAlert(
      'Test işlem kaydı oluşturulamadı: ' + error.message,
      'error'
    )
  }
}

// İşlem kayıtlarını başlat
async function initIslemKayitlari() {
  setupIslemKayitlariEventListeners()
  await loadIslemKayitlari()
}

export {
  loadAyarlar,
  saveAyarlar,
  updateSistemBilgileri,
  updatePageSizeAndRefresh,
  loadIslemKayitlari,
  initIslemKayitlari,
  showIslemKayitDetay,
  deleteSeciliKayitlar,
  clearIslemKayitlariSelections,
  testIslemKaydiOlustur,
}
