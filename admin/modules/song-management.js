import apiService from '../../apiService.js'
import {
  sarkiListesi,
  currentPage,
  selectedSongIds,
  dialogElements,
  tumKategoriler,
  updateSarkiListesi,
  updateCurrentPage,
} from './global-variables.js'
import {
  formatKategoriForDisplay,
  showGuncelleToast,
  showSuccessToast,
  showCenterAlert,
  showModernAlert,
} from './utils.js'

// Import category management functions
import { updateSubcategoriesForCategory } from './category-management.js'

// Şarkı listesini güncelle
async function guncelleListe(page = 1) {
  try {
    console.log('guncelleListe called with page:', page)
    // Calculate starting number for current page
    const itemsPerPage = 10
    const startNumber = (page - 1) * itemsPerPage + 1

    const newSarkiListesi = await apiService.getSongs()
    console.log('Songs loaded from API:', newSarkiListesi)
    updateSarkiListesi(newSarkiListesi)
    updateCurrentPage(page)

    // Update batch controls display after rendering
    updateBatchControlsDisplay()

    // Call applyFilters to render the song list with filters
    if (window.applyFilters) {
      window.applyFilters()
    }
  } catch (error) {
    console.error('Error updating song list:', error)
    showGuncelleToast('Şarkı listesi güncellenirken hata oluştu')
  }
}

// Function to update batch controls display
function updateBatchControlsDisplay() {
  const batchControls = document.getElementById('batchControls')
  const selectedCount = document.getElementById('selectedCount')

  if (!batchControls || !selectedCount) return

  // Check if there are any selected songs globally (not just on current page)
  if (selectedSongIds.size > 0) {
    batchControls.classList.add('show')
    selectedCount.textContent = `${selectedSongIds.size} şarkı seçildi`
  } else {
    batchControls.classList.remove('show')
  }
}

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
      updateCurrentPage(currentPage - 1)
      await guncelleListe(currentPage - 1)
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

// Function to clear all song selections
function clearSongSelections() {
  const checkboxes = document.querySelectorAll('.song-checkbox:checked')
  checkboxes.forEach((checkbox) => (checkbox.checked = false))

  // Clear global selection tracking
  selectedSongIds.clear()

  // Hide batch controls if visible
  const batchControls = document.getElementById('batchControls')
  if (batchControls) {
    batchControls.classList.remove('show')
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

export {
  guncelleListe,
  updateBatchControlsDisplay,
  sarkiSil,
  silSarki,
  updateSong,
  saveSong,
  resetForm,
  clearSongSelections,
}
