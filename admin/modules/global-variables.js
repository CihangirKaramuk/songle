// Global variables for song management
let sarkiListesi = []
let currentPage = 1
let selectedSongIds = new Set() // Track selected song IDs globally
let pageSize = 10 // Sayfa başına şarkı sayısı (varsayılan 10)

let islemKayitlari = []
let duzenlenenIndex = null
let siralamaArtan = true
let seciliIndex = null
let silinecekIndex = null
let secilenDeezerSarki = null

// Store dialog elements in variables at the start
const dialogElements = {
  confirmDialog: null,
  songCount: null,
  confirmMessage: null,
  confirmDelete: null,
  confirmCancel: null,
}

// Kategoriler yönetimi
let tumKategoriler = []
let aktifFiltre = 'ana' // 'ana' veya 'alt'

// Alt kategorileri tanımla
const altKategoriler = {
  turkce: ['Rock', 'Pop', 'Hip Hop'],
  yabanci: ['Rock', 'Pop', 'Hip Hop'],
  dizi: ['Türkçe', 'Yabancı'],
  film: ['Türkçe', 'Yabancı'],
}

// Make variables mutable for other modules
export function updateSarkiListesi(newList) {
  sarkiListesi = newList
}

export function updateCurrentPage(newPage) {
  currentPage = newPage
}

export function updateTumKategoriler(newKategoriler) {
  tumKategoriler = newKategoriler
}

export function updateAktifFiltre(newFiltre) {
  aktifFiltre = newFiltre
}

export function updateSecilenDeezerSarki(newSarki) {
  secilenDeezerSarki = newSarki
}

export function updatePageSize(newPageSize) {
  pageSize = newPageSize
}

// GlobalVars object to provide access to all global variables
const GlobalVars = {
  get sarkiListesi() {
    return sarkiListesi
  },
  get currentPage() {
    return currentPage
  },
  set currentPage(newPage) {
    currentPage = newPage
  },
  get selectedSongIds() {
    return selectedSongIds
  },
  get islemKayitlari() {
    return islemKayitlari
  },
  get duzenlenenIndex() {
    return duzenlenenIndex
  },
  get siralamaArtan() {
    return siralamaArtan
  },
  get seciliIndex() {
    return seciliIndex
  },
  get silinecekIndex() {
    return silinecekIndex
  },
  get secilenDeezerSarki() {
    return secilenDeezerSarki
  },
  get dialogElements() {
    return dialogElements
  },
  get tumKategoriler() {
    return tumKategoriler
  },
  get aktifFiltre() {
    return aktifFiltre
  },
  get altKategoriler() {
    return altKategoriler
  },
  get pageSize() {
    return pageSize
  },
  updateSarkiListesi,
  updateCurrentPage,
  updateTumKategoriler,
  updateAktifFiltre,
  updateSecilenDeezerSarki,
  updatePageSize,
}

export {
  sarkiListesi,
  currentPage,
  selectedSongIds,
  islemKayitlari,
  duzenlenenIndex,
  siralamaArtan,
  seciliIndex,
  silinecekIndex,
  secilenDeezerSarki,
  dialogElements,
  tumKategoriler,
  aktifFiltre,
  altKategoriler,
  pageSize,
  GlobalVars,
}
