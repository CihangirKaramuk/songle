import apiService from './apiService.js'

let sarkiListesi = []
let soruListesi = []
let kullanilanSarkilar = []
let soruIndex = 0
let selectedDiziAltKategori = ''
let selectedFilmAltKategori = ''
let selectedTurkceAltKategori = ''
let selectedYabanciAltKategori = ''
let anaKategoriler = []
let altKategoriler = []
let mevcutSoruSayisi = 0 // Mevcut soru sayısı
const TOPLAM_SORU_SAYISI = 20 // Toplam soru sayısı
let dogruBilinenSorular = [] // Doğru bilinen sorular
let sureDolanSorular = [] // Süre dolan sorular
let pasGecilenSorular = [] // Pas geçilen sorular
let dogruSoruSayisi = 0 // Gerçek doğru soru sayısı
const dropdownSelected = document.querySelector('.dropdown-selected')
const dropdownOptions = document.querySelector('.dropdown-options')
const options = document.querySelectorAll('.option')

// Initialize the app by fetching songs and categories
async function initializeApp() {
  try {
    sarkiListesi = await apiService.getSongs()
    await loadCategories()

    // Kaydedilmiş ses seviyesini yükle
    loadSavedVolume()
  } catch (error) {
    console.error('Failed to load songs:', error)
    // Show error to user if needed
    showAlertOverlay(
      'Şarkılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'
    )
  }
}

