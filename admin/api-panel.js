import apiService from '../apiService.js';

let islemKayitlari = [];
let sarkiListesi = [];
let duzenlenenIndex = null;
let siralamaArtan = true;
let seciliIndex = null;
let silinecekIndex = null;
let secilenDeezerSarki = null;

// Global function for Deezer JSONP callback
window.deezerJsonpSonuc = function(response) {
  const sonuclarUl = document.getElementById("deezerSonuclar");
  sonuclarUl.innerHTML = "";
  sonuclarUl.style.display = "block";

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
      <div style="flex: 1;">
        <div style="font-weight: bold; color: #fff;">${sarki.artist.name}</div>
        <div style="font-size: 0.9em; color: #aaa;">${sarki.title_short}</div>
      </div>
      <button class="ekle-btn" style="background: #4CAF50; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
        Seç
      </button>
    `;
    
    const btn = div.querySelector('.ekle-btn');
    btn.addEventListener('click', () => {
      secilenDeezerSarki = {
        artist: sarki.artist.name,
        title: sarki.title_short,
        preview: sarki.preview
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
      
      sonuclarUl.style.display = "none";
    });
    
    sonuclarUl.appendChild(div);
  });
};

// Deezer'dan şarkı arama fonksiyonu
async function deezerAra(sorgu) {
  const sonuclarUl = document.getElementById("deezerSonuclar");
  sonuclarUl.innerHTML = "<div style='padding: 10px; color: #ccc;'>Aranıyor...</div>";
  sonuclarUl.style.display = "block";
  
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
      listeDiv.appendChild(sarkiDiv);
    });
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
    alert("Lütfen bir şarkı dosyası yükleyin veya Deezer'dan şarkı seçin!");
    return;
  }

  if (!sarki || !kategori) {
    alert("Lütfen tüm alanları doldurun!");
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
      sarki: "🎵 Şarkı çalıyor. (" + sarki + ")",
      dosya: dosyaYolu
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
async function sarkiSil(index) {
  if (!confirm("Bu şarkıyı silmek istediğinize emin misiniz?")) {
    return;
  }

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
document.getElementById('deezerAraBtn').addEventListener('click', () => {
  const sarkiAdi = prompt('Aramak istediğiniz şarkı adını girin:');
  if (sarkiAdi) {
    deezerAra(sarkiAdi);
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

// Global scope'a fonksiyonları ekle
window.sarkiSil = sarkiSil;
window.sarkiDuzenle = function(index) {
  // Düzenleme işlevselliği buraya eklenecek
  showGuncelleToast('Düzenleme özelliği yakında eklenecek');
};
