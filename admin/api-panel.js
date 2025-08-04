import apiService from '../apiService.js'

let islemKayitlari = []
let sarkiListesi = []
let duzenlenenIndex = null
let siralamaArtan = true
let seciliIndex = null
let silinecekIndex = null
let secilenDeezerSarki = null
let currentPage = 1

// Store dialog elements in variables at the start
const dialogElements = {
  confirmDialog: null,
  songCount: null,
  confirmMessage: null,
  confirmDelete: null,
  confirmCancel: null,
}

// Initialize dialog elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  dialogElements.confirmDialog = document.getElementById('confirmDialog')
  dialogElements.songCount = document.getElementById('songCount')
  dialogElements.confirmMessage = document.getElementById('confirmMessage')
  dialogElements.confirmDelete = document.getElementById('confirmDelete')
  dialogElements.confirmCancel = document.getElementById('confirmCancel')
})

// ----- Tema (Dark/Light) Toggle Ayarları -----
document.addEventListener('DOMContentLoaded', () => {
  const bodyEl = document.getElementById('panelBody')
  const toggleEl = document.getElementById('themeToggle')
  if (!toggleEl) return

  // Kayıtlı tema varsayılanı uygula
  const storedTheme = localStorage.getItem('songleTheme')
  if (storedTheme === 'light') {
    bodyEl.classList.add('light')
    toggleEl.checked = true
  }

  // Değişiklik olduğunda güncelle ve kaydet
  toggleEl.addEventListener('change', () => {
    if (toggleEl.checked) {
      bodyEl.classList.add('light')
      localStorage.setItem('songleTheme', 'light')
    } else {
      bodyEl.classList.remove('light')
      localStorage.setItem('songleTheme', 'dark')
    }
  })
})

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn')
  const logoutConfirmDialog = document.getElementById('logoutConfirmDialog')
  const logoutConfirmBtn = document.getElementById('logoutConfirmBtn')
  const logoutCancelBtn = document.getElementById('logoutCancelBtn')
  let isLoggingOut = false

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!isLoggingOut) {
        logoutConfirmDialog.style.display = 'flex'
      }
    })
  }

  if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', () => {
      logoutConfirmDialog.style.display = 'none'
    })
  }

  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', () => {
      isLoggingOut = true
      logoutConfirmDialog.style.display = 'none'
      // Perform logout after hiding dialog
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 100)
    })
  }
})

// Simple Logout Confirmation
document.addEventListener('DOMContentLoaded', function () {
  const logoutBtn = document.getElementById('logoutBtn')
  const confirmDialog = document.getElementById('logoutConfirmDialog')

  if (logoutBtn && confirmDialog) {
    logoutBtn.addEventListener('click', function (e) {
      e.stopPropagation()
      confirmDialog.style.display = 'flex'
    })

    document
      .getElementById('logoutConfirmBtn')
      .addEventListener('click', function () {
        window.location.href = 'login.html'
      })

    document
      .getElementById('logoutCancelBtn')
      .addEventListener('click', function () {
        confirmDialog.style.display = 'none'
      })

    // Close dialog when clicking outside
    confirmDialog.addEventListener('click', function (e) {
      if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none'
      }
    })
  }
})

// ------- Şarkı Listesi Arama & Kategori Filtre Özelliği -------
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput')
  const katSelect = document.getElementById('filterKategori')
  const altSelect = document.getElementById('filterAltKategori')
  const paginationDiv = document.getElementById('pagination')
  const ITEMS_PER_PAGE = 10

  if (!searchInput && !katSelect) return

  // Initialize search input
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentPage = 1 // Reset to first page when searching
      applyFilters()
    })
  }

  // Kategori değişince alt kategori seçeneklerini doldur
  if (katSelect) {
    katSelect.addEventListener('change', () => {
      const secKat = katSelect.value
      updateSubcategoriesForCategory(secKat, altSelect)
      applyFilters()
    })
  }

  // Alt kategori ve arama input değişimlerini dinle
  if (altSelect) {
    altSelect.addEventListener('change', applyFilters)
  }

  function applyFilters() {
    // Expose for other scripts
    window.applySongFilters = applyFilters

    const filterKategori = document.getElementById('filterKategori').value
    const filterAltKategori = document.getElementById('filterAltKategori').value
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : ''

    const filteredSongs = sarkiListesi.filter((sarki) => {
      // Kategori bilgisini virgülle ayır (birden fazla kategori olabilir)
      const kategoriListesi = (sarki.kategori || '').split(',')

      // Her kategori için kontrol et
      const kategoriEslesmesi = kategoriListesi.some((kategoriStr) => {
        const [kategori, altKategori] = kategoriStr.trim().split('-')

        // Ana kategori filtresi: Seçilen ana kategoriye ait tüm şarkıları göster
        const anaKategoriEslesmesi =
          !filterKategori || kategori === filterKategori

        // Alt kategori filtresi: Eğer alt kategori seçilmişse, sadece o alt kategorideki şarkıları göster
        let altKategoriEslesmesi =
          !filterAltKategori || altKategori === filterAltKategori

        // Eğer "Diğer" kategorisi seçildiyse, sadece gerçekten "Diğer" kategorisinde olan şarkıları göster
        if (filterAltKategori === 'diğer') {
          // Şarkının sadece "diğer" kategorisinde olup olmadığını kontrol et
          const sadeceDigerKategorisinde = kategoriListesi.every((katStr) => {
            const [kat, altKat] = katStr.trim().split('-')
            return altKat === 'diğer'
          })
          altKategoriEslesmesi = sadeceDigerKategorisinde
        }

        return anaKategoriEslesmesi && altKategoriEslesmesi
      })

      const matchesSearch =
        searchText === '' ||
        (sarki.cevap && sarki.cevap.toLowerCase().includes(searchText)) ||
        (sarki.sanatci && sarki.sanatci.toLowerCase().includes(searchText))

      return matchesSearch && kategoriEslesmesi
    })

    const listeDiv = document.getElementById('liste')
    listeDiv.innerHTML = ''

    const ITEMS_PER_PAGE = 10
    const totalPages = Math.max(
      1,
      Math.ceil(filteredSongs.length / ITEMS_PER_PAGE)
    )
    if (currentPage > totalPages) currentPage = totalPages

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    // Show filtered and paginated results
    filteredSongs.slice(startIndex, endIndex).forEach((sarki, index) => {
      const sarkiDiv = document.createElement('div')
      sarkiDiv.className = 'sarki-item'

      // For filtered results, show position in full filtered list (11-20 etc)
      const itemNumber =
        filterKategori || filterAltKategori
          ? startIndex + index + 1
          : startIndex + index + 1

      sarkiDiv.dataset.number = itemNumber
      sarkiDiv.innerHTML = `
        <div class="sarki-select">
          <label>
            <input type="checkbox" class="song-checkbox" data-id="${sarki.id}">
          </label>
        </div>
        <div class="sarki-bilgi">
          <span class="sarki-ad">${sarki.cevap}</span>
          <span class="sarki-kategori">${sarki.kategori}</span>
        </div>
        <div class="sarki-actions">
          <button class="btn btn-edit" onclick="sarkiDuzenle(${sarkiListesi.indexOf(
            sarki
          )})">Düzenle</button>
          <button class="btn btn-delete" onclick="sarkiSil(${
            sarki.id
          })">Sil</button>
        </div>
      `
      // Kategori verilerini dataset olarak ekle
      const kategoriStr = sarki.kategori || ''
      const [anaKat, altKat] = kategoriStr.split('-')
      sarkiDiv.dataset.kategori = anaKat || ''
      sarkiDiv.dataset.alt = altKat || ''

      listeDiv.appendChild(sarkiDiv)
    })

    buildPagination(totalPages)
  }

  // ------- Pagination UI Builder -------
  function buildPagination(totalPages) {
    paginationDiv.innerHTML = ''
    if (totalPages <= 1) return

    // Previous button
    const prevBtn = document.createElement('button')
    prevBtn.textContent = '‹'
    prevBtn.className = 'page-btn prev-btn'
    prevBtn.disabled = currentPage === 1
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--
        applyFilters()
      }
    })
    paginationDiv.appendChild(prevBtn)

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button')
      pageBtn.textContent = i
      pageBtn.className = 'page-btn'
      if (i === currentPage) pageBtn.classList.add('active')
      pageBtn.addEventListener('click', () => {
        if (i !== currentPage) {
          currentPage = i
          applyFilters()
        }
      })
      paginationDiv.appendChild(pageBtn)
    }

    // Next button
    const nextBtn = document.createElement('button')
    nextBtn.textContent = '›'
    nextBtn.className = 'page-btn next-btn'
    nextBtn.disabled = currentPage === totalPages
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++
        applyFilters()
      }
    })
    paginationDiv.appendChild(nextBtn)
  }

  // Apply initial filters on page load
  applyFilters()
})

