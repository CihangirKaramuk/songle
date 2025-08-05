import apiService from '../apiService.js'

// Import modules
import * as GlobalVars from './modules/global-variables.js'
import * as Utils from './modules/utils.js'
import './modules/theme.js'
import './modules/logout.js'
import './modules/deezer.js'
import * as SongManagement from './modules/song-management.js'
import * as CategoryManagement from './modules/category-management.js'
import * as Settings from './modules/settings.js'

// Make global variables available globally
window.sarkiListesi = GlobalVars.sarkiListesi
window.currentPage = GlobalVars.currentPage
window.selectedSongIds = GlobalVars.selectedSongIds
window.tumKategoriler = GlobalVars.tumKategoriler
window.aktifFiltre = GlobalVars.aktifFiltre
window.secilenDeezerSarki = GlobalVars.secilenDeezerSarki
window.dialogElements = GlobalVars.dialogElements

// Make utility functions available globally
window.formatKategoriForDisplay = Utils.formatKategoriForDisplay
window.showGuncelleToast = Utils.showGuncelleToast
window.showSuccessToast = Utils.showSuccessToast
window.showDeleteToast = Utils.showDeleteToast
window.showCenterAlert = Utils.showCenterAlert
window.showModernAlert = Utils.showModernAlert

// Make song management functions available globally
window.guncelleListe = SongManagement.guncelleListe
window.updateBatchControlsDisplay = SongManagement.updateBatchControlsDisplay
window.sarkiSil = SongManagement.sarkiSil
window.silSarki = SongManagement.silSarki
window.updateSong = SongManagement.updateSong
window.saveSong = SongManagement.saveSong
window.resetForm = SongManagement.resetForm
window.clearSongSelections = SongManagement.clearSongSelections

// Make category management functions available globally
window.getKategoriler = CategoryManagement.getKategoriler
window.kategorileriGoster = CategoryManagement.kategorileriGoster
window.kategoriEkle = CategoryManagement.kategoriEkle
window.filtreDegistir = CategoryManagement.filtreDegistir
window.updateCategorySelects = CategoryManagement.updateCategorySelects
window.updateSubcategoryOptions = CategoryManagement.updateSubcategoryOptions
window.updateSubcategoriesForCategory =
  CategoryManagement.updateSubcategoriesForCategory
window.updateSubcategoriesForSongAdd =
  CategoryManagement.updateSubcategoriesForSongAdd

// Make settings functions available globally
window.loadAyarlar = Settings.loadAyarlar
window.saveAyarlar = Settings.saveAyarlar
window.updateSistemBilgileri = Settings.updateSistemBilgileri
window.updatePageSizeAndRefresh = Settings.updatePageSizeAndRefresh

// Initialize dialog elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  GlobalVars.dialogElements.confirmDialog =
    document.getElementById('confirmDialog')
  GlobalVars.dialogElements.songCount = document.getElementById('songCount')
  GlobalVars.dialogElements.confirmMessage =
    document.getElementById('confirmMessage')
  GlobalVars.dialogElements.confirmDelete =
    document.getElementById('confirmDelete')
  GlobalVars.dialogElements.confirmCancel =
    document.getElementById('confirmCancel')
})

