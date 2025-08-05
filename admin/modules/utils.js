// Kategori gösterimini formatla (virgülle ayrılmış kategorilerde sadece ilkini göster)
function formatKategoriForDisplay(kategoriStr) {
  if (!kategoriStr) return ''

  // Virgülle ayrılmış kategorileri al
  const kategoriler = kategoriStr.split(',')

  // İlk kategoriyi al
  const ilkKategori = kategoriler[0].trim()

  // Kategori ismini düzenle
  const [anaKategori, altKategori] = ilkKategori.split('-')

  // Görsel formatı oluştur
  let gorunurAnaKategori = anaKategori
  let gorunurAltKategori = altKategori

  // Ana kategori ismini düzenle
  switch (anaKategori.toLowerCase()) {
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
        anaKategori.charAt(0).toUpperCase() + anaKategori.slice(1)
  }

  // Alt kategori ismini düzenle
  switch (altKategori.toLowerCase()) {
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
        altKategori.charAt(0).toUpperCase() + altKategori.slice(1)
  }

  return `${gorunurAnaKategori} - ${gorunurAltKategori}`
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

// Kullanıcı ID'sini almak için yardımcı fonksiyon
function getCurrentUserId() {
  // Session storage'dan kullanıcı bilgisini al
  const userInfo = sessionStorage.getItem('userInfo')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    return user.id || 1 // Varsayılan olarak 1 döndür
  }
  return 1 // Varsayılan kullanıcı ID
}

export {
  formatKategoriForDisplay,
  showGuncelleToast,
  showSuccessToast,
  showDeleteToast,
  showCenterAlert,
  showModernAlert,
  getCurrentUserId,
}