// Kategorileri yükle
async function loadCategories() {
  try {
    // Ana kategorileri al
    const anaKategorilerResponse = await apiService.getKategoriler('1')
    const altKategorilerResponse = await apiService.getKategoriler('0')

    anaKategoriler = anaKategorilerResponse.data || anaKategorilerResponse
    altKategoriler = altKategorilerResponse.data || altKategorilerResponse

    // Dropdown'u güncelle
    updateCategoryDropdown()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// Kategori dropdown'unu güncelle
function updateCategoryDropdown() {
  const dropdownOptions = document.querySelector('.dropdown-options')

  // Mevcut seçenekleri temizle
  dropdownOptions.innerHTML = ''

  // Ana kategorileri sırala - Türkçe, Yabancı, Dizi, Film sırasında
  const sortedAnaKategoriler = [...anaKategoriler].sort((a, b) => {
    const aIsim = a.isim.toLowerCase()
    const bIsim = b.isim.toLowerCase()

    // Sıralama önceliği: Türkçe, Yabancı, Dizi, Film
    const siralama = {
      türkçe: 1,
      turkce: 1,
      yabancı: 2,
      yabanci: 2,
      dizi: 3,
      film: 4,
    }

    const aOncelik = siralama[aIsim] || 999
    const bOncelik = siralama[bIsim] || 999

    return aOncelik - bOncelik
  })

  // Ana kategorileri ekle
  sortedAnaKategoriler.forEach((kategori) => {
    const option = document.createElement('div')
    option.className = 'option'
    option.setAttribute('data-value', kategori.id)

    // Kategori ismini düzenle
    let gorunurIsim = kategori.isim
    switch (kategori.isim.toLowerCase()) {
      case 'türkçe':
      case 'turkce':
        gorunurIsim = 'Türkçe'
        break
      case 'yabancı':
      case 'yabanci':
        gorunurIsim = 'Yabancı'
        break
      case 'dizi':
        gorunurIsim = 'Dizi'
        break
      case 'film':
        gorunurIsim = 'Film'
        break
      default:
        gorunurIsim =
          kategori.isim.charAt(0).toUpperCase() + kategori.isim.slice(1)
    }

    option.textContent = gorunurIsim
    dropdownOptions.appendChild(option)
  })

  // Event listener'ları yeniden ekle
  const newOptions = document.querySelectorAll('.option')
  newOptions.forEach((option) => {
    option.addEventListener('click', handleCategorySelection)
  })
}

// Kategori seçim işleyicisi
function handleCategorySelection() {
  document
    .querySelectorAll('.alt-kategori-card')
    .forEach((card) => card.classList.remove('selected'))
  document
    .querySelectorAll('.dizi-alt-kategori-card.selected')
    .forEach((card) => card.classList.remove('selected'))
  document
    .querySelectorAll('.film-alt-kategori-card.selected')
    .forEach((card) => card.classList.remove('selected'))
  selectedTurkceAltKategori = ''
  selectedYabanciAltKategori = ''
  selectedDiziAltKategori = ''
  selectedFilmAltKategori = ''

  // Tüm alt kategori seçimlerini temizle
  Object.keys(window).forEach((key) => {
    if (key.startsWith('selectedAltKategori-')) {
      delete window[key]
    }
  })

  dropdownSelected.textContent = this.textContent
  dropdownSelected.setAttribute('data-value', this.getAttribute('data-value'))
  dropdownOptions.style.display = 'none'

  // Alt kategorileri göster/gizle
  const kategoriId = this.getAttribute('data-value')
  showSubcategories(kategoriId)
}

// Alt kategorileri göster/gizle
function showSubcategories(kategoriId) {
  // Tüm alt kategori div'lerini gizle
  const altKategoriDivs = [
    'diziAltKategoriler',
    'filmAltKategoriler',
    'turkceAltKategoriler',
    'yabanciAltKategoriler',
  ]

  altKategoriDivs.forEach((divId) => {
    const div = document.getElementById(divId)
    if (div) {
      div.style.display = 'none'
      div.innerHTML = '' // İçeriği temizle
    }
  })

  // Seçilen kategoriye ait alt kategorileri bul
  const kategoriAltKategoriler = altKategoriler.filter(
    (alt) => alt.parent_id == kategoriId
  )

  // Eğer alt kategoriler varsa, dinamik olarak oluştur
  if (kategoriAltKategoriler.length > 0) {
    createDynamicSubcategories(kategoriAltKategoriler, kategoriId)
  }
}

// Dinamik alt kategoriler oluştur
function createDynamicSubcategories(altKategoriler, parentId) {
  // Ana kategoriyi bul
  const anaKategori = anaKategoriler.find((kat) => kat.id == parentId)
  if (!anaKategori) return

  // Hangi div'i kullanacağımızı belirle
  let targetDivId = ''
  let cardClassName = ''

  // Ana kategori adına göre uygun div'i seç
  if (anaKategori.isim.toLowerCase().includes('dizi')) {
    targetDivId = 'diziAltKategoriler'
    cardClassName = 'dizi-alt-kategori-card'
  } else if (anaKategori.isim.toLowerCase().includes('film')) {
    targetDivId = 'filmAltKategoriler'
    cardClassName = 'film-alt-kategori-card'
  } else if (
    anaKategori.isim.toLowerCase().includes('türkçe') ||
    anaKategori.isim.toLowerCase().includes('turkce')
  ) {
    targetDivId = 'turkceAltKategoriler'
    cardClassName = 'alt-kategori-card'
  } else if (
    anaKategori.isim.toLowerCase().includes('yabancı') ||
    anaKategori.isim.toLowerCase().includes('yabanci')
  ) {
    targetDivId = 'yabanciAltKategoriler'
    cardClassName = 'alt-kategori-card'
  } else {
    // Eğer kategori adı eşleşmezse, genel alt kategori div'ini kullan
    targetDivId = 'turkceAltKategoriler'
    cardClassName = 'alt-kategori-card'
  }

  const targetDiv = document.getElementById(targetDivId)
  if (!targetDiv) return

  // Div'i temizle ve alt kategorileri ekle
  targetDiv.innerHTML = ''

  // Alt kategorileri sırala - "Karışık" en sağda olsun
  const sortedAltKategoriler = [...altKategoriler].sort((a, b) => {
    const aIsDiger = a.isim.toLowerCase() === 'diğer'
    const bIsDiger = b.isim.toLowerCase() === 'diğer'

    if (aIsDiger && !bIsDiger) return 1 // Diğer'i sağa taşı
    if (!aIsDiger && bIsDiger) return -1 // Diğer'i sağa taşı
    return 0 // Diğerleri aynı sırada bırak
  })

  sortedAltKategoriler.forEach((altKategori) => {
    const card = document.createElement('div')
    card.className = cardClassName
    card.id = `altKategori-${altKategori.id}`

    // Alt kategori ismini düzenle
    let gorunurIsim = altKategori.isim
    switch (altKategori.isim.toLowerCase()) {
      case 'diğer':
        gorunurIsim = 'Karışık'
        break
      case 'rock':
        gorunurIsim = 'Rock'
        break
      case 'pop':
        gorunurIsim = 'Pop'
        break
      case 'hip hop':
      case 'hiphop':
        gorunurIsim = 'Hip Hop'
        break
      case 'karışık':
      case 'karisik':
        gorunurIsim = 'Karışık'
        break
      default:
        gorunurIsim =
          altKategori.isim.charAt(0).toUpperCase() + altKategori.isim.slice(1)
    }

    card.textContent = gorunurIsim
    card.addEventListener('click', function () {
      // Diğer kartları seçimden çıkar
      document
        .querySelectorAll(`#${targetDivId} .${cardClassName}`)
        .forEach((card) => card.classList.remove('selected'))

      // Bu kartı seç
      this.classList.add('selected')

      // Seçilen alt kategoriyi kaydet
      window[`selectedAltKategori-${parentId}`] = altKategori.id
    })

    targetDiv.appendChild(card)
  })

  // Div'i göster
  targetDiv.style.display = 'flex'
  setTimeout(() => {
    targetDiv.classList.add('gorunur')
  }, 10)
}

// Initialize the app when the script loads
initializeApp()

// Periyodik olarak kategorileri kontrol et (admin panelinden değişiklikler için)
setInterval(async () => {
  try {
    // Kategorileri yeniden yükle
    await loadCategories()
  } catch (error) {
    console.error('Error updating categories:', error)
  }
}, 10000) // Her 10 saniyede bir kontrol et

// Sayfa yüklendiğinde rastgele kategori seç
function rastgeleKategoriSec() {
  const options = document.querySelectorAll('.option')
  if (options.length > 0) {
    // Rastgele bir ana kategori seç
    const rastgeleIndex = Math.floor(Math.random() * options.length)
    const secilenKategori = options[rastgeleIndex]
    secilenKategori.click()

    // Alt kategoriler yüklendikten sonra rastgele bir alt kategori seç
    setTimeout(() => {
      const parentId = secilenKategori.getAttribute('data-value')
      const anaKategori = anaKategoriler.find((kat) => kat.id == parentId)

      if (anaKategori) {
        let targetDivId = ''
        if (anaKategori.isim.toLowerCase().includes('dizi')) {
          targetDivId = 'diziAltKategoriler'
        } else if (anaKategori.isim.toLowerCase().includes('film')) {
          targetDivId = 'filmAltKategoriler'
        } else if (
          anaKategori.isim.toLowerCase().includes('türkçe') ||
          anaKategori.isim.toLowerCase().includes('turkce')
        ) {
          targetDivId = 'turkceAltKategoriler'
        } else if (
          anaKategori.isim.toLowerCase().includes('yabancı') ||
          anaKategori.isim.toLowerCase().includes('yabanci')
        ) {
          targetDivId = 'yabanciAltKategoriler'
        } else {
          targetDivId = 'turkceAltKategoriler'
        }

        const altKategoriler = document.querySelectorAll(
          `#${targetDivId} div[id^="altKategori-"]`
        )

        // Eğer alt kategori varsa rastgele birini seç
        if (altKategoriler && altKategoriler.length > 0) {
          const rastgeleAltKategoriIndex = Math.floor(
            Math.random() * altKategoriler.length
          )
          altKategoriler[rastgeleAltKategoriIndex].click()
        }
      }
    }, 100)
  }
}

// Sayfa yüklendiğinde rastgele kategori seç
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rastgeleKategoriSec)
} else {
  rastgeleKategoriSec()
}

