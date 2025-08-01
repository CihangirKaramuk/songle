import apiService from '../apiService.js';

let islemKayitlari = [];
let sarkiListesi = [];
let duzenlenenIndex = null;
let siralamaArtan = true;
let seciliIndex = null;
let silinecekIndex = null;
let secilenDeezerSarki = null;
let currentPage = 1;

// Store dialog elements in variables at the start
const dialogElements = {
  confirmDialog: null,
  songCount: null,
  confirmMessage: null,
  confirmDelete: null,
  confirmCancel: null
};

// Initialize dialog elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  dialogElements.confirmDialog = document.getElementById('confirmDialog');
  dialogElements.songCount = document.getElementById('songCount');
  dialogElements.confirmMessage = document.getElementById('confirmMessage');
  dialogElements.confirmDelete = document.getElementById('confirmDelete');
  dialogElements.confirmCancel = document.getElementById('confirmCancel');
});

// ----- Tema (Dark/Light) Toggle Ayarları -----
document.addEventListener('DOMContentLoaded', () => {
  const bodyEl   = document.getElementById('panelBody');
  const toggleEl = document.getElementById('themeToggle');
  if (!toggleEl) return;

  // Kayıtlı tema varsayılanı uygula
  const storedTheme = localStorage.getItem('songleTheme');
  if (storedTheme === 'light') {
    bodyEl.classList.add('light');
    toggleEl.checked = true;
  }

  // Değişiklik olduğunda güncelle ve kaydet
  toggleEl.addEventListener('change', () => {
    if (toggleEl.checked) {
      bodyEl.classList.add('light');
      localStorage.setItem('songleTheme', 'light');
    } else {
      bodyEl.classList.remove('light');
      localStorage.setItem('songleTheme', 'dark');
    }
  });
});

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutConfirmDialog = document.getElementById('logoutConfirmDialog');
  const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
  const logoutCancelBtn = document.getElementById('logoutCancelBtn');
  let isLoggingOut = false;

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!isLoggingOut) {
        logoutConfirmDialog.style.display = 'flex';
      }
    });
  }

  if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', () => {
      logoutConfirmDialog.style.display = 'none';
    });
  }

  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', () => {
      isLoggingOut = true;
      logoutConfirmDialog.style.display = 'none';
      // Perform logout after hiding dialog
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 100);
    });
  }
});

// Simple Logout Confirmation
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  const confirmDialog = document.getElementById('logoutConfirmDialog');
  
  if (logoutBtn && confirmDialog) {
    logoutBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      confirmDialog.style.display = 'flex';
    });
    
    document.getElementById('logoutConfirmBtn').addEventListener('click', function() {
      window.location.href = 'login.html';
    });
    
    document.getElementById('logoutCancelBtn').addEventListener('click', function() {
      confirmDialog.style.display = 'none';
    });
    
    // Close dialog when clicking outside
    confirmDialog.addEventListener('click', function(e) {
      if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none';
      }
    });
  }
});

