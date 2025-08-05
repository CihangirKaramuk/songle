// Global variables for song management
let sarkiListesi = []
let currentPage = 1
let selectedSongIds = new Set() // Track selected song IDs globally

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
}