// Global function for Deezer JSONP callback
window.deezerJsonpSonuc = function (response) {
  const sonuclarUl = deezerResultsList
  sonuclarUl.innerHTML = ''
  deezerResultsModal.style.display = 'flex'

  if (!response.data || response.data.length === 0) {
    sonuclarUl.innerHTML =
      "<div style='padding: 10px; color: #ccc;'>Sonuç bulunamadı</div>"
    return
  }

  response.data.slice(0, 7).forEach((sarki) => {
    if (!sarki.preview) return // Preview'u olmayan şarkıları atla

    const div = document.createElement('div')
    div.style.padding = '10px'
    div.style.borderBottom = '1px solid #444'
    div.style.display = 'flex'
    div.style.justifyContent = 'space-between'
    div.style.alignItems = 'center'

    div.innerHTML = `
      <img src="${
        sarki.album?.cover_small || sarki.artist?.picture_small
      }" alt="" style="width:40px;height:40px;border-radius:4px;object-fit:cover;margin-right:8px;"><div style="flex:1; margin-right: 12px;">
        <div style="font-weight: bold; color: #fff;">${sarki.artist.name}</div>
        <div style="font-size: 0.9em; color: #aaa;">${sarki.title_short}</div>
      </div>
      <button class="ekle-btn" style="background: #4CAF50; color: #fff; border: none; border-radius: 10px; padding: 4px 0; width: 40px; font-size: 0.8em; cursor: pointer; text-align: center;">
        Seç
      </button>
    `

    const btn = div.querySelector('.ekle-btn')
    btn.addEventListener('click', () => {
      secilenDeezerSarki = {
        id: sarki.id,
        artist: sarki.artist.name,
        title: sarki.title_short,
        preview: sarki.preview,
        cover:
          sarki.album?.cover_medium ||
          sarki.album?.cover_big ||
          sarki.album?.cover,
      }
      document.getElementById('sanatciAdi').value = sarki.artist.name
      document.getElementById('sarkiAdi').value = sarki.title_short

      // Preview'u indir ve sunucuya kaydet
      indirVeKaydet(
        sarki.preview,
        `${sarki.artist.name}-${sarki.title_short}.mp3`
      )
        .then((dosyaYolu) => {
          // Gizli bir input alanına dosya yolunu ekle
          let hiddenInput = document.getElementById('dosyaYoluInput')
          if (!hiddenInput) {
            hiddenInput = document.createElement('input')
            hiddenInput.type = 'hidden'
            hiddenInput.id = 'dosyaYoluInput'
            hiddenInput.name = 'dosyaYolu'
            document.querySelector('.ekle-formu').appendChild(hiddenInput)
          }
          hiddenInput.value = dosyaYolu
          showSuccessToast('Şarkı başarıyla indirildi!')
        })
        .catch((error) => {
          console.error('Şarkı indirilirken hata oluştu:', error)
          showGuncelleToast('Şarkı indirilirken hata oluştu!')
        })

      deezerResultsModal.style.display = 'none'
    })

    sonuclarUl.appendChild(div)
  })
}

// Deezer'dan şarkı arama fonksiyonu
async function deezerAra(sorgu) {
  const sonuclarUl = deezerResultsList
  sonuclarUl.innerHTML =
    "<div style='padding: 10px; color: #ccc;'>Aranıyor...</div>"
  deezerResultsModal.style.display = 'flex'

  // Önceki script etiketini kaldır (eğer varsa)
  const eskiScript = document.getElementById('deezerScript')
  if (eskiScript) {
    document.head.removeChild(eskiScript)
  }

  // JSONP isteği için yeni script etiketi oluştur
  const script = document.createElement('script')
  script.id = 'deezerScript'
  script.src = `https://api.deezer.com/search?q=${encodeURIComponent(
    sorgu
  )}&output=jsonp&callback=deezerJsonpSonuc`
  document.head.appendChild(script)
}

// URL'den dosyayı indirip sunucuya kaydet
async function indirVeKaydet(url, dosyaAdi) {
  try {
    // Özel karakterleri temizle ve dosya adını güvenli hale getir
    const guvenliDosyaAdi = dosyaAdi
      .replace(/[^\w\s.-]/gi, '')
      .replace(/\s+/g, '_')
    const dosyaYolu = `songs/${guvenliDosyaAdi}`

    // Sunucuya dosyayı kaydetmek için bir endpoint'e gönder
    const response = await fetch('save_audio.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl: url,
        fileName: guvenliDosyaAdi,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Dosya kaydedilirken bir hata oluştu')
    }

    return dosyaYolu // Sadece dosya yolunu döndür
  } catch (error) {
    console.error('Dosya indirilirken hata oluştu:', error)
    throw error
  }
}

// Toast mesajları
function showGuncelleToast(msg) {
  const toast = document.getElementById('guncelleToast')
  const toastMsg = document.getElementById('guncelleToastMsg')
  toastMsg.textContent = msg
  toast.classList.add('show')
  setTimeout(() => {
    toast.classList.remove('show')
  }, 3000)
}

function showSuccessToast(msg) {
  const toast = document.getElementById('successToast')
  const toastMsg = document.getElementById('successToastMsg')
  toastMsg.textContent = msg
  toast.classList.add('show')
  setTimeout(() => {
    toast.classList.remove('show')
  }, 3000)
}

function showDeleteToast(msg) {
  const toast = document.getElementById('deleteToast')
  const toastMsg = document.getElementById('deleteToastMsg')
  toastMsg.textContent = msg
  toast.classList.add('show')
  setTimeout(() => {
    toast.classList.remove('show')
  }, 3000)
}

// --------- Merkez Uyarı Fonksiyonu ---------
function showCenterAlert(msg) {
  let overlay = document.getElementById('formAlertModal')
  if (!overlay) {
    // Stil ekle (yalnızca ilk sefer)
    const style = document.createElement('style')
    style.textContent = `
      .center-alert-content {
        background: linear-gradient(135deg, #6c5ce7 0%, #a259c7 100%);
        color: #ffffff;
        padding: 28px 32px 24px 32px;
        border-radius: 22px;
        width: 340px;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 0 14px rgba(255,255,255,0.06);
        animation: modalPop 0.35s cubic-bezier(.22,.82,.46,1.02);
      }
      .center-alert-content button {
        margin-top: 20px;
        padding: 10px 26px;
        border-radius: 28px;
        border: none;
        background: #ffffff;
        color: #6c5ce7;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.25s, color 0.25s;
      }
      .center-alert-content button:hover {
        background: #6c5ce7;
        color: #ffffff;
      }
      .center-alert-content button.cancel {
        background: transparent;
        color: #ffffff;
        border: 1px solid rgba(255,255,255,0.3);
        margin-right: 10px;
      }
      .center-alert-content button.cancel:hover {
        background: rgba(255,255,255,0.1);
        color: #ffffff;
      }
      .center-alert-content button.delete {
        background: #ffffff;
        color: #6c5ce7;
        border: none;
      }
      .center-alert-content button.delete:hover {
        background: #6c5ce7;
        color: #ffffff;
      }
    `
    document.head.appendChild(style)

    overlay = document.createElement('div')
    overlay.id = 'formAlertModal'
    overlay.className = 'modal-overlay'
    overlay.style.display = 'none'
    overlay.innerHTML = `
      <div class="center-alert-content">
        <h3 style="margin-top:0; font-size:22px; letter-spacing:.3px;">Uyarı</h3>
        <p id="formAlertMessage" style="margin:14px 0 0 0; font-size:17px; line-height:1.45;"></p>
        <button id="formAlertOkBtn">Tamam</button>
      </div>`
    document.body.appendChild(overlay)

    // Dış alana tıklanınca veya butona basınca kapat
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none'
    })
    overlay.querySelector('#formAlertOkBtn').addEventListener('click', () => {
      overlay.style.display = 'none'
    })
  }
  overlay.querySelector('#formAlertMessage').textContent = msg
  overlay.style.display = 'flex'
}