// ------- Şarkı Listesi Arama & Kategori Filtre Özelliği -------
document.addEventListener('DOMContentLoaded', () => {
  const searchInput   = document.getElementById('searchInput');
  const katSelect     = document.getElementById('filterKategori');
  const altSelect     = document.getElementById('filterAltKategori');
  const paginationDiv = document.getElementById('pagination');
  const ITEMS_PER_PAGE = 10;

  if (!searchInput && !katSelect) return;

  // Initialize search input
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentPage = 1; // Reset to first page when searching
      applyFilters();
    });
  }

  // Kategori değişince alt kategori seçeneklerini doldur
  if (katSelect) {
    katSelect.addEventListener('change', () => {
      if (!altSelect) return;
      altSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
      const secKat = katSelect.value;
      if (secKat && altKategoriler[secKat]) {
        altSelect.style.display = 'inline-block';
        altKategoriler[secKat].forEach(k => {
          const option = document.createElement('option');
          option.value = k.toLowerCase().replace(' ', '');
          option.textContent = k;
          altSelect.appendChild(option);
        });
      } else {
        altSelect.style.display = 'none';
      }
      applyFilters();
    });
  }

  // Alt kategori ve arama input değişimlerini dinle
  if (altSelect) {
    altSelect.addEventListener('change', applyFilters);
  }

  function applyFilters() {
    // Expose for other scripts
    window.applySongFilters = applyFilters;
    
    const filterKategori = document.getElementById('filterKategori').value;
    const filterAltKategori = document.getElementById('filterAltKategori').value;
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const filteredSongs = sarkiListesi.filter(sarki => {
      const [kategori, altKategori] = (sarki.kategori || '').split('-');
      const matchesSearch = searchText === '' || 
        (sarki.cevap && sarki.cevap.toLowerCase().includes(searchText)) ||
        (sarki.sanatci && sarki.sanatci.toLowerCase().includes(searchText));
      
      return matchesSearch && 
        (!filterKategori || kategori === filterKategori) && 
        (!filterAltKategori || altKategori === filterAltKategori);
    });
    
    const listeDiv = document.getElementById("liste");
    listeDiv.innerHTML = "";
    
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(filteredSongs.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Show filtered and paginated results
    filteredSongs.slice(startIndex, endIndex).forEach((sarki, index) => {
      const sarkiDiv = document.createElement("div");
      sarkiDiv.className = "sarki-item";
      
      // For filtered results, show position in full filtered list (11-20 etc)
      const itemNumber = filterKategori || filterAltKategori 
        ? startIndex + index + 1
        : startIndex + index + 1;
      
      sarkiDiv.dataset.number = itemNumber;
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
          <button class="btn btn-edit" onclick="sarkiDuzenle(${sarkiListesi.indexOf(sarki)})">Düzenle</button>
          <button class="btn btn-delete" onclick="sarkiSil(${sarki.id})">Sil</button>
        </div>
      `;
      // Kategori verilerini dataset olarak ekle
      const kategoriStr = sarki.kategori || '';
      const [anaKat, altKat] = kategoriStr.split('-');
      sarkiDiv.dataset.kategori = anaKat || '';
      sarkiDiv.dataset.alt = altKat || '';

      listeDiv.appendChild(sarkiDiv);
    });
    
    buildPagination(totalPages);
  }

  // ------- Pagination UI Builder -------
  function buildPagination(totalPages) {
    paginationDiv.innerHTML = '';
    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.className = 'page-btn prev-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        applyFilters();
      }
    });
    paginationDiv.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      pageBtn.className = 'page-btn';
      if (i === currentPage) pageBtn.classList.add('active');
      pageBtn.addEventListener('click', () => {
        if (i !== currentPage) {
          currentPage = i;
          applyFilters();
        }
      });
      paginationDiv.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.className = 'page-btn next-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        applyFilters();
      }
    });
    paginationDiv.appendChild(nextBtn);
  }

  // Apply initial filters on page load
  applyFilters();
});

// Global function for Deezer JSONP callback
window.deezerJsonpSonuc = function(response) {
  const sonuclarUl = deezerResultsList;
  sonuclarUl.innerHTML = "";
  deezerResultsModal.style.display = 'flex';

  if (!response.data || response.data.length === 0) {
    sonuclarUl.innerHTML = "<div style='padding: 10px; color: #ccc;'>Sonuç bulunamadı</div>";
    return;
  }

  response.data.slice(0, 7).forEach(sarki => {
    if (!sarki.preview) return; // Preview'u olmayan şarkıları atla
    
    const div = document.createElement("div");
    div.style.padding = "10px";
    div.style.borderBottom = "1px solid #444";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    
    div.innerHTML = `
      <img src="${sarki.album?.cover_small || sarki.artist?.picture_small}" alt="" style="width:40px;height:40px;border-radius:4px;object-fit:cover;margin-right:8px;"><div style="flex:1; margin-right: 12px;">
        <div style="font-weight: bold; color: #fff;">${sarki.artist.name}</div>
        <div style="font-size: 0.9em; color: #aaa;">${sarki.title_short}</div>
      </div>
      <button class="ekle-btn" style="background: #4CAF50; color: #fff; border: none; border-radius: 10px; padding: 4px 0; width: 40px; font-size: 0.8em; cursor: pointer; text-align: center;">
        Seç
      </button>
    `;
    
    const btn = div.querySelector('.ekle-btn');
    btn.addEventListener('click', () => {
      secilenDeezerSarki = {
        id: sarki.id,
        artist: sarki.artist.name,
        title: sarki.title_short,
        preview: sarki.preview,
        cover: sarki.album?.cover_medium || sarki.album?.cover_big || sarki.album?.cover
      };
      document.getElementById("sanatciAdi").value = sarki.artist.name;
      document.getElementById("sarkiAdi").value = sarki.title_short;
      
      // Preview'u indir ve sunucuya kaydet
      indirVeKaydet(sarki.preview, `${sarki.artist.name}-${sarki.title_short}.mp3`)
        .then(dosyaYolu => {
          // Gizli bir input alanına dosya yolunu ekle
          let hiddenInput = document.getElementById('dosyaYoluInput');
          if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'dosyaYoluInput';
            hiddenInput.name = 'dosyaYolu';
            document.querySelector('.ekle-formu').appendChild(hiddenInput);
          }
          hiddenInput.value = dosyaYolu;
          showSuccessToast("Şarkı başarıyla indirildi!");
        })
        .catch((error) => {
          console.error('Şarkı indirilirken hata oluştu:', error);
          showGuncelleToast("Şarkı indirilirken hata oluştu!");
        });
      
      deezerResultsModal.style.display = 'none';
    });
    
    sonuclarUl.appendChild(div);
  });
};

// Deezer'dan şarkı arama fonksiyonu
async function deezerAra(sorgu) {
  const sonuclarUl = deezerResultsList;
  sonuclarUl.innerHTML = "<div style='padding: 10px; color: #ccc;'>Aranıyor...</div>";
  deezerResultsModal.style.display = 'flex';
  
  // Önceki script etiketini kaldır (eğer varsa)
  const eskiScript = document.getElementById('deezerScript');
  if (eskiScript) {
    document.head.removeChild(eskiScript);
  }
  
  // JSONP isteği için yeni script etiketi oluştur
  const script = document.createElement('script');
  script.id = 'deezerScript';
  script.src = `https://api.deezer.com/search?q=${encodeURIComponent(sorgu)}&output=jsonp&callback=deezerJsonpSonuc`;
  document.head.appendChild(script);
}

// URL'den dosyayı indirip sunucuya kaydet
async function indirVeKaydet(url, dosyaAdi) {
  try {
    // Özel karakterleri temizle ve dosya adını güvenli hale getir
    const guvenliDosyaAdi = dosyaAdi.replace(/[^\w\s.-]/gi, '').replace(/\s+/g, '_');
    const dosyaYolu = `songs/${guvenliDosyaAdi}`;
    
    // Sunucuya dosyayı kaydetmek için bir endpoint'e gönder
    const response = await fetch('save_audio.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl: url,
        fileName: guvenliDosyaAdi
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Dosya kaydedilirken bir hata oluştu');
    }
    
    return dosyaYolu; // Sadece dosya yolunu döndür
  } catch (error) {
    console.error('Dosya indirilirken hata oluştu:', error);
    throw error;
  }
}

// Toast mesajları
function showGuncelleToast(msg) {
  const toast = document.getElementById("guncelleToast");
  const toastMsg = document.getElementById("guncelleToastMsg");
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showSuccessToast(msg) {
  const toast = document.getElementById("successToast");
  const toastMsg = document.getElementById("successToastMsg");
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showDeleteToast(msg) {
  const toast = document.getElementById("deleteToast");
  const toastMsg = document.getElementById("deleteToastMsg");
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// --------- Merkez Uyarı Fonksiyonu ---------
function showCenterAlert(msg) {
  let overlay = document.getElementById('formAlertModal');
  if (!overlay) {
    // Stil ekle (yalnızca ilk sefer)
    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'formAlertModal';
    overlay.className = 'modal-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="center-alert-content">
        <h3 style="margin-top:0; font-size:22px; letter-spacing:.3px;">Uyarı</h3>
        <p id="formAlertMessage" style="margin:14px 0 0 0; font-size:17px; line-height:1.45;"></p>
        <button id="formAlertOkBtn">Tamam</button>
      </div>`;
    document.body.appendChild(overlay);

    // Dış alana tıklanınca veya butona basınca kapat
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
    overlay.querySelector('#formAlertOkBtn').addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }
  overlay.querySelector('#formAlertMessage').textContent = msg;
  overlay.style.display = 'flex';
}

// Şarkı listesini güncelle
async function guncelleListe(page = 1) {
  try {
    // Calculate starting number for current page
    const itemsPerPage = 10;
    const startNumber = (page - 1) * itemsPerPage + 1;
    
    sarkiListesi = await apiService.getSongs();
    const listeDiv = document.getElementById("liste");
    listeDiv.innerHTML = "";

    sarkiListesi.forEach((sarki, index) => {
      const currentNumber = startNumber + index;
      const sarkiDiv = document.createElement("div");
      sarkiDiv.className = "sarki-item";
      sarkiDiv.dataset.number = currentNumber;
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
      `;
      // Kategori verilerini dataset olarak ekle
      const kategoriStr = sarki.kategori || '';
      const [anaKat, altKat] = kategoriStr.split('-');
      sarkiDiv.dataset.kategori = anaKat || '';
      sarkiDiv.dataset.alt = altKat || '';

      listeDiv.appendChild(sarkiDiv);
    });

    // Build pagination based on latest list
    if (window.applySongFilters) {
      window.applySongFilters();
    }
  } catch (error) {
    console.error('Error updating song list:', error);
    showGuncelleToast('Şarkı listesi güncellenirken hata oluştu');
  }
}

async function getKategoriler() {
  try {
    const kategoriler = await apiService.getKategoriler("1");
    const kategorilerDiv = document.getElementById("getKategoriler");
    kategorilerDiv.innerHTML = "";

    kategoriler.forEach(kategori => {
      const kategoriDiv = document.createElement("div");
      kategoriDiv.className = "kategori-item";
      kategoriDiv.innerHTML = `
        <span>${kategori.isim}</span>
      `;
      kategorilerDiv.appendChild(kategoriDiv);
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    showGuncelleToast('Kategoriler alınamadı');
  }
}

// Şarkı ekleme işlemi
document.getElementById("ekleBtn").addEventListener("click", async () => {
  const sarki = document.getElementById("sarkiAdi").value.trim();
  const kategori = document.getElementById("kategori").value;
  const altKategori = document.getElementById("altKategori").value;
  const mp3File = document.getElementById("mp3File").files[0];
  const deezerFilePath = document.getElementById("dosyaYoluInput")?.value;

  // Dosya kontrolü
  if (!mp3File && !deezerFilePath) {
    showCenterAlert("Lütfen bir şarkı dosyası yükleyin veya Deezer'dan şarkı seçin!");
    return;
  }

  if (!sarki || !kategori) {
    showCenterAlert("Lütfen tüm alanları doldurun!");
    return;
  }

  const tamKategori = altKategori ? `${kategori}-${altKategori.toLowerCase().replace(' ', '')}` : kategori;
  
  try {
    let dosyaYolu = deezerFilePath;
    
    // Eğer dosya yüklendiyse, onu işle
    if (mp3File) {
      const formData = new FormData();
      formData.append('audio', mp3File);
      formData.append('fileName', mp3File.name.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_'));
      
      const response = await fetch('save_audio.php', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Dosya yüklenirken bir hata oluştu');
      }
      
      const result = await response.json();
      dosyaYolu = result.filePath;
    }
    let kapakYolu = null;
    if (secilenDeezerSarki) {
    const response = await fetch(secilenDeezerSarki.cover);
    const blob = await response.blob();
    const file = new File([blob], secilenDeezerSarki.cover, { type: blob.type });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("song_id",secilenDeezerSarki.id);
    
    const uploadResponse = await fetch("save_photo.php", {
      method: "POST",
      body: formData
    });
    
    const result = await uploadResponse.json();
    kapakYolu = result.kapak;
    }
    
    const newSong = {
      kategori: tamKategori,
      cevap: sarki,
      sarki: " " + sarki + "",
      dosya: dosyaYolu,
      kapak: kapakYolu
    };

    await apiService.addSong(newSong);
    showSuccessToast(' Şarkı başarıyla eklendi!');
    
    // Formu temizle
    document.getElementById("sanatciAdi").value = "";
    document.getElementById("sarkiAdi").value = "";
    document.getElementById("kategori").value = "";
    document.getElementById("altKategori").innerHTML = '<option value="">Alt Kategori Seç</option>';
    document.getElementById("altKategori").style.display = "none";
    document.getElementById("mp3File").value = "";
    
    // Listeyi güncelle
    await guncelleListe();
    
  } catch (error) {
    console.error('Hata:', error);
    showGuncelleToast('Hata: ' + error.message);
  }
});

// Şarkı silme işlemi
async function sarkiSil(sarkiId) {
  const confirmed = await silSarki(sarkiId);
  if (!confirmed) return;
  
  try {
    const index = sarkiListesi.findIndex(song => song.id == sarkiId);
    const songId = sarkiListesi[index].id;
    // Burada API'den silme işlemi yapılacak
    await apiService.deleteSong(songId);
    // dosyayı sil
    const dosyaYolu = sarkiListesi[index].dosya;
    const kapakYolu = sarkiListesi[index].kapak;
    
    showSuccessToast('Şarkı başarıyla silindi');
    
    // dosyayı sil
    const response = await fetch("delete_file.php", {
      method: 'POST',
      body: JSON.stringify({ filePath: dosyaYolu }),
    });

    // dosyayı sil
    const response2 = await fetch("delete_file.php", {
      method: 'POST',
      body: JSON.stringify({ filePath: kapakYolu }),
    });

    await guncelleListe();
    
    // If last item on page was deleted, go to previous page
    const listeDiv = document.getElementById("liste");
    if (listeDiv.children.length === 0 && currentPage > 1) {
      currentPage--;
      await guncelleListe(currentPage);
    }
  } catch (error) {
    console.error('Silme hatası:', error);
    showGuncelleToast('Silme işlemi sırasında hata oluştu');
  }
}

async function silSarki(sarkiId) {
  if (!dialogElements.confirmDialog || !dialogElements.songCount || !dialogElements.confirmMessage) {
    console.error('Dialog elements not initialized');
    return false;
  }
  
  // Show custom confirmation dialog
  dialogElements.songCount.textContent = 1;
  dialogElements.confirmMessage.textContent = 'Seçilen şarkı silinecek. Emin misiniz?';
  dialogElements.confirmDialog.style.display = 'flex';
  
  // Wait for user confirmation
  return new Promise((resolve) => {
    const handleConfirm = () => {
      dialogElements.confirmDelete.removeEventListener('click', handleConfirm);
      dialogElements.confirmCancel.removeEventListener('click', handleCancel);
      dialogElements.confirmDialog.style.display = 'none';
      resolve(true);
    };
    
    const handleCancel = () => {
      dialogElements.confirmDelete.removeEventListener('click', handleConfirm);
      dialogElements.confirmCancel.removeEventListener('click', handleCancel);
      dialogElements.confirmDialog.style.display = 'none';
      resolve(false);
    };
    
    dialogElements.confirmDelete.addEventListener('click', handleConfirm);
    dialogElements.confirmCancel.addEventListener('click', handleCancel);
  });
}

// Batch delete functionality
const batchControls = document.getElementById('batchControls');
const selectedCount = document.getElementById('selectedCount');
const btnBatchDelete = document.getElementById('btnBatchDelete');
const confirmDialog = document.getElementById('confirmDialog');
const confirmMessage = document.getElementById('confirmMessage');
const songCount = document.getElementById('songCount');
const confirmCancel = document.getElementById('confirmCancel');
const confirmDelete = document.getElementById('confirmDelete');

// Toggle batch controls when checkboxes are clicked
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('song-checkbox')) {
    const checkedBoxes = document.querySelectorAll('.song-checkbox:checked');
    if (checkedBoxes.length > 0) {
      batchControls.classList.add('show');
      selectedCount.textContent = `${checkedBoxes.length} şarkı seçildi`;
    } else {
      batchControls.classList.remove('show');
    }
  }
});

// Handle batch delete
btnBatchDelete.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.song-checkbox:checked');
  if (checkboxes.length === 0) return;
  
  // Show custom confirmation dialog
  songCount.textContent = checkboxes.length;
  confirmDialog.style.display = 'flex';
});

// Confirm delete
confirmDelete.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.song-checkbox:checked');
  confirmDialog.style.display = 'none';
  
  try {
    const deletePromises = [];
    checkboxes.forEach(checkbox => {
      const songId = checkbox.dataset.id;
      const index = sarkiListesi.findIndex(song => song.id == songId);
    // dosyayı sil
    const dosyaYolu = sarkiListesi[index].dosya;
    const kapakYolu = sarkiListesi[index].kapak;
    
    showSuccessToast('Şarkı başarıyla silindi');
    
    // dosyayı sil
    const response = fetch("delete_file.php", {
      method: 'POST',
      body: JSON.stringify({ filePath: dosyaYolu }),
    });

    // dosyayı sil
    const response2 = fetch("delete_file.php", {
      method: 'POST',
      body: JSON.stringify({ filePath: kapakYolu }),
    });
      deletePromises.push(apiService.deleteSong(songId));
    });
    
    await Promise.all(deletePromises);
    showSuccessToast(`${checkboxes.length} şarkı başarıyla silindi`);
    await guncelleListe(currentPage);
    batchControls.classList.remove('show');
  } catch (error) {
    console.error('Batch delete error:', error);
    showGuncelleToast('Silme işlemi sırasında hata oluştu');
  }
});

