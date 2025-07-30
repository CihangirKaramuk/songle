import apiService from '../apiService.js';

let islemKayitlari = [];
let sarkiListesi = [];
let duzenlenenIndex = null;
let siralamaArtan = true;
let seciliIndex = null;
let silinecekIndex = null;
let secilenDeezerSarki = null;

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

// ------- Şarkı Listesi Arama & Kategori Filtre Özelliği -------
document.addEventListener('DOMContentLoaded', () => {
  const searchInput   = document.getElementById('aramaInput');
  const katSelect     = document.getElementById('filterKategori');
  const altSelect     = document.getElementById('filterAltKategori');
  const paginationDiv = document.getElementById('pagination');
  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;

  if (!searchInput && !katSelect) return;

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
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  function applyFilters() {
    // Expose for other scripts
    window.applySongFilters = applyFilters;
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const kat  = katSelect ? katSelect.value : '';
    const alt  = altSelect ? altSelect.value : '';

    const allItems = Array.from(document.querySelectorAll('#liste .sarki-item'));
    const filtered = [];

    allItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const itemKat = item.dataset.kategori || '';
      const itemAlt = item.dataset.alt || '';
      const matchesTerm = term ? text.includes(term) : true;
      const matchesKat  = kat ? itemKat === kat : true;
      const matchesAlt  = alt ? itemAlt === alt : true;
      if (matchesTerm && matchesKat && matchesAlt) {
        filtered.push(item);
      }
      // tüm öğeleri gizle
      item.style.display = 'none';
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex   = startIndex + ITEMS_PER_PAGE;
    filtered.slice(startIndex, endIndex).forEach(item => item.style.display = 'flex');

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
async function guncelleListe() {
  try {
    sarkiListesi = await apiService.getSongs();
    const listeDiv = document.getElementById("liste");
    listeDiv.innerHTML = "";

    sarkiListesi.forEach((sarki, index) => {
      const sarkiDiv = document.createElement("div");
      sarkiDiv.className = "sarki-item";
      sarkiDiv.innerHTML = `
        <div class="sarki-bilgi">
          <span class="sarki-ad">${sarki.cevap}</span>
          <span class="sarki-kategori">${sarki.kategori}</span>
        </div>
        <div class="sarki-actions">
          <button class="btn btn-edit" onclick="sarkiDuzenle(${index})">Düzenle</button>
          <button class="btn btn-delete" onclick="sarkiSil(${index})">Sil</button>
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
    
    const newSong = {
      kategori: tamKategori,
      cevap: sarki,
      sarki: "🎵 " + sarki + "",
      dosya: dosyaYolu,
      kapak: (secilenDeezerSarki && secilenDeezerSarki.cover) ? secilenDeezerSarki.cover : null
    };

    await apiService.addSong(newSong);
    showSuccessToast('✅ Şarkı başarıyla eklendi!');
    
    // Formu temizle
    document.getElementById("sarkiAdi").value = "";
    document.getElementById("kategori").value = "";
    document.getElementById("altKategori").innerHTML = '<option value="">Alt Kategori Seç</option>';
    document.getElementById("mp3File").value = "";
    
    // Listeyi güncelle
    await guncelleListe();
    
  } catch (error) {
    console.error('Hata:', error);
    showGuncelleToast('Hata: ' + error.message);
  }
});

// Şarkı silme işlemi
async function performDeleteSong(index) {


  try {
    const songId = sarkiListesi[index].id;
    // Burada API'den silme işlemi yapılacak
    await apiService.deleteSong(songId);
    // dosyayı sil
    const dosyaYolu = sarkiListesi[index].dosya;
    
    showSuccessToast('Şarkı başarıyla silindi');
    await guncelleListe();
    
    // dosyayı sil
    const response = await fetch("delete_audio.php", {
      method: 'POST',
      body: JSON.stringify({ filePath: dosyaYolu }),
    });
    
    if (!response.success) {
      throw new Error('Dosya silinirken bir hata oluştu');
    }
    
    showSuccessToast('Dosya başarıyla silindi');
  } catch (error) {
    console.error('Error deleting song:', error);
    showGuncelleToast('Şarkı silinirken bir hata oluştu');
  }
}

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
  const secilenKategori = this.value;
  
  // Alt kategorileri temizle
  altKategoriSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
  
  // Eğer seçilen bir kategori varsa, alt kategorileri doldur
  if (secilenKategori && altKategoriler[secilenKategori]) {
    altKategoriSelect.style.display = 'block';
    altKategoriler[secilenKategori].forEach(kategori => {
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

function logout() {
  localStorage.removeItem("adminGiris");
  window.location.href = "login.html";
}

document.getElementById("logoutBtn").addEventListener("click", logout);

// Form reset function
function resetForm() {
  document.getElementById("sanatciAdi").value = "";
  document.getElementById("sarkiAdi").value = "";
  document.getElementById("kategori").value = "";
  document.getElementById("altKategori").innerHTML = '<option value="">Alt Kategori Seç *</option>';
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

// Sayfa yüklendiğinde listeyi güncelle
document.addEventListener("DOMContentLoaded", async function() {
  await checkLogin();
  await guncelleListe();
  await getKategoriler();
  
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

// Delete confirmation modal elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteConfirmBtn   = document.getElementById('deleteConfirmBtn');
const deleteCancelBtn    = document.getElementById('deleteCancelBtn');

function sarkiSil(index) {
  silinecekIndex = index;
  deleteConfirmModal.style.display = 'flex';
}

deleteConfirmBtn.addEventListener('click', async () => {
  if (silinecekIndex !== null) {
    await performDeleteSong(silinecekIndex);
    silinecekIndex = null;
    await guncelleListe();
  }
  deleteConfirmModal.style.display = 'none';
});

deleteCancelBtn.addEventListener('click', () => {
  silinecekIndex = null;
  deleteConfirmModal.style.display = 'none';
});

deleteConfirmModal.addEventListener('click', (e) => {
  if (e.target === deleteConfirmModal) {
    silinecekIndex = null;
    deleteConfirmModal.style.display = 'none';
  }
});

// Global scope'a fonksiyonları ekle
window.sarkiSil = sarkiSil;
window.sarkiDuzenle = function(index) {
  // Düzenleme işlevselliği buraya eklenecek
  showGuncelleToast('Düzenleme özelliği yakında eklenecek');
};
