import {
  secilenDeezerSarki,
  updateSecilenDeezerSarki,
} from './global-variables.js'
import { showSuccessToast, showGuncelleToast } from './utils.js'

// Global function for Deezer JSONP callback
window.deezerJsonpSonuc = function (response) {
  const sonuclarUl = document.getElementById('deezerResultsList')
  const deezerResultsModal = document.getElementById('deezerResultsModal')

  if (!sonuclarUl || !deezerResultsModal) {
    console.error('Deezer modal elements not found')
    return
  }

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
      const newSecilenDeezerSarki = {
        id: sarki.id,
        artist: sarki.artist.name,
        title: sarki.title_short,
        preview: sarki.preview,
        cover:
          sarki.album?.cover_medium ||
          sarki.album?.cover_big ||
          sarki.album?.cover,
      }
      updateSecilenDeezerSarki(newSecilenDeezerSarki)
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

      const deezerResultsModal = document.getElementById('deezerResultsModal')
      if (deezerResultsModal) {
        deezerResultsModal.style.display = 'none'
      }
    })

    sonuclarUl.appendChild(div)
  })
}

// Deezer'dan şarkı arama fonksiyonu
async function deezerAra(sorgu) {
  const sonuclarUl = document.getElementById('deezerResultsList')
  const deezerResultsModal = document.getElementById('deezerResultsModal')

  if (!sonuclarUl || !deezerResultsModal) {
    console.error('Deezer modal elements not found')
    return
  }

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

export { deezerAra, indirVeKaydet, openDeezerModal, closeDeezerModal }