// Cancel delete
confirmCancel.addEventListener('click', () => {
  confirmDialog.style.display = 'none';
});

// Close dialog when clicking outside
confirmDialog.addEventListener('click', (e) => {
  if (e.target === confirmDialog) {
    confirmDialog.style.display = 'none';
  }
});

// Alt kategorileri tanımla
const altKategoriler = {
  turkce: ["Rock", "Pop", "Hip Hop", "Karışık"],
  yabanci: ["Rock", "Pop", "Hip Hop", "Karışık"],
  dizi: ["Türkçe", "Yabancı"],
  film: ["Türkçe", "Yabancı"]
};

// Kategori değiştiğinde alt kategorileri güncelle
document.getElementById('kategori').addEventListener('change', function() {
  const altKategoriSelect = document.getElementById('altKategori');
  const kategori = this.value;
  
  // Alt kategorileri temizle
  altKategoriSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
  
  // Eğer seçilen bir kategori varsa, alt kategorileri doldur
  if (kategori && altKategoriler[kategori]) {
    altKategoriSelect.style.display = 'block';
    altKategoriler[kategori].forEach(kategori => {
      const option = document.createElement('option');
      option.value = kategori.toLowerCase();
      option.textContent = kategori;
      altKategoriSelect.appendChild(option);
    });
  } else {
    altKategoriSelect.style.display = 'none';
  }
});

