import apiService from '../../apiService.js'
import {
  tumKategoriler,
  aktifFiltre,
  updateTumKategoriler,
  updateAktifFiltre,
} from './global-variables.js'
import {
  showCenterAlert,
  showSuccessToast,
  showGuncelleToast,
} from './utils.js'

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

      showDeleteToast(
        'Kategori başarıyla silindi! Ana sayfada otomatik olarak kaldırılacak.'
      )
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

    showSuccessToast(
      'Kategori başarıyla güncellendi! Ana sayfada otomatik olarak güncellenecek.'
    )
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

    const newTumKategoriler = [...anaKategoriler, ...altKategoriler]
    updateTumKategoriler(newTumKategoriler)

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

    showSuccessToast(
      'Kategori başarıyla eklendi! Ana sayfada otomatik olarak görünecek.'
    )
  } catch (error) {
    console.error('Error adding category:', error)
    showGuncelleToast('Kategori eklenirken hata oluştu')
  }
}

// Filtre değiştirme
function filtreDegistir(tip) {
  updateAktifFiltre(tip)

  // Butonları güncelle
  document
    .getElementById('anaKategorilerBtn')
    .classList.toggle('active', tip === 'ana')
  document
    .getElementById('altKategorilerBtn')
    .classList.toggle('active', tip === 'alt')

  kategorileriGoster()
}

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

export {
  getKategoriler,
  kategorileriGoster,
  kategoriEkle,
  filtreDegistir,
  updateCategorySelects,
  updateSubcategoryOptions,
  updateSubcategoriesForCategory,
  updateSubcategoriesForSongAdd,
}