// --------- Modern Uyarı Fonksiyonu ---------
function showModernAlert(msg, type = 'info') {
  let overlay = document.getElementById('modernAlertModal')
  if (!overlay) {
    // Stil ekle (yalnızca ilk sefer)
    const style = document.createElement('style')
    style.textContent = `
      .modern-alert-content {
        background: linear-gradient(135deg, #2a2a4a 0%, #1e1e3c 100%);
        color: #ffffff;
        padding: 32px 40px 28px 40px;
        border-radius: 24px;
        width: 380px;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.05);
        animation: modernAlertPop 0.4s cubic-bezier(.22,.82,.46,1.02);
        border: 1px solid rgba(255,255,255,0.1);
        position: relative;
        overflow: hidden;
      }
      .modern-alert-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #4caf50, #66bb6a);
      }
      .modern-alert-content.warning::before {
        background: linear-gradient(90deg, #ff9800, #ffb74d);
      }
      .modern-alert-content.error::before {
        background: linear-gradient(90deg, #f44336, #ef5350);
      }
      .modern-alert-content.info::before {
        background: linear-gradient(90deg, #2196f3, #42a5f5);
      }
      .modern-alert-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
      }
      .modern-alert-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        letter-spacing: 0.5px;
      }
      .modern-alert-message {
        font-size: 16px;
        line-height: 1.6;
        color: #e0e0e0;
        margin-bottom: 24px;
      }
      .modern-alert-button {
        padding: 12px 32px;
        border-radius: 30px;
        border: none;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #6c5ce7 0%, #a259c7 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
      }
      .modern-alert-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
      }
      @keyframes modernAlertPop {
        0% {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `
    document.head.appendChild(style)

    overlay = document.createElement('div')
    overlay.id = 'modernAlertModal'
    overlay.className = 'modal-overlay'
    overlay.style.display = 'none'
    overlay.innerHTML = `
      <div class="modern-alert-content">
        <div class="modern-alert-icon" id="modernAlertIcon">ℹ️</div>
        <h3 class="modern-alert-title" id="modernAlertTitle">Bilgi</h3>
        <p class="modern-alert-message" id="modernAlertMessage"></p>
        <button class="modern-alert-button" id="modernAlertOkBtn">Tamam</button>
      </div>`
    document.body.appendChild(overlay)

    // Dış alana tıklanınca veya butona basınca kapat
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none'
    })
    overlay.querySelector('#modernAlertOkBtn').addEventListener('click', () => {
      overlay.style.display = 'none'
    })
  }

  // Uyarı tipine göre içeriği güncelle
  const content = overlay.querySelector('.modern-alert-content')
  const icon = overlay.querySelector('#modernAlertIcon')
  const title = overlay.querySelector('#modernAlertTitle')
  const message = overlay.querySelector('#modernAlertMessage')

  // Tip'e göre stil ve içerik ayarla
  content.className = `modern-alert-content ${type}`

  if (type === 'warning') {
    icon.textContent = '⚠️'
    title.textContent = 'Uyarı'
  } else if (type === 'error') {
    icon.textContent = '❌'
    title.textContent = 'Hata'
  } else if (type === 'success') {
    icon.textContent = '✅'
    title.textContent = 'Başarılı'
  } else {
    icon.textContent = 'ℹ️'
    title.textContent = 'Bilgi'
  }

  message.textContent = msg
  overlay.style.display = 'flex'
}

// Şarkı listesini güncelle
async function guncelleListe(page = 1) {
  try {
    // Calculate starting number for current page
    const itemsPerPage = 10
    const startNumber = (page - 1) * itemsPerPage + 1

    sarkiListesi = await apiService.getSongs()
    const listeDiv = document.getElementById('liste')
    listeDiv.innerHTML = ''

    sarkiListesi.forEach((sarki, index) => {
      const currentNumber = startNumber + index
      const sarkiDiv = document.createElement('div')
      sarkiDiv.className = 'sarki-item'
      sarkiDiv.dataset.number = currentNumber
      sarkiDiv.innerHTML = `
        <div class="sarki-select">
          <label>
            <input type="checkbox" class="song-checkbox" data-id="${sarki.id}">
          </label>
        </div>
        <div class="sarki-bilgi">
          <span class="sarki-ad">${sarki.cevap}</span>
          <span class="sarki-kategori">${sarki.kategori}</span>
        </div>
        <div class="sarki-actions">
          <button class="btn btn-edit" onclick="sarkiDuzenle(${index})">Düzenle</button>
          <button class="btn btn-delete" onclick="sarkiSil(${sarki.id})">Sil</button>
        </div>
      `
      // Kategori verilerini dataset olarak ekle
      const kategoriStr = sarki.kategori || ''
      const [anaKat, altKat] = kategoriStr.split('-')
      sarkiDiv.dataset.kategori = anaKat || ''
      sarkiDiv.dataset.alt = altKat || ''

      listeDiv.appendChild(sarkiDiv)
    })

    // Build pagination based on latest list
    if (window.applySongFilters) {
      window.applySongFilters()
    }
  } catch (error) {
    console.error('Error updating song list:', error)
    showGuncelleToast('Şarkı listesi güncellenirken hata oluştu')
  }
}

// Kategoriler yönetimi
let tumKategoriler = []
let aktifFiltre = 'ana' // 'ana' veya 'alt'