// Dosya yükleme işlemleri
document.getElementById('dosyaYukleBtn').addEventListener('click', () => {
  document.getElementById('mp3File').click();
});

// Sadece şarkı adını doldur, dosyayı form gönderimine bırak
document.getElementById('mp3File').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Şarkı adını otomatik doldur (uzantıyı kaldırarak)
  const songName = file.name.replace(/\.mp3$/i, '');
  document.getElementById('sarkiAdi').value = songName;
  
  showSuccessToast('Dosya seçildi! Şimdi formu gönderebilirsiniz.');
});

// Deezer arama butonuna tıklama olayı ekle
// Deezer arama modal öğeleri
const deezerModal = document.getElementById('deezerSearchModal');
const deezerSearchInput = document.getElementById('deezerSearchInput');
const deezerSearchGo   = document.getElementById('deezerSearchGo');
const deezerSearchCancel = document.getElementById('deezerSearchCancel');

// Deezer sonuç modal öğeleri
const deezerResultsModal = document.getElementById('deezerResultsModal');
const deezerResultsList  = document.getElementById('deezerResultsList');
const deezerResultsClose = document.getElementById('deezerResultsClose');

deezerResultsClose.addEventListener('click', () => {
  deezerResultsModal.style.display = 'none';
});

// Modal dışına tıklanınca kapat (sonuçlar)
deezerResultsModal.addEventListener('click', (e) => {
  if (e.target === deezerResultsModal) {
    deezerResultsModal.style.display = 'none';
  }
});