dropdownSelected.addEventListener('click', () => {
  dropdownOptions.style.display =
    dropdownOptions.style.display === 'block' ? 'none' : 'block'
})

// Mevcut event listener'ları güncelle
options.forEach((option) => {
  option.addEventListener('click', handleCategorySelection)
})

document.addEventListener('click', async (e) => {
  if (!e.target.closest('.custom-dropdown')) {
    dropdownOptions.style.display = 'none'
  }
})

// --- Security measures to prevent element inspection ---
document
  .querySelector('.start-btn')
  .addEventListener('click', async function () {
    const secilenKategori = dropdownSelected.textContent
    const kategoriKey = dropdownSelected.getAttribute('data-value')

    // Ana kategori seçili mi?
    if (!kategoriKey) {
      showAlertOverlay('Lütfen bir kategori seçin!')
      return
    }

    // Seçilen ana kategoriyi bul
    const anaKategori = anaKategoriler.find((kat) => kat.id == kategoriKey)
    if (!anaKategori) {
      showAlertOverlay('Geçersiz kategori seçimi!')
      return
    }

    // Alt kategori kontrolü
    const selectedAltKategoriId = window[`selectedAltKategori-${kategoriKey}`]
    if (!selectedAltKategoriId) {
      showAlertOverlay(`${anaKategori.isim} için bir alt kategori seçin!`)
      return
    }

    // Seçilen alt kategoriyi bul
    const altKategori = altKategoriler.find(
      (alt) => alt.id == selectedAltKategoriId
    )
    if (!altKategori) {
      showAlertOverlay('Geçersiz alt kategori seçimi!')
      return
    }

    // Oyun için kategori key oluştur (admin panel formatına uygun)
    let oyunKategoriKey
    if (altKategori.isim.toLowerCase() === 'diğer') {
      oyunKategoriKey = `${anaKategori.isim.toLowerCase()}-diğer`
    } else {
      oyunKategoriKey = `${anaKategori.isim.toLowerCase()}-${altKategori.isim
        .toLowerCase()
        .replace(' ', '')}`
    }

    // Görsel kategori isimlerini düzenle
    let gorunurAnaKategori = anaKategori.isim
    let gorunurAltKategori = altKategori.isim

    // Ana kategori isimlerini düzenle
    switch (anaKategori.isim.toLowerCase()) {
      case 'türkçe':
      case 'turkce':
        gorunurAnaKategori = 'Türkçe'
        break
      case 'yabancı':
      case 'yabanci':
        gorunurAnaKategori = 'Yabancı'
        break
      case 'dizi':
        gorunurAnaKategori = 'Dizi'
        break
      case 'film':
        gorunurAnaKategori = 'Film'
        break
      default:
        gorunurAnaKategori =
          anaKategori.isim.charAt(0).toUpperCase() + anaKategori.isim.slice(1)
    }

    // Alt kategori isimlerini düzenle
    switch (altKategori.isim.toLowerCase()) {
      case 'diğer':
        gorunurAltKategori = 'Karışık'
        break
      case 'rock':
        gorunurAltKategori = 'Rock'
        break
      case 'pop':
        gorunurAltKategori = 'Pop'
        break
      case 'hip hop':
      case 'hiphop':
        gorunurAltKategori = 'Hip Hop'
        break
      case 'karışık':
      case 'karisik':
        gorunurAltKategori = 'Karışık'
        break
      default:
        gorunurAltKategori =
          altKategori.isim.charAt(0).toUpperCase() + altKategori.isim.slice(1)
    }

    // Şarkıları filtrele
    try {
      sarkiListesi = await apiService.getSongs()

      soruListesi = sarkiListesi.filter((sarki) => {
        // Virgülle ayrılmış kategorileri kontrol et
        const kategoriler = sarki.kategori.split(',')
        return kategoriler.some((kat) => kat.trim() === oyunKategoriKey)
      })

      if (soruListesi.length === 0) {
        showNoSongsOverlay()
        return
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
      showAlertOverlay(
        'Şarkılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'
      )
      return
    }

    // Oyun başlığını güncelle
    document.getElementById(
      'secili-kategori'
    ).textContent = `${gorunurAnaKategori} ${gorunurAltKategori}`

    // Oyun başlangıcında soru sayacını ve puanı sıfırla
    mevcutSoruSayisi = 0
    mevcutPuan = 0
    kullanilanSarkilar = []
    dogruBilinenSorular = []
    sureDolanSorular = []
    pasGecilenSorular = []
    dogruSoruSayisi = 0
    soruIndex = rastgeleSoruIndex()

    // Progress göstergesini başlangıçta güncelle (0/20)
    guncelleProgressGosterge()

    guncelleSoru()
    baslatSayac()

    document.querySelector('.container').style.display = 'none'
    document.querySelector('.game-screen').style.display = 'block'
    document.getElementById('geriBtn').style.display = 'block'

    // Input'u otomatik seçili yap
    setTimeout(() => {
      document.querySelector('.tahmin-input').focus()
    }, 100)

    // Pas butonunu aktif et
    const pasBtn = document.getElementById('pasBtn')
    if (pasBtn) pasBtn.disabled = false
  })

// Modal fonksiyonları
function showExitWarningModal() {
  const modal = document.getElementById('exitWarningModal')
  modal.classList.add('show')
  document.body.style.overflow = 'hidden' // Sayfa scroll'unu engelle

  // Oyun kontrollerini kilitle
  lockGameControls()
}

function hideExitWarningModal() {
  const modal = document.getElementById('exitWarningModal')
  modal.classList.remove('show')
  document.body.style.overflow = '' // Sayfa scroll'unu geri aç

  // Oyun kontrollerini geri aç
  unlockGameControls()
}

// Oyun kontrollerini kilitleme fonksiyonları
function lockGameControls() {
  const guessInput = document.querySelector('.tahmin-input')
  const guessBtn = document.querySelector('.tahmin-gonder')
  const replayBtn = document.querySelector('.replay-btn')
  const pasBtn = document.getElementById('pasBtn')

  if (guessInput) {
    guessInput.disabled = true
    guessInput.blur() // Focus'u kaldır
  }
  if (guessBtn) guessBtn.disabled = true
  if (replayBtn) replayBtn.disabled = true
  if (pasBtn) pasBtn.disabled = true
}

function unlockGameControls() {
  const guessInput = document.querySelector('.tahmin-input')
  const guessBtn = document.querySelector('.tahmin-gonder')
  const replayBtn = document.querySelector('.replay-btn')
  const pasBtn = document.getElementById('pasBtn')

  if (guessInput) {
    guessInput.disabled = false
    guessInput.focus() // Focus'u geri ver
  }
  if (guessBtn) guessBtn.disabled = false
  if (replayBtn) replayBtn.disabled = false
  if (pasBtn) pasBtn.disabled = false
}

function exitToMainMenu() {
  hideExitWarningModal() // Bu fonksiyon zaten unlockGameControls() çağırıyor

  document.querySelector('.container').style.display = 'flex'
  document.querySelector('.game-screen').style.display = 'none'
  document.getElementById('geriBtn').style.display = 'none'
  document.getElementById('zamanGoster').textContent = '⏱️ Kalan Süre: 30'
  clearInterval(sayacInterval)
  clearTimeout(yeniSoruTimeout) // Bekleyen timeout'u temizle
  clearTimeout(audioPlayTimeout) // Şarkı çalma timeout'unu temizle

  // Pas uyarı mesajını temizle (eğer varsa)
  const pasMesaj = document.querySelector('.pas-mesaj')
  if (pasMesaj) {
    document.body.removeChild(pasMesaj)
  }

  // Progress göstergesini sıfırla
  mevcutSoruSayisi = 0
  guncelleProgressGosterge()

  // Puanı gizle
  puanGizle()

  // Pas geçilen soruları da sıfırla
  pasGecilenSorular = []

  // Audio player'ı tamamen durdur ve sıfırla
  audioPlayer.pause()
  audioPlayer.currentTime = 0
  audioPlayer.src = '' // Audio source'u temizle
  audioPlayer.load() // Audio'yu yeniden yükle

  if (window.durdurCalmaAnimasyonu) durdurCalmaAnimasyonu()
}

const geriBtn = document.getElementById('geriBtn')
geriBtn.addEventListener('click', function () {
  showExitWarningModal()
})

function rastgeleSoruIndex() {
  if (kullanilanSarkilar.length === soruListesi.length) {
    kullanilanSarkilar = []
  }

  let index
  do {
    index = Math.floor(Math.random() * soruListesi.length)
  } while (
    kullanilanSarkilar.includes(index) &&
    kullanilanSarkilar.length < soruListesi.length
  )

  kullanilanSarkilar.push(index)
  return index
}

function cevapDogruMu(tahmin, cevap) {
  // Her iki stringi de küçük harfe çevir ve fazla boşlukları temizle
  tahmin = tahmin.toLowerCase().trim()
  cevap = cevap.toLowerCase().trim()

  if (!cevap) {
    return false // Geçersiz format
  }

  // Basit karşılaştırma: tam eşleşme
  if (tahmin === cevap) {
    return true
  }

  // Daha esnek karşılaştırma için benzerlik hesapla
  return benzerlikHesapla(tahmin, cevap) > 0.75 // %75 benzerlik eşiği
}

function benzerlikHesapla(str1, str2) {
  // Basit Levenshtein distance tabanlı benzerlik
  const matrix = []
  const len1 = str1.length
  const len2 = str2.length

  // Matrix'i başlat
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Matrix'i doldur
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // değiştir
          matrix[i][j - 1] + 1, // ekle
          matrix[i - 1][j] + 1 // sil
        )
      }
    }
  }

  // Benzerlik oranını hesapla (0-1 arası)
  const maxLen = Math.max(len1, len2)
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen
}