// Global fonksiyonlar (onclick için)
window.kategoriDuzenle = function (kategoriId) {
  const kategori = tumKategoriler.find((k) => k.id == kategoriId)
  if (!kategori) return

  // Modal oluştur
  const modal = document.createElement('div')
  modal.className = 'kategori-modal'
  modal.innerHTML = `
    <div class="kategori-modal-content">
      <h3>Kategori Düzenle</h3>
      <div class="form-row">
        <input type="text" id="duzenleKategoriAdi" value="${
          kategori.isim
        }" placeholder="Kategori Adı" />
      </div>
      <div class="form-row">
        <select id="duzenleKategoriParent">
          <option value="">Ana Kategori</option>
          ${tumKategoriler
            .filter(
              (k) =>
                (k.parent_id === null || k.parent_id === '') &&
                k.id != kategoriId
            )
            .map(
              (k) =>
                `<option value="${k.id}" ${
                  kategori.parent_id == k.id ? 'selected' : ''
                }>${k.isim}</option>`
            )
            .join('')}
        </select>
      </div>
      <div class="kategori-modal-buttons">
        <button class="kategori-modal-btn cancel" onclick="kategoriModalKapat()">İptal</button>
        <button class="kategori-modal-btn save" onclick="kategoriKaydet(${kategoriId})">Kaydet</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  setTimeout(() => modal.classList.add('active'), 10)
}

window.kategoriSil = async function (kategoriId) {
  const kategori = tumKategoriler.find((k) => k.id == kategoriId)
  if (!kategori) return

  // Alt kategorileri kontrol et
  const altKategoriler = tumKategoriler.filter((k) => k.parent_id == kategoriId)
  if (altKategoriler.length > 0) {
    showCenterAlert(
      'Bu kategoriye bağlı alt kategoriler var. Önce onları silin!'
    )
    return
  }

  // Modal'ı göster
  const modal = document.getElementById('kategoriSilModal')
  const message = document.getElementById('kategoriSilMessage')
  const confirmBtn = document.getElementById('kategoriSilConfirm')
  const cancelBtn = document.getElementById('kategoriSilCancel')

  message.textContent = `"${kategori.isim}" kategorisini silmek istediğinizden emin misiniz?`

  modal.classList.add('active')

  // Event listeners
  const handleConfirm = async () => {
    try {
      await apiService.deleteKategori(kategoriId)
      tumKategoriler = tumKategoriler.filter((k) => k.id != kategoriId)
      kategorileriGoster()

      // Kategori seçim alanlarını güncelle
      updateCategorySelects()

      showDeleteToast('Kategori başarıyla silindi!')
    } catch (error) {
      console.error('Error deleting category:', error)
      showGuncelleToast('Kategori silinirken hata oluştu')
    } finally {
      modal.classList.remove('active')
      // Event listener'ları temizle
      confirmBtn.removeEventListener('click', handleConfirm)
      cancelBtn.removeEventListener('click', handleCancel)
      modal.removeEventListener('click', handleModalClick)
    }
  }

  const handleCancel = () => {
    modal.classList.remove('active')
    // Event listener'ları temizle
    confirmBtn.removeEventListener('click', handleConfirm)
    cancelBtn.removeEventListener('click', handleCancel)
    modal.removeEventListener('click', handleModalClick)
  }

  const handleModalClick = (e) => {
    if (e.target === modal) {
      handleCancel()
    }
  }

  // Event listener'ları ekle
  confirmBtn.addEventListener('click', handleConfirm)
  cancelBtn.addEventListener('click', handleCancel)
  modal.addEventListener('click', handleModalClick)
}

window.kategoriKaydet = async function (kategoriId) {
  const adi = document.getElementById('duzenleKategoriAdi').value.trim()
  const parentId = document.getElementById('duzenleKategoriParent').value

  if (!adi) {
    showCenterAlert('Lütfen kategori adını girin!')
    return
  }

  try {
    const kategoriIndex = tumKategoriler.findIndex((k) => k.id == kategoriId)
    if (kategoriIndex === -1) return

    const guncellemeData = {
      isim: adi,
      parent_id: parentId || null,
    }

    const result = await apiService.updateKategori(kategoriId, guncellemeData)

    // Backend'den gelen güncellenmiş kategoriyi kullan
    const guncellemisKategori = result.data || result

    // Local array'i güncelle
    tumKategoriler[kategoriIndex] = guncellemisKategori

    kategoriModalKapat()
    kategorileriGoster()

    // Kategori seçim alanlarını güncelle
    updateCategorySelects()

    showSuccessToast('Kategori başarıyla güncellendi!')
  } catch (error) {
    console.error('Error updating category:', error)
    showGuncelleToast('Kategori güncellenirken hata oluştu')
  }
}

window.kategoriModalKapat = function () {
  const modal = document.querySelector('.kategori-modal')
  if (modal) {
    modal.classList.remove('active')
    setTimeout(() => modal.remove(), 300)
  }
}

async function getKategoriler() {
  try {
    // Ana kategorileri al
    const anaKategorilerResponse = await apiService.getKategoriler('1')
    const altKategorilerResponse = await apiService.getKategoriler('0')

    // Response'dan data'yı al
    const anaKategoriler = anaKategorilerResponse.data || anaKategorilerResponse
    const altKategoriler = altKategorilerResponse.data || altKategorilerResponse

    tumKategoriler = [...anaKategoriler, ...altKategoriler]

    // Parent select'i doldur
    const parentSelect = document.getElementById('yeniKategoriParent')
    parentSelect.innerHTML = '<option value="">Ana Kategori</option>'

    anaKategoriler.forEach((kategori) => {
      const option = document.createElement('option')
      option.value = kategori.id
      option.textContent = kategori.isim
      parentSelect.appendChild(option)
    })

    kategorileriGoster()

    // Kategori seçim alanlarını güncelle
    updateCategorySelects()
  } catch (error) {
    console.error('Error fetching categories:', error)
    showGuncelleToast('Kategoriler alınamadı')
  }
}

function kategorileriGoster() {
  const kategorilerDiv = document.getElementById('getKategoriler')
  kategorilerDiv.innerHTML = ''

  const filtrelenmisKategoriler = tumKategoriler.filter((kategori) => {
    if (aktifFiltre === 'ana') {
      return kategori.parent_id === null || kategori.parent_id === ''
    } else {
      return kategori.parent_id !== null && kategori.parent_id !== ''
    }
  })

  filtrelenmisKategoriler.forEach((kategori) => {
    const kategoriDiv = document.createElement('div')
    kategoriDiv.className = 'kategori-item'

    const parentKategori = kategori.parent_id
      ? tumKategoriler.find((k) => k.id == kategori.parent_id)
      : null

    kategoriDiv.innerHTML = `
      <div class="kategori-content">
        <div class="kategori-info">
          <div class="kategori-ad">${kategori.isim}</div>
          <div class="kategori-tip">
            ${
              kategori.parent_id
                ? `Alt Kategori (${
                    parentKategori?.isim || kategori.parent_isim || 'Bilinmeyen'
                  })`
                : 'Ana Kategori'
            }
          </div>
        </div>
        <div class="kategori-actions">
          <button class="kategori-btn edit" onclick="kategoriDuzenle(${
            kategori.id
          })">
            Düzenle
          </button>
          <button class="kategori-btn delete" onclick="kategoriSil(${
            kategori.id
          })">
            Sil
          </button>
        </div>
      </div>
    `
    kategorilerDiv.appendChild(kategoriDiv)
  })
}

// Kategori ekleme
async function kategoriEkle() {
  const adi = document.getElementById('yeniKategoriAdi').value.trim()
  const parentId = document.getElementById('yeniKategoriParent').value

  if (!adi) {
    showCenterAlert('Lütfen kategori adını girin!')
    return
  }

  try {
    const yeniKategori = {
      isim: adi,
      parent_id: parentId || null,
    }

    const result = await apiService.addKategori(yeniKategori)

    // Backend'den gelen ID ile yeni kategori objesi oluştur
    const yeniKategoriObj = {
      id: result.data?.id || result.id,
      isim: adi,
      parent_id: parentId || null,
      tip: parentId ? 'Alt Kategori' : 'Ana Kategori',
    }

    tumKategoriler.push(yeniKategoriObj)

    // Formu temizle
    document.getElementById('yeniKategoriAdi').value = ''
    document.getElementById('yeniKategoriParent').value = ''

    // Listeyi güncelle
    kategorileriGoster()

    // Kategori seçim alanlarını güncelle
    updateCategorySelects()

    showSuccessToast('Kategori başarıyla eklendi!')
  } catch (error) {
    console.error('Error adding category:', error)
    showGuncelleToast('Kategori eklenirken hata oluştu')
  }
}

// Filtre değiştirme
function filtreDegistir(tip) {
  aktifFiltre = tip

  // Butonları güncelle
  document
    .getElementById('anaKategorilerBtn')
    .classList.toggle('active', tip === 'ana')
  document
    .getElementById('altKategorilerBtn')
    .classList.toggle('active', tip === 'alt')

  kategorileriGoster()
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Kategori ekleme butonu
  const kategoriEkleBtn = document.getElementById('kategoriEkleBtn')
  if (kategoriEkleBtn) {
    kategoriEkleBtn.addEventListener('click', kategoriEkle)
  }

  // Filtre butonları
  const anaKategorilerBtn = document.getElementById('anaKategorilerBtn')
  const altKategorilerBtn = document.getElementById('altKategorilerBtn')

  if (anaKategorilerBtn) {
    anaKategorilerBtn.addEventListener('click', () => filtreDegistir('ana'))
  }

  if (altKategorilerBtn) {
    altKategorilerBtn.addEventListener('click', () => filtreDegistir('alt'))
  }

  // Modal dışına tıklama
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('kategori-modal')) {
      kategoriModalKapat()
    }
  })

  // Sayfa yüklendiğinde kategorileri yükle
  getKategoriler()
})

// Şarkı ekleme işlemi
document.getElementById('ekleBtn').addEventListener('click', async () => {
  const sarki = document.getElementById('sarkiAdi').value.trim()
  const kategori = document.getElementById('kategori').value
  const altKategori = document.getElementById('altKategori').value
  const mp3File = document.getElementById('mp3File').files[0]
  const deezerFilePath = document.getElementById('dosyaYoluInput')?.value

  // Dosya kontrolü
  if (!mp3File && !deezerFilePath) {
    showCenterAlert(
      "Lütfen bir şarkı dosyası yükleyin veya Deezer'dan şarkı seçin!"
    )
    return
  }

  if (!sarki || !kategori) {
    showCenterAlert('Lütfen tüm alanları doldurun!')
    return
  }

  // Alt kategori kontrolü (sadece Türkçe ve Yabancı için opsiyonel)
  const anaKategori = kategori
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('ü', 'u')
    .replace('ç', 'c')
    .replace('ı', 'i')
  const altKategoriSecildi = altKategori && altKategori.trim() !== ''

  // Türkçe ve Yabancı dışındaki kategoriler için alt kategori zorunlu
  if (
    anaKategori !== 'turkce' &&
    anaKategori !== 'yabanci' &&
    !altKategoriSecildi
  ) {
    showModernAlert('Lütfen alt kategori seçiniz!', 'warning')
    return
  }

  // Eğer alt kategori seçildiyse tam kategori oluştur, yoksa sadece ana kategori
  const tamKategori = altKategoriSecildi
    ? `${kategori}-${altKategori.toLowerCase().replace(' ', '')}`
    : kategori

  try {
    let dosyaYolu = deezerFilePath

    // Eğer dosya yüklendiyse, onu işle
    if (mp3File) {
      const formData = new FormData()
      formData.append('audio', mp3File)
      formData.append(
        'fileName',
        mp3File.name.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_')
      )

      const response = await fetch('save_audio.php', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Dosya yüklenirken bir hata oluştu')
      }

      const result = await response.json()
      dosyaYolu = result.filePath
    }
    let kapakYolu = null
    if (secilenDeezerSarki) {
      const response = await fetch(secilenDeezerSarki.cover)
      const blob = await response.blob()
      const file = new File([blob], secilenDeezerSarki.cover, {
        type: blob.type,
      })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('song_id', secilenDeezerSarki.id)

      const uploadResponse = await fetch('save_photo.php', {
        method: 'POST',
        body: formData,
      })

      const result = await uploadResponse.json()
      kapakYolu = result.kapak
    }

    // Ana kategoriyi belirle (Türkçe, Yabancı vs.)
    const anaKategori = kategori.toLowerCase()

    // "Diğer" kategorisini bul
    const digerKategori = tumKategoriler.find(
      (kat) =>
        kat.isim.toLowerCase() === 'diğer' &&
        kat.parent_id &&
        tumKategoriler.find(
          (parent) =>
            parent.id == kat.parent_id &&
            parent.isim.toLowerCase().replace(/\s+/g, '') === anaKategori
        )
    )

    // Kategori bilgisini oluştur
    let kategoriBilgisi = tamKategori

    // Eğer "Diğer" kategorisi varsa ve alt kategori seçilmediyse, sadece "Diğer" kategorisinde kaydet
    if (digerKategori && !altKategoriSecildi) {
      const digerKategoriAdi = `${anaKategori}-diğer`
      kategoriBilgisi = digerKategoriAdi
    }
    // Eğer alt kategori seçildiyse, hem spesifik hem de "Diğer" kategorisinde kaydet
    else if (digerKategori && altKategoriSecildi) {
      const digerKategoriAdi = `${anaKategori}-diğer`
      kategoriBilgisi = `${tamKategori},${digerKategoriAdi}`
    }

    const songData = {
      kategori: kategoriBilgisi,
      cevap: sarki,
      sarki: ' ' + sarki + '',
      dosya: dosyaYolu,
      kapak: kapakYolu,
    }

    // Şarkıyı ekle
    await apiService.addSong(songData)
    showSuccessToast(' Şarkı başarıyla eklendi!')

    // Formu temizle
    document.getElementById('sanatciAdi').value = ''
    document.getElementById('sarkiAdi').value = ''
    document.getElementById('kategori').value = ''
    document.getElementById('altKategori').innerHTML =
      '<option value="">Alt Kategori Seç</option>'
    document.getElementById('altKategori').style.display = 'none'
    document.getElementById('mp3File').value = ''

    // Listeyi güncelle
    await guncelleListe()
  } catch (error) {
    console.error('Hata:', error)
    showGuncelleToast('Hata: ' + error.message)
  }
})

// Şarkı silme işlemi
async function sarkiSil(sarkiId) {
  const confirmed = await silSarki(sarkiId)
  if (!confirmed) return

  try {
    const index = sarkiListesi.findIndex((song) => song.id == sarkiId)
    const songId = sarkiListesi[index].id
    // Burada API'den silme işlemi yapılacak
    await apiService.deleteSong(songId)
    // dosyayı sil
    const dosyaYolu = sarkiListesi[index].dosya
    const kapakYolu = sarkiListesi[index].kapak

    showSuccessToast('Şarkı başarıyla silindi')

    // dosyayı sil
    const response = await fetch('delete_file.php', {
      method: 'POST',
      body: JSON.stringify({ filePath: dosyaYolu }),
    })

    // dosyayı sil
    const response2 = await fetch('delete_file.php', {
      method: 'POST',
      body: JSON.stringify({ filePath: kapakYolu }),
    })

    await guncelleListe()

    // If last item on page was deleted, go to previous page
    const listeDiv = document.getElementById('liste')
    if (listeDiv.children.length === 0 && currentPage > 1) {
      currentPage--
      await guncelleListe(currentPage)
    }
  } catch (error) {
    console.error('Silme hatası:', error)
    showGuncelleToast('Silme işlemi sırasında hata oluştu')
  }
}

async function silSarki(sarkiId) {
  if (
    !dialogElements.confirmDialog ||
    !dialogElements.songCount ||
    !dialogElements.confirmMessage
  ) {
    console.error('Dialog elements not initialized')
    return false
  }

  // Show custom confirmation dialog
  dialogElements.songCount.textContent = 1
  dialogElements.confirmMessage.textContent =
    'Seçilen şarkı silinecek. Emin misiniz?'
  dialogElements.confirmDialog.style.display = 'flex'

  // Wait for user confirmation
  return new Promise((resolve) => {
    const handleConfirm = () => {
      dialogElements.confirmDelete.removeEventListener('click', handleConfirm)
      dialogElements.confirmCancel.removeEventListener('click', handleCancel)
      dialogElements.confirmDialog.style.display = 'none'
      resolve(true)
    }

    const handleCancel = () => {
      dialogElements.confirmDelete.removeEventListener('click', handleConfirm)
      dialogElements.confirmCancel.removeEventListener('click', handleCancel)
      dialogElements.confirmDialog.style.display = 'none'
      resolve(false)
    }

    dialogElements.confirmDelete.addEventListener('click', handleConfirm)
    dialogElements.confirmCancel.addEventListener('click', handleCancel)
  })
}

// Batch delete functionality
const batchControls = document.getElementById('batchControls')
const selectedCount = document.getElementById('selectedCount')
const btnBatchDelete = document.getElementById('btnBatchDelete')
const confirmDialog = document.getElementById('confirmDialog')
const confirmMessage = document.getElementById('confirmMessage')
const songCount = document.getElementById('songCount')
const confirmCancel = document.getElementById('confirmCancel')
const confirmDelete = document.getElementById('confirmDelete')

// Toggle batch controls when checkboxes are clicked
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('song-checkbox')) {
    const checkedBoxes = document.querySelectorAll('.song-checkbox:checked')
    if (checkedBoxes.length > 0) {
      batchControls.classList.add('show')
      selectedCount.textContent = `${checkedBoxes.length} şarkı seçildi`
    } else {
      batchControls.classList.remove('show')
    }
  }
})

// Handle batch delete
btnBatchDelete.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.song-checkbox:checked')
  if (checkboxes.length === 0) return

  // Show custom confirmation dialog
  songCount.textContent = checkboxes.length
  confirmDialog.style.display = 'flex'
})

// Confirm delete
confirmDelete.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.song-checkbox:checked')
  confirmDialog.style.display = 'none'

  try {
    const deletePromises = []
    checkboxes.forEach((checkbox) => {
      const songId = checkbox.dataset.id
      const index = sarkiListesi.findIndex((song) => song.id == songId)
      // dosyayı sil
      const dosyaYolu = sarkiListesi[index].dosya
      const kapakYolu = sarkiListesi[index].kapak

      showSuccessToast('Şarkı başarıyla silindi')

      // dosyayı sil
      const response = fetch('delete_file.php', {
        method: 'POST',
        body: JSON.stringify({ filePath: dosyaYolu }),
      })

      // dosyayı sil
      const response2 = fetch('delete_file.php', {
        method: 'POST',
        body: JSON.stringify({ filePath: kapakYolu }),
      })
      deletePromises.push(apiService.deleteSong(songId))
    })

    await Promise.all(deletePromises)
    showSuccessToast(`${checkboxes.length} şarkı başarıyla silindi`)
    await guncelleListe(currentPage)
    batchControls.classList.remove('show')
  } catch (error) {
    console.error('Batch delete error:', error)
    showGuncelleToast('Silme işlemi sırasında hata oluştu')
  }
})

// Cancel delete
confirmCancel.addEventListener('click', () => {
  confirmDialog.style.display = 'none'
})

// Close dialog when clicking outside
confirmDialog.addEventListener('click', (e) => {
  if (e.target === confirmDialog) {
    confirmDialog.style.display = 'none'
  }
})

// Alt kategorileri tanımla
const altKategoriler = {
  turkce: ['Rock', 'Pop', 'Hip Hop'],
  yabanci: ['Rock', 'Pop', 'Hip Hop'],
  dizi: ['Türkçe', 'Yabancı'],
  film: ['Türkçe', 'Yabancı'],
}

// Kategori değiştiğinde alt kategorileri güncelle (şarkı ekleme kısmı için)
document.getElementById('kategori').addEventListener('change', function () {
  const kategori = this.value
  updateSubcategoriesForSongAdd(
    kategori,
    document.getElementById('altKategori')
  )
})

// Dosya yükleme işlemleri
document.getElementById('dosyaYukleBtn').addEventListener('click', () => {
  document.getElementById('mp3File').click()
})

// Sadece şarkı adını doldur, dosyayı form gönderimine bırak
document.getElementById('mp3File').addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Şarkı adını otomatik doldur (uzantıyı kaldırarak)
  const songName = file.name.replace(/\.mp3$/i, '')
  document.getElementById('sarkiAdi').value = songName

  showSuccessToast('Dosya seçildi! Şimdi formu gönderebilirsiniz.')
})

// Deezer arama butonuna tıklama olayı ekle
// Deezer arama modal öğeleri
const deezerModal = document.getElementById('deezerSearchModal')
const deezerSearchInput = document.getElementById('deezerSearchInput')
const deezerSearchGo = document.getElementById('deezerSearchGo')
const deezerSearchCancel = document.getElementById('deezerSearchCancel')

// Deezer sonuç modal öğeleri
const deezerResultsModal = document.getElementById('deezerResultsModal')
const deezerResultsList = document.getElementById('deezerResultsList')
const deezerResultsClose = document.getElementById('deezerResultsClose')

deezerResultsClose.addEventListener('click', () => {
  deezerResultsModal.style.display = 'none'
})

// Modal dışına tıklanınca kapat (sonuçlar)
deezerResultsModal.addEventListener('click', (e) => {
  if (e.target === deezerResultsModal) {
    deezerResultsModal.style.display = 'none'
  }
})

function openDeezerModal() {
  deezerSearchInput.value = ''
  deezerModal.style.display = 'flex'
  // input'u odakla
  setTimeout(() => deezerSearchInput.focus(), 0)
}

function closeDeezerModal() {
  deezerModal.style.display = 'none'
}

// Deezer arama butonuna tıklama olayı ekle
document.getElementById('deezerAraBtn').addEventListener('click', () => {
  openDeezerModal()
})

deezerSearchCancel.addEventListener('click', closeDeezerModal)

deezerSearchGo.addEventListener('click', () => {
  const query = deezerSearchInput.value.trim()
  if (query) {
    closeDeezerModal()
    deezerAra(query)
  } else {
    deezerSearchInput.focus()
  }
})

// Enter tuşuna basıldığında da arama yap
deezerSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    deezerSearchGo.click()
  }
})

// Modal dışına tıklanınca kapat
deezerModal.addEventListener('click', (e) => {
  if (e.target === deezerModal) {
    closeDeezerModal()
  }
})

async function checkLogin() {
  const adminGiris = localStorage.getItem('adminGiris')
  if (!adminGiris) {
    window.location.href = 'login.html'
  }
}

// Global scope'a fonksiyonları ekle
window.sarkiSil = sarkiSil
window.sarkiDuzenle = function (index) {
  const song = sarkiListesi[index]

  // Get modal elements
  const modal = document.getElementById('sarkiDuzenleModal')
  const songIdInput = document.getElementById('duzenleSarkiId')
  const songNameInput = document.getElementById('duzenleSarkiAdi')
  const categorySelect = document.getElementById('duzenleKategori')
  const subcategorySelect = document.getElementById('duzenleAltKategori')

  // Populate fields with song data
  songIdInput.value = song.id
  songNameInput.value = song.cevap

  // Parse category and subcategory (ilk kategoriyi al)
  const kategoriListesi = song.kategori ? song.kategori.split(',') : ['']
  const [category, subcategory] = kategoriListesi[0].split('-')

  // Kategori ismini kategori ID'sine çevir
  const categoryName = category || ''
  const matchingCategory = tumKategoriler.find(
    (kat) =>
      kat.isim.toLowerCase().replace(/\s+/g, '') === categoryName ||
      kat.isim.toLowerCase() === categoryName
  )

  if (matchingCategory) {
    categorySelect.value = matchingCategory.isim
      .toLowerCase()
      .replace(/\s+/g, '')
  } else {
    categorySelect.value = categoryName
  }

  // Update subcategories based on category
  const selectedCategoryValue = matchingCategory
    ? matchingCategory.isim.toLowerCase().replace(/\s+/g, '')
    : categoryName
  updateSubcategoriesForCategory(selectedCategoryValue, subcategorySelect)

  // Alt kategori ismini de eşleştir
  if (subcategory) {
    const matchingSubcategory = tumKategoriler.find(
      (kat) =>
        kat.isim.toLowerCase().replace(/\s+/g, '') === subcategory ||
        kat.isim.toLowerCase() === subcategory
    )

    if (matchingSubcategory) {
      subcategorySelect.value = matchingSubcategory.isim
        .toLowerCase()
        .replace(/\s+/g, '')
    } else {
      subcategorySelect.value = subcategory
    }
  } else {
    subcategorySelect.value = ''
  }

  // Add event listener for category change in edit modal (remove existing first)
  const existingListener = categorySelect._changeListener
  if (existingListener) {
    categorySelect.removeEventListener('change', existingListener)
  }

  const changeListener = function () {
    const selectedCategory = this.value
    updateSubcategoriesForCategory(selectedCategory, subcategorySelect)
  }

  categorySelect.addEventListener('change', changeListener)
  categorySelect._changeListener = changeListener

  // Show modal
  modal.style.display = 'flex'
}

// Şarkı güncelleme işlevi
async function updateSong(songData) {
  try {
    const updatedSong = await apiService.updateSong(songData)
    console.log('Song updated:', updatedSong)
    return updatedSong
  } catch (error) {
    console.error('Error updating song:', error)
    alert('Şarkı güncellenirken hata oluştu: ' + error.message)
    throw error
  }
}

// Mevcut saveSong fonksiyonunu güncelle
async function saveSong() {
  const songData = {
    id: document.getElementById('songId').value,
    sanatci: document.getElementById('sanatciAdi').value,
    sarki: document.getElementById('sarkiAdi').value,
    kategori: document.getElementById('kategori').value,
    alt_kategori: document.getElementById('altKategori').value,
    dosya: document.getElementById('mp3File').value,
  }

  try {
    let result

    if (songData.id) {
      // Şarkı güncelleme
      result = await updateSong(songData)
      alert('Şarkı başarıyla güncellendi!')
    } else {
      // Yeni şarkı ekleme
      result = await apiService.addSong(songData)
      alert('Şarkı başarıyla eklendi!')
    }

    // Formu temizle ve listeyi güncelle
    resetForm()
    loadSongs()

    return result
  } catch (error) {
    console.error('Error saving song:', error)
  }
}

// Sayfa yüklendiğinde listeyi güncelle
document.addEventListener('DOMContentLoaded', async function () {
  await checkLogin()
  await guncelleListe()
  await getKategoriler()
  const linkliSongsBtn = document.getElementById('linkliSongs')
  if (linkliSongsBtn) {
    linkliSongsBtn.addEventListener('click', async function () {
      try {
        const linkliSongs = await apiService.linkliSongs()
        console.log('Found songs:', linkliSongs)

        if (!linkliSongs || linkliSongs.length === 0) {
          alert('Bağlantılı şarkı bulunamadı')
          return
        }

        // Tüm yüklemeleri takip et
        const uploadPromises = []

        linkliSongs.forEach((song) => {
          if (song.kapak) {
            uploadPromises.push(
              (async () => {
                try {
                  console.log(
                    `Downloading cover for song ${song.id}: ${song.kapak}`
                  )
                  const response = await fetch(song.kapak)
                  const blob = await response.blob()
                  const file = new File([blob], song.kapak, { type: blob.type })
                  const formData = new FormData()
                  formData.append('file', file)
                  formData.append('song_id', song.id)

                  console.log(`Uploading cover for song ${song.id}`)
                  const uploadResponse = await fetch('save_photo.php', {
                    method: 'POST',
                    body: formData,
                  })

                  const result = await uploadResponse.json()

                  if (result.error) {
                    console.error(
                      `Photo upload failed for song ${song.id}:`,
                      result.error
                    )
                    return {
                      success: false,
                      songId: song.id,
                      error: result.error,
                    }
                  } else {
                    console.log(
                      `Photo uploaded successfully for song ${song.id}:`,
                      result
                    )
                    song.kapak = result.kapak

                    // Veritabanını güncelle
                    try {
                      const updateResult = await apiService.updateSong({
                        id: song.id,
                        kapak: result.kapak,
                      })
                      console.log(
                        `Database updated for song ${song.id}:`,
                        updateResult
                      )
                      return { success: true, songId: song.id, dbUpdated: true }
                    } catch (updateError) {
                      console.error(
                        `Database update failed for song ${song.id}:`,
                        updateError
                      )
                      return {
                        success: false,
                        songId: song.id,
                        error: `Photo uploaded but database update failed: ${updateError.message}`,
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Upload failed for song ${song.id}:`, error)
                  return {
                    success: false,
                    songId: song.id,
                    error: error.message,
                  }
                }
              })()
            )
          }
        })

        // Tüm yüklemelerin tamamlanmasını bekle
        const results = await Promise.all(uploadPromises)

        // Sonuçları analiz et
        const successfulUploads = results.filter((r) => r.success).length
        const failedUploads = results.filter((r) => !r.success)

        if (failedUploads.length > 0) {
          console.error('Failed uploads:', failedUploads)
          alert(
            `${successfulUploads} kapak başarıyla yüklendi, ${failedUploads.length} kapak yüklenemedi`
          )
        } else {
          alert(`Tüm kapaklar başarıyla yüklendi (${successfulUploads} adet)`)
        }

        // Güncellenmiş şarkı listesini göster
        console.log('Updated songs:', linkliSongs)
      } catch (error) {
        console.error('Error processing linkli songs:', error)
        alert('Şarkı listesi alınırken hata oluştu: ' + error.message)
      }
    })
  }

  // Kategori değiştiğinde alt kategorileri güncelle (şarkı ekleme kısmı için)
  document.getElementById('kategori').addEventListener('change', function () {
    const kategori = this.value
    updateSubcategoriesForSongAdd(
      kategori,
      document.getElementById('altKategori')
    )
  })
})