function openDeezerModal() {
  deezerSearchInput.value = '';
  deezerModal.style.display = 'flex';
  // input'u odakla
  setTimeout(() => deezerSearchInput.focus(), 0);
}

function closeDeezerModal() {
  deezerModal.style.display = 'none';
}

// Deezer arama butonuna tıklama olayı ekle
document.getElementById('deezerAraBtn').addEventListener('click', () => {
  openDeezerModal();
});

deezerSearchCancel.addEventListener('click', closeDeezerModal);

deezerSearchGo.addEventListener('click', () => {
  const query = deezerSearchInput.value.trim();
  if (query) {
    closeDeezerModal();
    deezerAra(query);
  } else {
    deezerSearchInput.focus();
  }
});

// Enter tuşuna basıldığında da arama yap
deezerSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    deezerSearchGo.click();
  }
});

// Modal dışına tıklanınca kapat
deezerModal.addEventListener('click', (e) => {
  if (e.target === deezerModal) {
    closeDeezerModal();
  }
});

async function checkLogin() {
  const adminGiris = localStorage.getItem("adminGiris");
  if (!adminGiris) {
    window.location.href = "login.html";
  }
}

// Global scope'a fonksiyonları ekle
window.sarkiSil = sarkiSil;
window.sarkiDuzenle = function(index) {
  const song = sarkiListesi[index];
  
  // Get modal elements
  const modal = document.getElementById('sarkiDuzenleModal');
  const songIdInput = document.getElementById('duzenleSarkiId');
  const songNameInput = document.getElementById('duzenleSarkiAdi');
  const categorySelect = document.getElementById('duzenleKategori');
  const subcategorySelect = document.getElementById('duzenleAltKategori');
  
  // Populate fields with song data
  songIdInput.value = song.id;
  songNameInput.value = song.cevap;
  
  // Parse category and subcategory
  const [category, subcategory] = song.kategori ? song.kategori.split('-') : ['', ''];
  categorySelect.value = category;
  
  // Update subcategories based on category
  subcategorySelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
  if (category && altKategoriler[category]) {
    subcategorySelect.style.display = 'block';
    altKategoriler[category].forEach(subcat => {
      const option = document.createElement('option');
      option.value = subcat.toLowerCase();
      option.textContent = subcat;
      subcategorySelect.appendChild(option);
    });
    subcategorySelect.value = subcategory || '';
  } else {
    subcategorySelect.style.display = 'none';
  }
  
  // Show modal
  modal.style.display = 'flex';
};