// Puan hesaplama fonksiyonu
function puanHesapla(kalanSure) {
  // 30 saniyede 30 puan, 1 saniyede 1 puan
  return Math.max(0, kalanSure)
}

// Puan gösterme fonksiyonu
function puanGoster(puan) {
  const puanGosterEl = document.getElementById('puanGoster')
  const puanDegerEl = puanGosterEl.querySelector('.puan-deger')

  puanDegerEl.textContent = puan
  puanGosterEl.style.display = 'block'

  // Animasyon için kısa gecikme
  setTimeout(() => {
    puanGosterEl.classList.add('show')
  }, 50)
}

// Puan gizleme fonksiyonu
function puanGizle() {
  const puanGosterEl = document.getElementById('puanGoster')
  puanGosterEl.classList.remove('show')

  setTimeout(() => {
    puanGosterEl.style.display = 'none'
  }, 500)
}

// Soru sayısı göstergesi güncelleme fonksiyonu
function guncelleProgressGosterge() {
  const progressGostergeEl = document.getElementById('progress-gosterge')
  if (progressGostergeEl) {
    progressGostergeEl.textContent = `${mevcutSoruSayisi}/${TOPLAM_SORU_SAYISI}`
  }
}

// Detaylı sonuçları gösterme fonksiyonu
function gosterDetayliSonuclar() {
  // Doğru soru sayısını göster
  const dogruSayiEl = document.getElementById('dogru-sayi')
  if (dogruSayiEl) {
    dogruSayiEl.textContent = dogruSoruSayisi
  }

  // Süre dolan soru sayısını göster
  const sureDolanSayiEl = document.getElementById('sure-dolan-sayi')
  if (sureDolanSayiEl) {
    sureDolanSayiEl.textContent = sureDolanSorular.length
  }

  // Pas geçilen soru sayısını göster
  const pasGecilenSayiEl = document.getElementById('pas-gecilen-sayi')
  if (pasGecilenSayiEl) {
    pasGecilenSayiEl.textContent = pasGecilenSorular.length
  }

  // Doğru bilinen soruları listele
  const dogruListeEl = document.getElementById('dogru-liste')
  if (dogruListeEl) {
    dogruListeEl.innerHTML = ''
    dogruBilinenSorular.forEach((soru) => {
      const soruDiv = document.createElement('div')
      soruDiv.className = 'soru-item dogru'
      soruDiv.innerHTML = `
        <span class="soru-numarasi">${soru.soru}</span>
        <span class="sarki-adi">${soru.sarki}</span>
        <span class="soru-puan">+${soru.puan} puan</span>
      `
      dogruListeEl.appendChild(soruDiv)
    })
  }

  // Süre dolan soruları listele
  const sureDolanListeEl = document.getElementById('sure-dolan-liste')
  if (sureDolanListeEl) {
    sureDolanListeEl.innerHTML = ''
    sureDolanSorular.forEach((soru) => {
      const soruDiv = document.createElement('div')
      soruDiv.className = 'soru-item sure-dolan'
      soruDiv.innerHTML = `
        <span class="soru-numarasi">${soru.soru}</span>
        <span class="sarki-adi">${soru.sarki}</span>
        <span class="soru-durum">⏱️ Süre doldu</span>
      `
      sureDolanListeEl.appendChild(soruDiv)
    })
  }

  // Pas geçilen soruları listele
  const pasGecilenListeEl = document.getElementById('pas-gecilen-liste')
  if (pasGecilenListeEl) {
    pasGecilenListeEl.innerHTML = ''
    pasGecilenSorular.forEach((soru) => {
      const soruDiv = document.createElement('div')
      soruDiv.className = 'soru-item pas-gecilen'
      soruDiv.innerHTML = `
        <span class="soru-numarasi">${soru.soru}</span>
        <span class="sarki-adi">${soru.sarki}</span>
        <span class="soru-durum">🟠 Pas geçildi</span>
      `
      pasGecilenListeEl.appendChild(soruDiv)
    })
  }
}