// Modal save button event listener
document
  .getElementById('popupKaydet')
  .addEventListener('click', async function () {
    const modal = document.getElementById('sarkiDuzenleModal')
    const songId = document.getElementById('duzenleSarkiId').value
    const songName = document.getElementById('duzenleSarkiAdi').value.trim()
    const category = document.getElementById('duzenleKategori').value
    const subcategory = document.getElementById('duzenleAltKategori').value

    if (!songName || !category) {
      showCenterAlert('Lütfen tüm alanları doldurun!')
      return
    }

    // Alt kategori seçilip seçilmediğini kontrol et
    const altKategoriSecildi = subcategory && subcategory.trim() !== ''

    const fullCategory = altKategoriSecildi
      ? `${category}-${subcategory.toLowerCase().replace(' ', '')}`
      : category

    // Ana kategoriyi belirle
    const anaKategori = category.toLowerCase()

    // "Diğer" kategorisini bul
    const digerKategori = tumKategoriler.find(
      (kat) =>
        kat.isim.toLowerCase() === 'diğer' &&
        kat.parent_id &&
        tumKategoriler.find(
          (parent) =>
            parent.id == kat.parent_id &&
            parent.isim.toLowerCase().replace(/\s+/g, '') === anaKategori
        )
    )

    // Kategori bilgisini oluştur
    let kategoriBilgisi = fullCategory

    // Eğer "Diğer" kategorisi varsa ve alt kategori seçilmediyse, sadece "Diğer" kategorisinde kaydet
    if (digerKategori && !altKategoriSecildi) {
      const digerKategoriAdi = `${anaKategori}-diğer`
      kategoriBilgisi = digerKategoriAdi
    }
    // Eğer alt kategori seçildiyse, hem spesifik hem de "Diğer" kategorisinde kaydet
    else if (digerKategori && altKategoriSecildi) {
      const digerKategoriAdi = `${anaKategori}-diğer`
      kategoriBilgisi = `${fullCategory},${digerKategoriAdi}`
    }

    try {
      await apiService.updateSong({
        id: songId,
        cevap: songName,
        kategori: kategoriBilgisi,
      })

      // Oyun verilerini güncelle
      if (window.soruListesi) {
        const updatedSong = window.soruListesi.find((s) => s.id === songId)
        if (updatedSong) {
          updatedSong.sarki = songName
        }
      }

      // Oyun arayüzünü yenile
      if (window.guncelleSoru) {
        window.guncelleSoru()
      }

      showSuccessToast('Şarkı başarıyla güncellendi!')
      modal.style.display = 'none'
      await guncelleListe(currentPage)
    } catch (error) {
      console.error('Update error:', error)
      showGuncelleToast('Güncelleme sırasında hata oluştu')
    }
  })

