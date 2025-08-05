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
    // Toplam şarkı sayısını al
    const sarkiResponse = await apiService.getSongs()
    const toplamSarki = sarkiResponse.length || 0

    // Toplam kategori sayısını al
    const kategoriResponse = await apiService.getKategoriler() // Tüm kategorileri al
    const toplamKategori = kategoriResponse.length || 0

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
    const sonGuncellemeElement = document.getElementById('sonGuncelleme')

    if (toplamSarkiElement) toplamSarkiElement.textContent = toplamSarki
    if (toplamKategoriElement)
      toplamKategoriElement.textContent = toplamKategori
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

export {
  loadAyarlar,
  saveAyarlar,
  updateSistemBilgileri,
  updatePageSizeAndRefresh,
}