// Oyun sonu gösterme fonksiyonu
function oyunSonuGoster() {
  // Arkada çalan müziği durdur
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer.currentTime = 0
  }

  // Oyun ekranını gizle
  document.querySelector('.game-screen').style.display = 'none'

  // Sonuç ekranını göster
  const sonucEkrani = document.getElementById('sonuc-ekrani')
  if (sonucEkrani) {
    sonucEkrani.style.display = 'block'

    // Toplam puanı hesapla ve göster
    const toplamPuanEl = document.getElementById('toplam-puan')
    if (toplamPuanEl) {
      toplamPuanEl.textContent = mevcutPuan
    }

    // Doğru soru sayısını göster
    const dogruSoruSayisiEl = document.getElementById('dogru-soru-sayisi')
    if (dogruSoruSayisiEl) {
      dogruSoruSayisiEl.textContent = dogruSoruSayisi
    }

    // Detaylı sonuçları göster
    gosterDetayliSonuclar()
  }
}

// Tekrar oyna fonksiyonu
function tekrarOyna() {
  // Sonuç ekranını gizle
  document.getElementById('sonuc-ekrani').style.display = 'none'

  // Oyun ekranını göster
  document.querySelector('.game-screen').style.display = 'block'

  // Kilitleri aç
  const guessInput = document.querySelector('.tahmin-input')
  const guessBtn = document.querySelector('.tahmin-gonder')
  const replayBtn = document.querySelector('.replay-btn')
  const pasBtn = document.getElementById('pasBtn')

  if (guessInput) guessInput.disabled = false
  if (guessBtn) guessBtn.disabled = false
  if (replayBtn) replayBtn.disabled = false
  if (pasBtn) pasBtn.disabled = false

  // Oyunu sıfırla ve yeniden başlat
  mevcutSoruSayisi = 0
  mevcutPuan = 0
  kullanilanSarkilar = []
  dogruBilinenSorular = []
  sureDolanSorular = []
  pasGecilenSorular = []
  dogruSoruSayisi = 0
  soruIndex = rastgeleSoruIndex()
  guncelleSoru()
  baslatSayac()
}

// Ana menüye dön fonksiyonu
function anaMenuyeDon() {
  // Sonuç ekranını gizle
  document.getElementById('sonuc-ekrani').style.display = 'none'

  // Ana menüyü göster
  document.querySelector('.container').style.display = 'flex'
  document.getElementById('geriBtn').style.display = 'none'

  // Pas uyarı mesajını temizle (eğer varsa)
  const pasMesaj = document.querySelector('.pas-mesaj')
  if (pasMesaj) {
    document.body.removeChild(pasMesaj)
  }

  // Kilitleri aç
  const guessInput = document.querySelector('.tahmin-input')
  const guessBtn = document.querySelector('.tahmin-gonder')
  const replayBtn = document.querySelector('.replay-btn')
  const pasBtn = document.getElementById('pasBtn')

  if (guessInput) guessInput.disabled = false
  if (guessBtn) guessBtn.disabled = false
  if (replayBtn) replayBtn.disabled = false
  if (pasBtn) pasBtn.disabled = false

  // Progress göstergesini sıfırla
  mevcutSoruSayisi = 0
  guncelleProgressGosterge()

  // Pas geçilen soruları da sıfırla
  pasGecilenSorular = []

  // Audio player'ı tamamen durdur ve sıfırla
  audioPlayer.pause()
  audioPlayer.currentTime = 0
  audioPlayer.src = '' // Audio source'u temizle
  audioPlayer.load() // Audio'yu yeniden yükle

  if (window.durdurCalmaAnimasyonu) durdurCalmaAnimasyonu()
}

// Global scope'a fonksiyonları ekle
window.tekrarOyna = tekrarOyna
window.anaMenuyeDon = anaMenuyeDon