// Şarkı güncelleme işlevi
async function updateSong(songData) {
  try {
    const updatedSong = await apiService.updateSong(songData);
    console.log('Song updated:', updatedSong);
    return updatedSong;
  } catch (error) {
    console.error('Error updating song:', error);
    alert('Şarkı güncellenirken hata oluştu: ' + error.message);
    throw error;
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
    dosya: document.getElementById('mp3File').value
  };

  try {
    let result;
    
    if (songData.id) {
      // Şarkı güncelleme
      result = await updateSong(songData);
      alert('Şarkı başarıyla güncellendi!');
    } else {
      // Yeni şarkı ekleme
      result = await apiService.addSong(songData);
      alert('Şarkı başarıyla eklendi!');
    }
    
    // Formu temizle ve listeyi güncelle
    resetForm();
    loadSongs();
    
    return result;
  } catch (error) {
    console.error('Error saving song:', error);
  }
}

// Sayfa yüklendiğinde listeyi güncelle
document.addEventListener("DOMContentLoaded", async function() {
  await checkLogin();
  await guncelleListe();
  await getKategoriler();
  const linkliSongsBtn = document.getElementById("linkliSongs");
  if (linkliSongsBtn) {
    linkliSongsBtn.addEventListener("click", async function() {
      try {
        const linkliSongs = await apiService.linkliSongs();
        console.log('Found songs:', linkliSongs);
        
        if (!linkliSongs || linkliSongs.length === 0) {
          alert('Bağlantılı şarkı bulunamadı');
          return;
        }
        
        // Tüm yüklemeleri takip et
        const uploadPromises = [];
        
        linkliSongs.forEach(song => {
          if (song.kapak) {
            uploadPromises.push(
              (async () => {
                try {
                  console.log(`Downloading cover for song ${song.id}: ${song.kapak}`);
                  const response = await fetch(song.kapak);
                  const blob = await response.blob();
                  const file = new File([blob], song.kapak, { type: blob.type });
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("song_id", song.id);
                  
                  console.log(`Uploading cover for song ${song.id}`);
                  const uploadResponse = await fetch("save_photo.php", {
                    method: "POST",
                    body: formData
                  });
                  
                  const result = await uploadResponse.json();
                  
                  if (result.error) {
                    console.error(`Photo upload failed for song ${song.id}:`, result.error);
                    return { success: false, songId: song.id, error: result.error };
                  } else {
                    console.log(`Photo uploaded successfully for song ${song.id}:`, result);
                    song.kapak = result.kapak;
                    
                    // Veritabanını güncelle
                    try {
                      const updateResult = await apiService.updateSong({
                        id: song.id,
                        kapak: result.kapak
                      });
                      console.log(`Database updated for song ${song.id}:`, updateResult);
                      return { success: true, songId: song.id, dbUpdated: true };
                    } catch (updateError) {
                      console.error(`Database update failed for song ${song.id}:`, updateError);
                      return { 
                        success: false, 
                        songId: song.id, 
                        error: `Photo uploaded but database update failed: ${updateError.message}` 
                      };
                    }
                  }
                } catch (error) {
                  console.error(`Upload failed for song ${song.id}:`, error);
                  return { success: false, songId: song.id, error: error.message };
                }
              })()
            );
          }
        });
        
        // Tüm yüklemelerin tamamlanmasını bekle
        const results = await Promise.all(uploadPromises);
        
        // Sonuçları analiz et
        const successfulUploads = results.filter(r => r.success).length;
        const failedUploads = results.filter(r => !r.success);
        
        if (failedUploads.length > 0) {
          console.error('Failed uploads:', failedUploads);
          alert(`${successfulUploads} kapak başarıyla yüklendi, ${failedUploads.length} kapak yüklenemedi`);
        } else {
          alert(`Tüm kapaklar başarıyla yüklendi (${successfulUploads} adet)`);
        }
        
        // Güncellenmiş şarkı listesini göster
        console.log('Updated songs:', linkliSongs);
      } catch (error) {
        console.error('Error processing linkli songs:', error);
        alert('Şarkı listesi alınırken hata oluştu: ' + error.message);
      }
    });
  }
  
  // Kategori değiştiğinde alt kategorileri güncelle
  document.getElementById("kategori").addEventListener("change", function() {
    const altKategoriSelect = document.getElementById("altKategori");
    const kategori = this.value;
    
    altKategoriSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
    
    if (kategori === "turkce" || kategori === "yabanci") {
      const altKategoriler = ["Pop", "Rock", "Hip Hop"];
      altKategoriler.forEach(kategori => {
        const option = document.createElement("option");
        option.value = kategori;  
        option.textContent = kategori;
        altKategoriSelect.appendChild(option);
      });
    } else if (kategori === "dizi" || kategori === "film") {
      const altKategoriler = ["Türkçe", "Yabancı"];
      altKategoriler.forEach(kategori => {
        const option = document.createElement("option");
        option.value = kategori.toLowerCase();
        option.textContent = kategori;
        altKategoriSelect.appendChild(option);
      });
    }
  });
});