// Define applyFilters function globally
function applyFilters() {
  // Expose for other scripts
  window.applySongFilters = applyFilters
  window.applyFilters = applyFilters

  // Get current values from global variables
  const currentSarkiListesi = GlobalVars.sarkiListesi
  let currentPage = GlobalVars.currentPage

  const searchInput = document.getElementById('searchInput')
  const filterKategori = document.getElementById('filterKategori')?.value || ''
  const filterAltKategori =
    document.getElementById('filterAltKategori')?.value || ''
  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : ''

  const filteredSongs = currentSarkiListesi.filter((sarki) => {
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
  if (!listeDiv) {
    console.error('liste div not found')
    return
  }
  listeDiv.innerHTML = ''

  const ITEMS_PER_PAGE = GlobalVars.pageSize
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSongs.length / ITEMS_PER_PAGE)
  )

  // Update current page if it exceeds total pages
  if (currentPage > totalPages) {
    GlobalVars.updateCurrentPage(totalPages)
    // Update local currentPage variable
    currentPage = totalPages
  }

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
            <input type="checkbox" class="song-checkbox" data-id="${
              sarki.id
            }" ${
      GlobalVars.selectedSongIds.has(sarki.id.toString()) ? 'checked' : ''
    }>
          </label>
        </div>
        <div class="sarki-bilgi">
          <span class="sarki-ad">${sarki.cevap}</span>
          <span class="sarki-kategori">${formatKategoriForDisplay(
            sarki.kategori
          )}</span>
        </div>
        <div class="sarki-actions">
          <button class="btn btn-edit" onclick="sarkiDuzenle(${currentSarkiListesi.indexOf(
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

  // Update batch controls display after rendering
  if (window.updateBatchControlsDisplay) {
    window.updateBatchControlsDisplay()
  }
}

// ------- Pagination UI Builder -------
function buildPagination(totalPages) {
  const paginationDiv = document.getElementById('pagination')
  if (!paginationDiv) return

  paginationDiv.innerHTML = ''
  if (totalPages <= 1) return

  // Get current page from global variables
  const currentPage = GlobalVars.currentPage

  // First page button (<<) - show when not on first page
  if (currentPage > 1) {
    const firstBtn = document.createElement('button')
    firstBtn.textContent = '«'
    firstBtn.className = 'page-btn first-btn'
    firstBtn.title = 'İlk sayfa'
    firstBtn.addEventListener('click', () => {
      GlobalVars.updateCurrentPage(1)
      applyFilters()
    })
    paginationDiv.appendChild(firstBtn)
  }

  // Previous button
  const prevBtn = document.createElement('button')
  prevBtn.textContent = '‹'
  prevBtn.className = 'page-btn prev-btn'
  prevBtn.disabled = currentPage === 1
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      GlobalVars.updateCurrentPage(currentPage - 1)
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
        GlobalVars.updateCurrentPage(i)
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
      GlobalVars.updateCurrentPage(currentPage + 1)
      applyFilters()
    }
  })
  paginationDiv.appendChild(nextBtn)

  // Last page button (>>) - show when not on last page
  if (currentPage < totalPages) {
    const lastBtn = document.createElement('button')
    lastBtn.textContent = '»'
    lastBtn.className = 'page-btn last-btn'
    lastBtn.title = 'Son sayfa'
    lastBtn.addEventListener('click', () => {
      GlobalVars.updateCurrentPage(totalPages)
      applyFilters()
    })
    paginationDiv.appendChild(lastBtn)
  }
}