// Modal delete button event listener
document
  .getElementById('popupSil')
  .addEventListener('click', async function () {
    const modal = document.getElementById('sarkiDuzenleModal')
    const songId = document.getElementById('duzenleSarkiId').value

    modal.style.display = 'none'
    await sarkiSil(songId)
  })

// Close modal when clicking outside
const editModal = document.getElementById('sarkiDuzenleModal')
editModal.addEventListener('click', function (e) {
  if (e.target === editModal) {
    editModal.style.display = 'none'
  }
})

// Delete confirmation modal elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal')
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn')
const deleteCancelBtn = document.getElementById('deleteCancelBtn')

// Form reset function
function resetForm() {
  document.getElementById('sanatciAdi').value = ''
  document.getElementById('sarkiAdi').value = ''
  document.getElementById('kategori').value = ''
  document.getElementById('altKategori').innerHTML =
    '<option value="">Alt Kategori Seç</option>'
  document.getElementById('altKategori').style.display = 'none'
  document.getElementById('mp3File').value = ''
}

// Listen for section changes
const panelSections = document.querySelectorAll('.panel-section')
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      resetForm()
    }
  })
})

panelSections.forEach((section) => {
  observer.observe(section, { attributes: true })
})

// Add event listeners to menu items
const menuItems = document.querySelectorAll('.menu-item')
menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    if (!item.classList.contains('active')) {
      resetForm()
    }
  })
})