// Pas butonu event listener
document.getElementById('pasBtn').addEventListener('click', function () {
  // Pas butonunu devre dışı bırak
  this.disabled = true

  // Tüm kontrolleri kilitle (süre dolduğunda olduğu gibi)
  const guessInput = document.querySelector('.tahmin-input')
  const guessBtn = document.querySelector('.tahmin-gonder')
  const replayBtn = document.querySelector('.replay-btn')

  if (guessInput) guessInput.disabled = true
  if (guessBtn) guessBtn.disabled = true
  if (replayBtn) replayBtn.disabled = true

  // Süre sayacını durdur
  clearInterval(sayacInterval)

  // Pas geçilen olarak kaydet
  pasGecilenSorular.push({
    soru: mevcutSoruSayisi,
    sarki: soruListesi[soruIndex].cevap,
  })

  // Albüm kapağı blur'ını kaldır
  if (albumCover) {
    albumCover.style.filter = 'blur(0px)'
  }
  sarkiKutusu.classList.remove('blurred')

  // Pas mesajını göster
  const pasMesaj = document.createElement('div')
  pasMesaj.className = 'pas-mesaj'
  pasMesaj.textContent = 'Pas geçildi! Yeni soruya geçiliyor...'
  pasMesaj.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #ffa726, #ff9800);
    color: white;
    padding: 18px 30px;
    border-radius: 28px;
    font-size: 18px;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 10px 28px rgba(255, 152, 0, 0.45);
    animation: fadeInOut 2s ease-in-out;
  `

  document.body.appendChild(pasMesaj)

  // 2 saniye sonra mesajı kaldır ve yeni soruya geç
  setTimeout(() => {
    // Pas mesajını güvenli bir şekilde kaldır
    if (pasMesaj && pasMesaj.parentNode) {
      pasMesaj.parentNode.removeChild(pasMesaj)
    }

    // Oyun ekranının görünür olup olmadığını kontrol et
    const gameScreen = document.querySelector('.game-screen')
    if (gameScreen.style.display === 'none') {
      // Eğer oyun ekranı görünür değilse (ana menüdeyiz), yeni soruya geçme
      return
    }

    // Oyun sonu kontrolü
    if (mevcutSoruSayisi >= TOPLAM_SORU_SAYISI) {
      // Oyun bitti, sonuç ekranını göster
      oyunSonuGoster()
    } else {
      // Yeni soruya geç
      soruIndex = rastgeleSoruIndex()
      guncelleSoru()
      baslatSayac()
    }
  }, 2000)
})

document.querySelector('.tahmin-gonder').addEventListener('click', function () {
  const input = document.querySelector('.tahmin-input')
  const tahmin = input.value.trim()

  if (cevapDogruMu(tahmin, soruListesi[soruIndex].cevap)) {
    albumCover.style.filter = 'blur(0px)'
    // Blur kaldır
    sarkiKutusu.classList.remove('blurred')

    // Doğru bilinen soruyu kaydet
    dogruBilinenSorular.push({
      soru: mevcutSoruSayisi,
      sarki: soruListesi[soruIndex].cevap,
      puan: puanHesapla(kalanSure),
    })
    dogruSoruSayisi++

    // Puan hesapla ve göster
    const kazanilanPuan = puanHesapla(kalanSure)
    mevcutPuan += kazanilanPuan // Toplam puana ekle
    puanGoster(kazanilanPuan)

    confetti()
    clearInterval(sayacInterval)

    // Tüm kontrolleri kilitle (doğru cevap verildikten sonra)
    const guessInput = document.querySelector('.tahmin-input')
    const guessBtn = document.querySelector('.tahmin-gonder')
    const replayBtn = document.querySelector('.replay-btn')
    const pasBtn = document.getElementById('pasBtn')

    if (guessInput) guessInput.disabled = true
    if (guessBtn) guessBtn.disabled = true
    if (replayBtn) replayBtn.disabled = true
    if (pasBtn) pasBtn.disabled = true

    // Oyun sonu kontrolü
    if (mevcutSoruSayisi >= TOPLAM_SORU_SAYISI) {
      // Oyun bitti, sonuç ekranını göster
      setTimeout(() => {
        puanGizle()
        oyunSonuGoster()
      }, 2000)
    } else {
      // Yeni soruya geç
      yeniSoruTimeout = setTimeout(() => {
        // Oyun ekranının görünür olup olmadığını kontrol et
        const gameScreen = document.querySelector('.game-screen')
        if (gameScreen.style.display === 'none') {
          // Eğer oyun ekranı görünür değilse (ana menüdeyiz), yeni soruya geçme
          return
        }

        // Puanı gizle
        puanGizle()

        soruIndex = rastgeleSoruIndex()
        guncelleSoru()
        baslatSayac()
      }, 2000)
    }
  } else {
    document.body.classList.add('error')
    input.classList.add('shake')

    setTimeout(() => {
      document.body.classList.remove('error')
      input.classList.remove('shake')
    }, 1000)
  }
})

document
  .querySelector('.tahmin-input')
  .addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      document.querySelector('.tahmin-gonder').click()
    }
  })

// Tab tuşu ile pas butonunu çalıştır
document
  .querySelector('.tahmin-input')
  .addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault() // Tab'ın normal davranışını engelle
      document.getElementById('pasBtn').click() // Pas butonunu çalıştır
    }
  })

// ESC tuşu event listener'ı - daha güvenli
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    // Oyun ekranı görünürse ve modal açık değilse
    const gameScreen = document.querySelector('.game-screen')
    const exitModal = document.getElementById('exitWarningModal')

    if (
      gameScreen &&
      gameScreen.style.display !== 'none' &&
      exitModal &&
      !exitModal.classList.contains('show')
    ) {
      showExitWarningModal()
    }
    // ESC ile modalı kapatma özelliği kaldırıldı
  }
})

function guncelleSoru() {
  const soru = soruListesi[soruIndex]

  // Progress göstergesini güncelle (soru sayısını artır)
  // İlk soruda 1 olması için burada artırıyoruz
  mevcutSoruSayisi++
  guncelleProgressGosterge()

  // Blur while playing (apply before updating text to avoid flicker)
  sarkiKutusu.classList.add('blurred')
  sarkiKutusu.textContent = soru.cevap // Veritabanındaki cevap alanını kullan

  // Kilitleri aç
  const tahminInputEl = document.querySelector('.tahmin-input')
  const guessBtn = document.querySelector('.tahmin-gonder')
  const replayBtn = document.querySelector('.replay-btn')
  const pasBtn = document.getElementById('pasBtn')

  if (tahminInputEl) {
    tahminInputEl.value = ''
    tahminInputEl.disabled = false
    tahminInputEl.focus()
  }
  if (guessBtn) guessBtn.disabled = false
  if (replayBtn) replayBtn.disabled = false
  if (pasBtn) pasBtn.disabled = false

  document.getElementById('zamanGoster').textContent = '⏱️ Kalan Süre: 30'

  // Puanı gizle
  puanGizle()

  // Önceki çalmayı durdur ve yeni şarkıyı yükle
  audioPlayer.pause()
  audioPlayer.currentTime = 0
  audioPlayer.src = soru.dosya
  audioPlayer.load()

  try {
    audioPlayer.play().catch((error) => {
      // AbortError'ı yakala (kullanıcı geri butonuna bastığında)
      if (error.name !== 'AbortError') {
        console.log('Şarkı çalma hatası:', error)
      }
    })
  } catch (error) {
    // Genel hata yakalama
    if (error.name !== 'AbortError') {
      console.log('Şarkı çalma hatası:', error)
    }
  }

  // Albüm kapağını güncelle
  if (albumCover) {
    if (soru.kapak) {
      // Önce bulanıklığı uygula, sonra görseli güncelle ve göster
      albumCover.style.filter = `blur(${INITIAL_COVER_BLUR}px)`
      albumCover.src = soru.kapak
      if (albumCoverWrapper) albumCoverWrapper.style.display = 'inline-block'
    } else {
      if (albumCoverWrapper) albumCoverWrapper.style.display = 'none'
    }
  }

  if (window.progressBar) progressBar.style.width = '0%'
  if (window.progressGlow) progressGlow.style.left = '0px'
  if (window.durdurCalmaAnimasyonu) durdurCalmaAnimasyonu()

  audioPlayTimeout = setTimeout(() => {
    try {
      audioPlayer.play().catch((error) => {
        // AbortError'ı yakala (kullanıcı geri butonuna bastığında)
        if (error.name !== 'AbortError') {
          console.log('Şarkı çalma hatası:', error)
        }
      })
    } catch (error) {
      // Genel hata yakalama
      if (error.name !== 'AbortError') {
        console.log('Şarkı çalma hatası:', error)
      }
    }
  }, 150)
}

let kalanSure = 30
let sayacInterval
let yeniSoruTimeout // Yeni soruya geçiş için bekleyen timeout
let mevcutPuan = 0 // Mevcut puan
let audioPlayTimeout // Şarkı çalma için bekleyen timeout

function baslatSayac() {
  // Önceki interval'ı temizle, hızlanmayı önle
  clearInterval(sayacInterval)
  kalanSure = 30
  document.getElementById(
    'zamanGoster'
  ).textContent = `⏱️ Kalan Süre: ${kalanSure}`

  sayacInterval = setInterval(() => {
    kalanSure--
    document.getElementById(
      'zamanGoster'
    ).textContent = `⏱️ Kalan Süre: ${kalanSure}`

    // Albüm kapağı blur seviyesini kalan süreye göre güncelle
    if (albumCoverWrapper && albumCoverWrapper.style.display !== 'none') {
      const blurPx = (kalanSure / 30) * INITIAL_COVER_BLUR
      albumCover.style.filter = `blur(${blurPx}px)`
    }

    if (kalanSure <= 0) {
      clearInterval(sayacInterval)
      // Blur kaldır
      sarkiKutusu.classList.remove('blurred')
      // controls kapat
      guessInput.disabled = true
      guessBtn.disabled = true
      replayBtn.disabled = true
      const pasBtn = document.getElementById('pasBtn')
      if (pasBtn) pasBtn.disabled = true

      albumCover.style.filter = 'blur(0px)'

      // Süre bitti, süre dolan olarak kaydet
      sureDolanSorular.push({
        soru: mevcutSoruSayisi,
        sarki: soruListesi[soruIndex].cevap,
      })

      timeUpEl.classList.add('show')

      setTimeout(() => {
        timeUpEl.classList.remove('show')

        // Oyun ekranının görünür olup olmadığını kontrol et
        const gameScreen = document.querySelector('.game-screen')
        if (gameScreen.style.display === 'none') {
          // Eğer oyun ekranı görünür değilse (ana menüdeyiz), yeni soruya geçme
          return
        }

        // Oyun sonu kontrolü
        if (mevcutSoruSayisi >= TOPLAM_SORU_SAYISI) {
          // Oyun bitti, sonuç ekranını göster
          oyunSonuGoster()
        } else {
          // controls aç
          guessInput.disabled = false
          guessBtn.disabled = false
          replayBtn.disabled = false
          const pasBtn = document.getElementById('pasBtn')
          if (pasBtn) pasBtn.disabled = false
          soruIndex = rastgeleSoruIndex()
          guncelleSoru()
          baslatSayac()
        }
      }, 2000)
    }
  }, 1000)
}

const audioPlayer = document.getElementById('audio-player')
const albumCover = document.getElementById('album-cover')
const albumCoverWrapper = document.querySelector('.album-cover-wrapper')
// Sağ tık ve sürükleme engelle
if (albumCover) {
  albumCover.addEventListener('contextmenu', (e) => e.preventDefault())
  albumCover.addEventListener('dragstart', (e) => e.preventDefault())
}
const INITIAL_COVER_BLUR = 20 // px
const sarkiKutusu = document.querySelector('.sarki-kutusu')
const guessInput = document.querySelector('.tahmin-input')
const guessBtn = document.querySelector('.tahmin-gonder')
const timeUpEl = document.getElementById('time-up')
const noSongsEl = document.getElementById('no-songs')
const alertBoxEl = document.getElementById('alert-box')
const progressBar = document.getElementById('progressBar')
const progressGlow = document.getElementById('progressGlow')
const musicNote = document.getElementById('musicNote')
const replayBtn = document.getElementById('replayBtn')

let progressInterval = null

// --- Şarkı bulunamadı bildirimi yardımcı fonksiyonu ---
function showNoSongsOverlay() {
  if (!noSongsEl) return
  noSongsEl.classList.add('show')
  document.body.classList.add('disabled')
  setTimeout(() => {
    noSongsEl.classList.remove('show')
    document.body.classList.remove('disabled')
  }, 2000)
}

// --- Genel uyarı bildirimi yardımcı fonksiyonu ---
function showAlertOverlay(message) {
  if (!alertBoxEl) return
  alertBoxEl.textContent = message
  alertBoxEl.classList.add('show')
  document.body.classList.add('disabled')
  setTimeout(() => {
    alertBoxEl.classList.remove('show')
    document.body.classList.remove('disabled')
  }, 2000)
}

function baslatCalmaAnimasyonu() {
  if (musicNote) musicNote.classList.add('sallaniyor')
  clearInterval(progressInterval)

  progressInterval = setInterval(() => {
    if (audioPlayer.duration && !audioPlayer.paused) {
      const oran = audioPlayer.currentTime / audioPlayer.duration
      progressBar.style.width = `${oran * 100}%`
      progressGlow.style.left = `calc(${oran * 100}% - 18px)`
    }
  }, 100)
}

function durdurCalmaAnimasyonu() {
  if (musicNote) musicNote.classList.remove('sallaniyor')
  clearInterval(progressInterval)
}

audioPlayer.addEventListener('play', baslatCalmaAnimasyonu)
audioPlayer.addEventListener('pause', durdurCalmaAnimasyonu)
audioPlayer.addEventListener('ended', durdurCalmaAnimasyonu)

replayBtn.addEventListener('click', () => {
  replayBtn.classList.add('donuyor')
  replayBtn.classList.remove('donuyor-surekli')

  audioPlayer.currentTime = 0
  audioPlayer.play()

  setTimeout(() => {
    replayBtn.classList.remove('donuyor')
    if (!audioPlayer.paused) {
      replayBtn.classList.add('donuyor-surekli')
    }
  }, 800)
})

audioPlayer.addEventListener('play', () => {
  setTimeout(() => {
    if (!replayBtn.classList.contains('donuyor')) {
      replayBtn.classList.add('donuyor-surekli')
    }
  }, 820)
})

audioPlayer.addEventListener('pause', () => {
  replayBtn.classList.remove('donuyor-surekli')
})
audioPlayer.addEventListener('ended', () => {
  replayBtn.classList.remove('donuyor-surekli')
})

const volumeBtn = document.getElementById('volumeBtn')
const volumeSlider = document.getElementById('volumeSlider')
const volumeSliderContainer = document.querySelector('.volume-slider-container')
const volumeControl = document.querySelector('.volume-control')

volumeSlider.addEventListener('input', function () {
  audioPlayer.volume = this.value
  // Ses seviyesini localStorage'a kaydet
  localStorage.setItem('songleVolume', this.value)
})

// Kaydedilmiş ses seviyesini yükle
function loadSavedVolume() {
  const savedVolume = localStorage.getItem('songleVolume')
  if (savedVolume !== null) {
    // Kaydedilmiş ses seviyesi varsa uygula
    audioPlayer.volume = parseFloat(savedVolume)
    volumeSlider.value = savedVolume
  }
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  )
}

let volumeTimeout
if (isMobile()) {
  let volumeOpen = false

  volumeBtn.addEventListener('click', function (e) {
    e.stopPropagation()
    volumeOpen = !volumeOpen
    volumeSliderContainer.classList.toggle('active', volumeOpen)
  })

  document.addEventListener('click', function () {
    volumeSliderContainer.classList.remove('active')
    volumeOpen = false
  })

  volumeSliderContainer.addEventListener('click', function (e) {
    e.stopPropagation()
  })
} else {
  volumeControl.addEventListener('mouseenter', () => {
    clearTimeout(volumeTimeout)
    volumeSliderContainer.classList.add('active')
  })
  volumeControl.addEventListener('mouseleave', () => {
    volumeTimeout = setTimeout(() => {
      volumeSliderContainer.classList.remove('active')
    }, 1100)
  })
  volumeSliderContainer.addEventListener('mouseenter', () => {
    clearTimeout(volumeTimeout)
  })
  volumeSliderContainer.addEventListener('mouseleave', () => {
    volumeTimeout = setTimeout(() => {
      volumeSliderContainer.classList.remove('active')
    }, 1100)
  })
}

// Modal butonları için event listener'lar
document.addEventListener('DOMContentLoaded', function () {
  const exitWarningModal = document.getElementById('exitWarningModal')
  const cancelBtn = exitWarningModal.querySelector('.exit-cancel-btn')
  const confirmBtn = exitWarningModal.querySelector('.exit-confirm-btn')

  // İptal butonu - modalı kapat
  cancelBtn.addEventListener('click', function () {
    hideExitWarningModal()
  })

  // Onay butonu - ana menüye dön
  confirmBtn.addEventListener('click', function () {
    exitToMainMenu()
  })

  // Modal dışına tıklayınca kapatma - oyuna devam et
  exitWarningModal.addEventListener('click', function (e) {
    if (e.target === exitWarningModal) {
      hideExitWarningModal() // Modal dışına tıklayınca kapanır ve oyuna devam eder
    }
  })

  // ESC tuşu ile modalı kapat - yukarıda genel ESC handler var
})

// Add user-select none to song box to prevent text selection
const style = document.createElement('style')
style.innerHTML = `
  .sarki-kutusu {
    /* song status box */
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
    width: 240px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 20px;
    overflow: hidden;
    margin: 0;
    font-size: 18px;
    color: #fff;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
`
document.head.appendChild(style)