// Modal save button event listener
document.getElementById('popupKaydet').addEventListener('click', async function() {
  const modal = document.getElementById('sarkiDuzenleModal');
  const songId = document.getElementById('duzenleSarkiId').value;
  const songName = document.getElementById('duzenleSarkiAdi').value.trim();
  const category = document.getElementById('duzenleKategori').value;
  const subcategory = document.getElementById('duzenleAltKategori').value;
  
  if (!songName || !category) {
    showCenterAlert('Lütfen tüm alanları doldurun!');
    return;
  }
  
  const fullCategory = subcategory ? `${category}-${subcategory.toLowerCase().replace(' ', '')}` : category;
  
  try {
    await apiService.updateSong({
      id: songId,
      cevap: songName,
      kategori: fullCategory
    });
    
    // Oyun verilerini güncelle
    if (window.soruListesi) {
      const updatedSong = window.soruListesi.find(s => s.id === songId);
      if (updatedSong) {
        updatedSong.sarki = songName;
      }
    }
    
    // Oyun arayüzünü yenile
    if (window.guncelleSoru) {
      window.guncelleSoru();
    }
    
    showSuccessToast('Şarkı başarıyla güncellendi!');
    modal.style.display = 'none';
    await guncelleListe(currentPage);
  } catch (error) {
    console.error('Update error:', error);
    showGuncelleToast('Güncelleme sırasında hata oluştu');
  }
});