// Function to clear all song selections
function clearSongSelections() {
  const checkboxes = document.querySelectorAll('.song-checkbox:checked')
  checkboxes.forEach((checkbox) => (checkbox.checked = false))

  // Hide batch controls if visible
  const batchControls = document.getElementById('batchControls')
  if (batchControls) {
    batchControls.classList.remove('show')
  }
}

// Modify menu click handler to clear selections
const menuItems2 = document.querySelectorAll('.menu-item:not(.logout-item)')
menuItems2.forEach((item) => {
  item.addEventListener('click', function () {
    // Clear selections when switching sections
    clearSongSelections()

    // Rest of existing click handler...
    document
      .querySelectorAll('.menu-item')
      .forEach((i) => i.classList.remove('active'))
    document
      .querySelectorAll('.panel-section')
      .forEach((section) => section.classList.remove('active'))

    this.classList.add('active')
    const sectionId = this.getAttribute('data-section')
    document.getElementById(sectionId).classList.add('active')
  })
})

// Kategori seçim alanlarını güncelleme fonksiyonu
function updateCategorySelects() {
  // Ana kategorileri al
  const anaKategoriler = tumKategoriler.filter(
    (kategori) => kategori.parent_id === null || kategori.parent_id === ''
  )

  // Alt kategorileri al
  const altKategoriler = tumKategoriler.filter(
    (kategori) => kategori.parent_id !== null && kategori.parent_id !== ''
  )

  // Şarkı ekleme kısmındaki kategori seçimi
  const kategoriSelect = document.getElementById('kategori')
  if (kategoriSelect) {
    kategoriSelect.innerHTML = '<option value="">Kategori Seç</option>'
    anaKategoriler.forEach((kategori) => {
      const option = document.createElement('option')
      option.value = kategori.isim.toLowerCase().replace(/\s+/g, '')
      option.textContent = kategori.isim
      kategoriSelect.appendChild(option)
    })
  }

  // Şarkı listesi filtreleme kısmındaki kategori seçimi (sadece ana kategoriler)
  const filterKategoriSelect = document.getElementById('filterKategori')
  if (filterKategoriSelect) {
    filterKategoriSelect.innerHTML = '<option value="">Kategori Seç</option>'
    anaKategoriler.forEach((kategori) => {
      const option = document.createElement('option')
      option.value = kategori.isim.toLowerCase().replace(/\s+/g, '')
      option.textContent = kategori.isim
      filterKategoriSelect.appendChild(option)
    })
  }

  // Şarkı düzenleme modalındaki kategori seçimi
  const duzenleKategoriSelect = document.getElementById('duzenleKategori')
  if (duzenleKategoriSelect) {
    duzenleKategoriSelect.innerHTML = '<option value="">Kategori Seç</option>'
    anaKategoriler.forEach((kategori) => {
      const option = document.createElement('option')
      option.value = kategori.isim.toLowerCase().replace(/\s+/g, '')
      option.textContent = kategori.isim
      duzenleKategoriSelect.appendChild(option)
    })
  }

  // Alt kategorileri güncelle
  updateSubcategoryOptions()

  // Kategori ekleme formundaki ana kategori seçim alanını güncelle
  const yeniKategoriParentSelect = document.getElementById('yeniKategoriParent')
  if (yeniKategoriParentSelect) {
    yeniKategoriParentSelect.innerHTML =
      '<option value="">Ana Kategori</option>'
    anaKategoriler.forEach((kategori) => {
      const option = document.createElement('option')
      option.value = kategori.id
      option.textContent = kategori.isim
      yeniKategoriParentSelect.appendChild(option)
    })
  }
}