// Apply initial filters on page load
applyFilters()

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput')
  const katSelect = document.getElementById('filterKategori')
  const altSelect = document.getElementById('filterAltKategori')
  const paginationDiv = document.getElementById('pagination')

  if (!searchInput && !katSelect) return

  // Initialize search input
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      GlobalVars.updateCurrentPage(1) // Reset to first page when searching
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
    if (GlobalVars.secilenDeezerSarki) {
      const response = await fetch(GlobalVars.secilenDeezerSarki.cover)
      const blob = await response.blob()
      const file = new File([blob], GlobalVars.secilenDeezerSarki.cover, {
        type: blob.type,
      })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('song_id', GlobalVars.secilenDeezerSarki.id)

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
    const digerKategori = GlobalVars.tumKategoriler.find(
      (kat) =>
        kat.isim.toLowerCase() === 'diğer' &&
        kat.parent_id &&
        GlobalVars.tumKategoriler.find(
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

// Batch delete functionality
let batchControls,
  selectedCount,
  btnBatchDelete,
  btnBatchCancel,
  confirmDialog,
  confirmMessage,
  songCount,
  confirmCancel,
  confirmDelete

// Initialize batch controls when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  batchControls = document.getElementById('batchControls')
  selectedCount = document.getElementById('selectedCount')
  btnBatchDelete = document.getElementById('btnBatchDelete')
  btnBatchCancel = document.getElementById('btnBatchCancel')
  confirmDialog = document.getElementById('confirmDialog')
  confirmMessage = document.getElementById('confirmMessage')
  songCount = document.getElementById('songCount')
  confirmCancel = document.getElementById('confirmCancel')
  confirmDelete = document.getElementById('confirmDelete')

  // Toggle batch controls when checkboxes are clicked
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('song-checkbox')) {
      const songId = e.target.dataset.id
      if (e.target.checked) {
        GlobalVars.selectedSongIds.add(songId)
      } else {
        GlobalVars.selectedSongIds.delete(songId)
      }

      // Update batch controls based on global selection
      if (GlobalVars.selectedSongIds.size > 0) {
        batchControls.classList.add('show')
        selectedCount.textContent = `${GlobalVars.selectedSongIds.size} şarkı seçildi`
      } else {
        batchControls.classList.remove('show')
      }
    }
  })

  // Handle batch delete
  btnBatchDelete.addEventListener('click', async () => {
    // Use global selection count instead of current page checkboxes
    if (GlobalVars.selectedSongIds.size === 0) return

    // Show custom confirmation dialog
    songCount.textContent = GlobalVars.selectedSongIds.size
    confirmDialog.style.display = 'flex'
  })

  // Handle batch cancel (vazgeç)
  btnBatchCancel.addEventListener('click', () => {
    // Uncheck all checkboxes on all pages
    const checkboxes = document.querySelectorAll('.song-checkbox')
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false
    })

    // Clear global selection tracking
    GlobalVars.selectedSongIds.clear()

    // Hide batch controls
    batchControls.classList.remove('show')
  })

  // Confirm delete
  confirmDelete.addEventListener('click', async () => {
    confirmDialog.style.display = 'none'

    try {
      const deletePromises = []
      // Get current song list from global state
      const currentSarkiListesi = GlobalVars.sarkiListesi

      // Use global selection instead of current page checkboxes
      const selectedSongIds = Array.from(GlobalVars.selectedSongIds)
      const deletedCount = selectedSongIds.length

      selectedSongIds.forEach((songId) => {
        const song = currentSarkiListesi.find((song) => song.id == songId)

        if (!song) {
          console.warn(`Song with ID ${songId} not found in current list`)
          return
        }

        // dosyayı sil
        const dosyaYolu = song.dosya
        const kapakYolu = song.kapak

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
      showSuccessToast(`${deletedCount} şarkı başarıyla silindi`)

      // Clear global selection tracking after successful deletion
      GlobalVars.selectedSongIds.clear()

      await guncelleListe(GlobalVars.currentPage)
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
})

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

async function checkLogin() {
  const adminGiris = localStorage.getItem('adminGiris')
  if (!adminGiris) {
    window.location.href = 'login.html'
  }
}

// Sayfa yüklendiğinde listeyi güncelle
document.addEventListener('DOMContentLoaded', async function () {
  await checkLogin()
  await guncelleListe()
  await getKategoriler()
  // Call applyFilters to display the song list
  if (typeof applyFilters === 'function') {
    applyFilters()
  } else {
    console.error('applyFilters function not found')
  }
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
    const digerKategori = GlobalVars.tumKategoriler.find(
      (kat) =>
        kat.isim.toLowerCase() === 'diğer' &&
        kat.parent_id &&
        GlobalVars.tumKategoriler.find(
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

// Ayarlar sayfası event listener'ları
document.addEventListener('DOMContentLoaded', () => {
  // Ayarlar kaydet butonu
  const ayarlarKaydetBtn = document.getElementById('ayarlarKaydet')
  if (ayarlarKaydetBtn) {
    ayarlarKaydetBtn.addEventListener('click', saveAyarlar)
  }

  // Ayarlar sayfasına geçiş yapıldığında ayarları yükle
  const ayarlarMenuItem = document.querySelector('[data-section="ayarlar"]')
  if (ayarlarMenuItem) {
    ayarlarMenuItem.addEventListener('click', () => {
      setTimeout(() => {
        loadAyarlar()
      }, 100)
    })
  }
})