// Modal delete button event listener
document.getElementById('popupSil').addEventListener('click', async function() {
  const modal = document.getElementById('sarkiDuzenleModal');
  const songId = document.getElementById('duzenleSarkiId').value;
  
  modal.style.display = 'none';
  await sarkiSil(songId);
});

// Close modal when clicking outside
const editModal = document.getElementById('sarkiDuzenleModal');
editModal.addEventListener('click', function(e) {
  if (e.target === editModal) {
    editModal.style.display = 'none';
  }
});

// Delete confirmation modal elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteConfirmBtn   = document.getElementById('deleteConfirmBtn');
const deleteCancelBtn    = document.getElementById('deleteCancelBtn');

// Form reset function
function resetForm() {
  document.getElementById("sanatciAdi").value = "";
  document.getElementById("sarkiAdi").value = "";
  document.getElementById("kategori").value = "";
  document.getElementById("altKategori").innerHTML = '<option value="">Alt Kategori Seç</option>';
  document.getElementById("altKategori").style.display = "none";
  document.getElementById("mp3File").value = "";
}

// Listen for section changes
const panelSections = document.querySelectorAll('.panel-section');
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'class') {
      resetForm();
    }
  });
});

panelSections.forEach(section => {
  observer.observe(section, { attributes: true });
});

// Add event listeners to menu items
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    if (!item.classList.contains('active')) {
      resetForm();
    }
  });
});