// Alt kategori seçeneklerini güncelleme fonksiyonu
function updateSubcategoryOptions() {
  const anaKategoriler = tumKategoriler.filter(
    (kategori) => kategori.parent_id === null || kategori.parent_id === ''
  )

  const altKategoriler = tumKategoriler.filter(
    (kategori) => kategori.parent_id !== null && kategori.parent_id !== ''
  )

  // Her ana kategori için alt kategorileri grupla
  const altKategoriMap = {}
  altKategoriler.forEach((altKat) => {
    const parentId = altKat.parent_id
    if (!altKategoriMap[parentId]) {
      altKategoriMap[parentId] = []
    }
    altKategoriMap[parentId].push(altKat)
  })

  // Alt kategori seçim alanlarını güncelle
  const altKategoriSelects = [
    document.getElementById('altKategori'),
    document.getElementById('filterAltKategori'),
    document.getElementById('duzenleAltKategori'),
  ]

  altKategoriSelects.forEach((select) => {
    if (select) {
      select.innerHTML = '<option value="">Alt Kategori Seç</option>'
    }
  })
}

// Kategori değiştiğinde alt kategorileri güncelleme fonksiyonu
function updateSubcategoriesForCategory(categoryValue, targetSelect) {
  if (!targetSelect) return

  targetSelect.innerHTML = '<option value="">Alt Kategori Seç</option>'

  if (!categoryValue) {
    targetSelect.style.display = 'none'
    return
  }

  // Seçilen ana kategoriyi bul
  const selectedAnaKategori = tumKategoriler.find(
    (kat) =>
      kat.isim.toLowerCase().replace(/\s+/g, '') === categoryValue ||
      kat.isim.toLowerCase() === categoryValue
  )

  if (!selectedAnaKategori) {
    targetSelect.style.display = 'none'
    return
  }

  // Bu ana kategoriye ait alt kategorileri bul
  const altKategoriler = tumKategoriler.filter(
    (kat) => kat.parent_id == selectedAnaKategori.id
  )

  if (altKategoriler.length > 0) {
    targetSelect.style.display = 'block'
    altKategoriler.forEach((altKat) => {
      const option = document.createElement('option')
      option.value = altKat.isim.toLowerCase().replace(/\s+/g, '')
      option.textContent = altKat.isim
      targetSelect.appendChild(option)
    })
  } else {
    targetSelect.style.display = 'none'
  }
}

// Şarkı ekleme kısmı için özel alt kategori güncelleme fonksiyonu
function updateSubcategoriesForSongAdd(categoryValue, targetSelect) {
  if (!targetSelect) return

  targetSelect.innerHTML = '<option value="">Alt Kategori Seç</option>'

  if (!categoryValue) {
    targetSelect.style.display = 'none'
    return
  }

  // Seçilen ana kategoriyi bul
  const selectedAnaKategori = tumKategoriler.find(
    (kat) =>
      kat.isim.toLowerCase().replace(/\s+/g, '') === categoryValue ||
      kat.isim.toLowerCase() === categoryValue
  )

  if (!selectedAnaKategori) {
    targetSelect.style.display = 'none'
    return
  }

  // Bu ana kategoriye ait alt kategorileri bul ("Diğer" hariç)
  const altKategoriler = tumKategoriler.filter(
    (kat) =>
      kat.parent_id == selectedAnaKategori.id &&
      kat.isim.toLowerCase() !== 'diğer'
  )

  if (altKategoriler.length > 0) {
    targetSelect.style.display = 'block'
    altKategoriler.forEach((altKat) => {
      const option = document.createElement('option')
      option.value = altKat.isim.toLowerCase().replace(/\s+/g, '')
      option.textContent = altKat.isim
      targetSelect.appendChild(option)
    })
  } else {
    targetSelect.style.display = 'none'
  }
}
