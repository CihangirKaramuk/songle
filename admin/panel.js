let islemKayitlari = JSON.parse(localStorage.getItem("islemKayitlari")) || [];
let acikIslemDetay = null;
let sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
let duzenlenenIndex = null;
let siralamaArtan = true;
let silinecekIndex = null;
let altKategoriler = {
  turkce: ["Rock", "Pop", "Hip Hop", "Karışık"],
  yabanci: ["Rock", "Pop", "Hip Hop", "Karışık"],
  dizi: ["Türkçe", "Yabancı"],
  film: ["Türkçe", "Yabancı"]
};

// 1. DEEZER ENTEGRASYONU
window.deezerJsonpSonuc = function(response) {
  const sonuclarUl = document.getElementById("deezerSonuclar");
  sonuclarUl.innerHTML = "";

  if (!response.data || response.data.length === 0) {
    sonuclarUl.innerHTML = "<li>Sonuç bulunamadı</li>";
    return;
  }

  response.data.slice(0, 7).forEach(sarki => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="sarki-info">
        <b>${sarki.artist.name}</b> - ${sarki.title_short}
      </div>
      <button class="ekle-btn" 
              data-artist="${sarki.artist.name}" 
              data-title="${sarki.title_short}" 
              data-preview="${sarki.preview}">
        Ekle
      </button>
    `;
    sonuclarUl.appendChild(li);
  });

  document.querySelectorAll('.ekle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      window.secilenDeezerSarki = {
        artist: { name: this.getAttribute('data-artist') },
        title_short: this.getAttribute('data-title'),
        preview: this.getAttribute('data-preview')
      };
      document.getElementById("deezerKategoriModal").style.display = "flex";
      
      // Modal açıldığında seçimleri resetle
      document.getElementById("deezerKategoriSelect").value = "";
      document.getElementById("deezerAltKategoriSelect").innerHTML = '<option value="">Alt Kategori Seç</option>';
      document.getElementById("deezerAltKategoriContainer").style.display = "none";
    });
  });
};

// 2. İŞLEM KAYDI YÖNETİMİ
document.getElementById("islemTopluSilBtn").addEventListener("click", function(e) {
  e.stopPropagation();
  const menu = document.getElementById("topluSilMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.querySelectorAll(".toplu-sil-btn").forEach(btn => {
  btn.addEventListener("click", function(e) {
    e.stopPropagation();
    const tip = this.getAttribute("data-tip");
    const simdi = new Date();
    let silinecekler = [];
    
    switch(tip) {
      case "son":
        if (islemKayitlari.length > 0) silinecekler = [islemKayitlari.length - 1];
        break;
      case "saat":
        silinecekler = islemKayitlari.map((kayit, index) => 
          (simdi - new Date(kayit.tarih)) <= 3600000 ? index : -1
        ).filter(i => i !== -1);
        break;
      case "gun":
        const bugun = new Date().toDateString();
        silinecekler = islemKayitlari.map((kayit, index) => 
          new Date(kayit.tarih).toDateString() === bugun ? index : -1
        ).filter(i => i !== -1);
        break;
      case "tum":
        silinecekler = islemKayitlari.map((_, index) => index);
        break;
    }

    if (silinecekler.length === 0) {
      showDeleteToast("Silinecek işlem bulunamadı");
      document.getElementById("topluSilMenu").style.display = "none";
      return;
    }

    document.getElementById("modal-onay").style.display = "flex";
    document.getElementById("modal-onay").style.zIndex = "1001";
    document.getElementById("modal-msg").textContent = 
      `${silinecekler.length} işlem kaydı silinecek. Emin misiniz?`;

    const tempEvetBtn = function() {
      silinecekler.sort((a, b) => b - a).forEach(index => {
        islemKayitlari.splice(index, 1);
      });
      localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
      guncelleIslemKaydiListesi();
      showDeleteToast(`${silinecekler.length} işlem kaydı silindi`);
      document.getElementById("modal-onay").style.display = "none";
      document.getElementById("topluSilMenu").style.display = "none";
      document.getElementById("btn-evet").removeEventListener("click", tempEvetBtn);
    };

    document.getElementById("btn-evet").addEventListener("click", tempEvetBtn);
  });
});

// 3. TOAST MESAJLARI
function showGuncelleToast(msg) {
  const toast = document.getElementById("toast-guncelle");
  toast.innerHTML = `<span style="font-size:22px;line-height:1;vertical-align:middle;">✅</span> ${msg}`;
  toast.classList.add("show");
  toast.classList.remove("hide");
  clearTimeout(window.toastGuncelleTimeout);
  window.toastGuncelleTimeout = setTimeout(() => {
    toast.classList.add("hide");
    toast.classList.remove("show");
  }, 3000);
}

function showSuccessToast(msg) {
  const toast = document.getElementById("toast-success");
  toast.textContent = msg;
  toast.classList.add("show");
  toast.classList.remove("hide");
  clearTimeout(window.toastSuccessTimeout);
  window.toastSuccessTimeout = setTimeout(() => {
    toast.classList.add("hide");
    toast.classList.remove("show");
  }, 3000);
}

function showDeleteToast(msg) {
  const toast = document.getElementById("toast-delete");
  toast.textContent = msg;
  toast.classList.add("show");
  toast.classList.remove("hide");
  clearTimeout(window.toastDeleteTimeout);
  window.toastDeleteTimeout = setTimeout(() => {
    toast.classList.add("hide");
    toast.classList.remove("show");
  }, 3000);
}

// 4. ŞARKI LİSTESİ YÖNETİMİ
function guncelleListe() {
  const arama = document.getElementById("aramaInput")?.value?.toLowerCase() || "";
  const kategori = document.getElementById("kategoriFiltre")?.value || "tum";
  const altKategori = document.getElementById("altKategoriFiltre")?.value || "";
  const ul = document.getElementById("sarkiListesi");
  ul.innerHTML = "";

  let filtrelenmisListe = sarkiListesi
    .filter(sarki =>
      (kategori === "tum" || sarki.kategori === kategori || sarki.kategori.startsWith(kategori + "-")) &&
      (!altKategori || sarki.kategori === altKategori) &&
      sarki.cevap.toLowerCase().includes(arama)
    );

  filtrelenmisListe.sort((a, b) => {
    const sanatciA = a.cevap.toLowerCase();
    const sanatciB = b.cevap.toLowerCase();
    return siralamaArtan ? sanatciA.localeCompare(sanatciB) : sanatciB.localeCompare(sanatciA);
  });

  filtrelenmisListe.forEach((sarki, index) => {
    const realIndex = sarkiListesi.findIndex(s =>
      s.cevap === sarki.cevap && s.kategori === sarki.kategori
    );
    const li = document.createElement("li");
    li.innerHTML = `
      [${sarki.kategori}] ${sarki.cevap}
      <div class="btn-group">
        <button class="duzenleBtn" data-index="${realIndex}">✏️</button>
        <button class="silBtn" data-index="${realIndex}">🗑️</button>
        ${sarki.audio ? '<span class="audio-var">🎵</span>' : ''}
      </div>
    `;
    ul.appendChild(li);
  });

  // Düzenle butonlarına event listener ekle
  document.querySelectorAll('.duzenleBtn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      sarkiDuzenleManual(sarkiListesi[index]);
    });
  });

  // Sil butonlarına event listener ekle
  document.querySelectorAll('.silBtn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      sarkiSil(index);
    });
  });

  document.getElementById("duzenleFormu").style.display = "none";
}

// 5. ŞARKI DÜZENLEME
document.getElementById("kaydetBtn").addEventListener("click", () => {
  const yeniSanatci = document.getElementById("duzenleSanatci").value.trim();
  const yeniSarki = document.getElementById("duzenleSarki").value.trim();
  const yeniKategori = document.getElementById("duzenleKategori").value;
  const yeniAltKategori = document.getElementById("duzenleAltKategoriSec").value;

  if (!yeniSanatci || !yeniSarki || !yeniKategori) {
    alert("Lütfen geçerli tüm bilgileri girin.");
    return;
  }

  const tamKategori = yeniAltKategori ? yeniAltKategori : yeniKategori;
  const tamCevap = `${yeniSanatci} - ${yeniSarki}`;
  const gosterim = `🎵 Şarkı çalıyor... (${tamCevap})`;

  const eskiSarki = sarkiListesi[duzenlenenIndex];
  islemKayitlari.push({
    baslik: "Şarkı Düzenlendi",
    tarih: new Date().toLocaleString("tr-TR"),
    detay: {
      oncekiBilgi: `${eskiSarki.cevap} (${eskiSarki.kategori})`,
      yeniBilgi: `${tamCevap} (${tamKategori})`
    },
    tur: "duzenle"
  });

  sarkiListesi[duzenlenenIndex] = {
    kategori: tamKategori,
    cevap: tamCevap,
    sarki: gosterim,
    dosya: eskiSarki.dosya
  };

  localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
  localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
  
  guncelleListe();
  guncelleIslemKaydiListesi();
  showGuncelleToast('Güncellendi');
  document.getElementById("duzenleFormu").style.display = "none";
});

// 6. ŞARKI EKLEME
document.getElementById("ekleBtn").addEventListener("click", () => {
  const sarki = document.getElementById("sarkiAdi").value.trim();
  const sanatci = document.getElementById("sanatciAdi").value.trim();
  const anaKategori = document.getElementById("kategori").value;
  const altKategori = document.getElementById("altKategori").value;
  const mp3Input = document.getElementById("mp3File");

  if ((anaKategori === "turkce" || anaKategori === "yabanci") && !altKategori) {
    alert("Lütfen alt kategori seçin!");
    return;
  }

  if (!sarki || !sanatci || !anaKategori || !mp3Input.files[0]) {
    alert("Lütfen tüm alanları doldurun ve MP3 dosyası yükleyin!");
    return;
  }

  const tamKategori = altKategori ? `${anaKategori}-${altKategori.toLowerCase().replace(' ', '')}` : anaKategori;
  const file = mp3Input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const audioData = e.target.result;
    const tamCevap = `${sanatci} - ${sarki}`;
    const gosterim = `🎵 Şarkı çalıyor. (${tamCevap})`;

    sarkiListesi.push({
      kategori: tamKategori,
      cevap: tamCevap,
      sarki: gosterim,
      dosya: audioData
    });

    localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
    showSuccessToast('✅ Şarkı başarıyla eklendi!');

    islemKayitlari.push({
      baslik: "Şarkı Eklendi",
      tarih: new Date().toLocaleString("tr-TR"),
      detay: { "Sanatçı": sanatci, "Şarkı": sarki, "Kategori": tamKategori },
      tur: "ekle"
    });
    localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));

    document.getElementById("sarkiAdi").value = "";
    document.getElementById("sanatciAdi").value = "";
    document.getElementById("kategori").value = "";
    document.getElementById("altKategori").innerHTML = '<option value="">Alt Kategori Seç</option>';
    document.getElementById("mp3File").value = "";
    
    guncelleIslemKaydiListesi();
    guncelleListe();
  };
  reader.readAsDataURL(file);
});

// 7. ŞARKI SİLME
function sarkiSil(index) {
  if (!document.getElementById("liste").classList.contains("active")) return;
  silinecekIndex = index;
  document.getElementById("modal-onay").style.display = "flex";
  document.getElementById("modal-onay").style.zIndex = "1001";
  document.getElementById("modal-msg").textContent = "Şarkıyı silmek istediğine emin misin?";
}

// 8. MODAL İŞLEMLERİ
document.getElementById("btn-evet").onclick = function() {
  if (silinecekIndex !== null) {
    const silinenSarki = sarkiListesi[silinecekIndex];
    islemKayitlari.push({
      baslik: "Şarkı Silindi",
      tarih: new Date().toLocaleString("tr-TR"),
      detay: {
        "Sanatçı": silinenSarki.cevap.split(" - ")[0] || "-",
        "Şarkı": silinenSarki.cevap.split(" - ")[1] || "-",
        "Kategori": silinenSarki.kategori || "-"
      },
      tur: "sil"
    });

    sarkiListesi.splice(silinecekIndex, 1);
    localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
    localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
    
    guncelleListe();
    guncelleIslemKaydiListesi();
    showDeleteToast('🗑️ Şarkı silindi!');
    silinecekIndex = null;
  }
  document.getElementById("modal-onay").style.display = "none";
  document.getElementById("modal-onay").style.zIndex = "";
};

document.getElementById("btn-hayir").onclick = function() {
  document.getElementById("modal-onay").style.display = "none";
  document.getElementById("modal-onay").style.zIndex = "";
  silinecekIndex = null;
};

// 9. İŞLEM KAYDI DETAY
function islemDetayGoster(index) {
  const kayit = islemKayitlari[index];
  
  let detayHTML = `
    <div class="modal-detay-container">
      <div class="modal-detay-baslik">${kayit.baslik}</div>
  `;

  if (kayit.tur === "duzenle") {
    detayHTML += `
      <div class="modal-detay-grup">
        <div class="modal-detay-altbaslik" style="color:#ff7675;">Önceki:</div>
        <div class="modal-detay-icerik">${kayit.detay.oncekiBilgi || 'Bilgi yok'}</div>
      </div>
      <div class="modal-detay-grup">
        <div class="modal-detay-altbaslik" style="color:#55efc4;">Sonraki:</div>
        <div class="modal-detay-icerik">${kayit.detay.yeniBilgi || 'Bilgi yok'}</div>
      </div>
    `;
  } else {
    detayHTML += `
      <div class="modal-detay-grup">
        ${Object.entries(kayit.detay).map(([key, value]) => `
          <div class="modal-detay-satir">
            <span class="modal-detay-anahtar">${key}:</span>
            <span class="modal-detay-deger">${value || 'Bilgi yok'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  detayHTML += `
      <div class="modal-detay-footer">
        <div class="modal-detay-tarih">${kayit.tarih}</div>
        <button id="islemKaydiSilBtn" class="modal-detay-sil-btn">Sil</button>
      </div>
    </div>
  `;

  const modal = document.createElement("div");
  modal.className = "modal-detay-arkaplan";
  modal.style.zIndex = "1000";
  modal.innerHTML = detayHTML;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });

  modal.querySelector("#islemKaydiSilBtn").addEventListener("click", () => {
    document.getElementById("modal-onay").style.display = "flex";
    document.getElementById("modal-onay").style.zIndex = "1002";
    document.getElementById("modal-msg").textContent = "Bu işlem kaydını silmek istediğinize emin misiniz?";

    document.getElementById("btn-evet").onclick = function() {
      islemKayitlari.splice(index, 1);
      localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
      guncelleIslemKaydiListesi();
      showDeleteToast("İşlem kaydı silindi");
      document.getElementById("modal-onay").style.display = "none";
      document.body.removeChild(modal);
    };
  });

  document.body.appendChild(modal);
}

// 10. İŞLEM KAYDI LİSTESİ
function guncelleIslemKaydiListesi() {
  const ul = document.getElementById("islemKaydiListesi");
  ul.innerHTML = "";

  if (islemKayitlari.length === 0) {
    ul.innerHTML = `<li style="color:#888;padding:14px;">Hiç işlem kaydı yok.</li>`;
    return;
  }

  islemKayitlari.slice().reverse().forEach((kayit, i) => {
    const index = islemKayitlari.length - 1 - i;
    const li = document.createElement("li");
    li.className = "islem-kaydi-item";
    li.innerHTML = `
      <span>${kayit.baslik}</span>
      <span class="islem-kaydi-tarih">${kayit.tarih}</span>
    `;
    li.onclick = () => islemDetayGoster(index);
    ul.appendChild(li);
  });
}

// 11. KATEGORİ FİLTRELEME
document.getElementById("kategoriFiltre").addEventListener("change", function() {
  const anaKategori = this.value;
  const altKategoriFiltre = document.getElementById("altKategoriFiltre");
  
  altKategoriFiltre.innerHTML = '<option value="">Alt Kategori Seç</option>';
  altKategoriFiltre.style.display = "none";

  if (altKategoriler[anaKategori]) {
    altKategoriFiltre.style.display = "inline-block";
    altKategoriler[anaKategori].forEach(alt => {
      const option = document.createElement("option");
      option.value = `${anaKategori}-${alt.toLowerCase().replace(' ', '')}`;
      option.textContent = alt;
      altKategoriFiltre.appendChild(option);
    });
  }
  guncelleListe();
});

// 12. A-Z / Z-A SIRALAMA
document.getElementById("siralaBtn").addEventListener("click", () => {
  siralamaArtan = !siralamaArtan;
  document.getElementById("siralaBtn").textContent = siralamaArtan ? "🔼 A-Z Sırala" : "🔽 Z-A Sırala";
  guncelleListe();
});

// 13. DEEZER ARAMA
document.getElementById("deezerAramaBtn").addEventListener("click", function() {
  const query = document.getElementById("deezerAramaInput").value.trim();
  const sonuclarUl = document.getElementById("deezerSonuclar");
  
  if (!query) {
    sonuclarUl.innerHTML = "<li>Arama terimi girin</li>";
    return;
  }

  sonuclarUl.innerHTML = "<li>Aranıyor...</li>";

  const eskiScript = document.getElementById("deezerAramaScript");
  if (eskiScript) eskiScript.remove();

  const script = document.createElement("script");
  script.id = "deezerAramaScript";
  script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=deezerJsonpSonuc`;
  document.body.appendChild(script);
});

// 14. ŞARKI DÜZENLEME FONKSİYONU
function sarkiDuzenleManual(sarki) {
  document.getElementById("duzenleFormu").style.display = "block";
  duzenlenenIndex = sarkiListesi.findIndex(s => 
    s.cevap === sarki.cevap && s.kategori === sarki.kategori
  );
  
  const [sanatci, sarkiAdi] = sarki.cevap.split(" - ");
  document.getElementById("duzenleSanatci").value = sanatci || "";
  document.getElementById("duzenleSarki").value = sarkiAdi || "";
  
  // Kategori ve alt kategori ayarları
  const kategoriSelect = document.getElementById("duzenleKategori");
  const altKategoriSelect = document.getElementById("duzenleAltKategoriSec");
  
  // Kategori seçimi
  let anaKategori = sarki.kategori;
  let altKategori = "";
  
  if (sarki.kategori.includes("-")) {
    [anaKategori, altKategori] = sarki.kategori.split("-");
  }
  
  kategoriSelect.value = anaKategori;
  
  // Alt kategori ayarları
  altKategoriSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
  altKategoriSelect.style.display = "none";
  
  if (altKategoriler[anaKategori]) {
    altKategoriSelect.style.display = "block";
    altKategoriler[anaKategori].forEach(kategori => {
      const option = document.createElement("option");
      option.value = `${anaKategori}-${kategori.toLowerCase().replace(' ', '')}`;
      option.textContent = kategori;
      altKategoriSelect.appendChild(option);
    });
    
    if (altKategori) {
      altKategoriSelect.value = sarki.kategori;
    }
  }
  
  // Formu görünür yap ve sayfayı kaydır
  document.getElementById("duzenleFormu").scrollIntoView({ behavior: 'smooth' });
}

// 15. MENÜ YÖNETİMİ
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const section = item.dataset.section;
    document.querySelectorAll(".panel-section").forEach(sec => {
      sec.classList.remove("active");
      if (sec.id === section) sec.classList.add("active");
    });
    document.getElementById("duzenleFormu").style.display = "none";
    document.getElementById("islemKaydiPanel").style.display = "none";
    document.getElementById("islemKaydiArrow").textContent = "▶";
    document.getElementById("topluSilMenu").style.display = "none";
  });
});

// 16. İŞLEM KAYDI PANELİ
const islemKaydiBtn = document.getElementById('islemKaydiBtn');
const islemKaydiPanel = document.getElementById('islemKaydiPanel');
const islemKaydiArrow = document.getElementById('islemKaydiArrow');

islemKaydiBtn.onclick = function() {
  if (islemKaydiPanel.style.display === "none") {
    islemKaydiPanel.style.display = "block";
    islemKaydiArrow.textContent = "▼";
    guncelleIslemKaydiListesi();
  } else {
    islemKaydiPanel.style.display = "none";
    islemKaydiArrow.textContent = "▶";
  }
};

// 17. TEMA DEĞİŞTİRME
(function () {
  const theme = localStorage.getItem("panelTheme");
  const body = document.getElementById("panelBody");
  const toggle = document.getElementById("themeToggle");

  if (theme === "light") {
    body.classList.add("light");
    toggle.checked = false;
    document.getElementById("temaLabel").textContent = "☀️ Light";
  } else {
    body.classList.remove("light");
    toggle.checked = true;
    document.getElementById("temaLabel").textContent = "🌙 Dark";
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.remove("light");
      localStorage.setItem("panelTheme", "dark");
      document.getElementById("temaLabel").textContent = "🌙 Dark";
    } else {
      body.classList.add("light");
      localStorage.setItem("panelTheme", "light");
      document.getElementById("temaLabel").textContent = "☀️ Light";
    }
  });
})();

// 18. KATEGORİ MİGRASYON FONKSİYONU
function migrateKategoriler() {
  const eskiKategoriler = ["turkce-rock", "turkce-pop", "turkce-hiphop", "turkce-karisik", 
                          "yabanci-rock", "yabanci-pop", "yabanci-hiphop", "yabanci-karisik",
                          "dizi-turkce", "dizi-yabanci", "film-turkce", "film-yabanci"];
  
  let degisenler = 0;
  
  sarkiListesi.forEach(sarki => {
    if (!eskiKategoriler.includes(sarki.kategori)) {
      // Eğer kategori eski formatlardan biri değilse, yeni formata çevir
      if (sarki.kategori === "turkce") {
        sarki.kategori = "turkce-karisik";
        degisenler++;
      } else if (sarki.kategori === "yabanci") {
        sarki.kategori = "yabanci-karisik";
        degisenler++;
      }
    }
  });
  
  if (degisenler > 0) {
    localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
    showSuccessToast(`${degisenler} şarkının kategorisi düzeltildi!`);
    guncelleListe();
  } else {
    showSuccessToast("Düzeltilecek kategori bulunamadı!");
  }
}

// 19. SAYFA YÜKLENİRKEN
document.addEventListener("DOMContentLoaded", function() {
  guncelleListe();
  guncelleIslemKaydiListesi();
  
  // Deezer form toggle
  document.getElementById("deezerFormToggle").addEventListener("click", function() {
    const form = document.getElementById("deezerForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
    this.textContent = form.style.display === "none" ? "🎧 Deezer'dan Şarkı Ekle" : "✖️ Kapat";
  });

  // Dışarı tıklayınca toplu silme menüsünü kapat
  document.addEventListener("click", function() {
    document.getElementById("topluSilMenu").style.display = "none";
  });

  // Kategori seçiminde alt kategoriyi göster
  document.getElementById("kategori").addEventListener("change", function() {
    const anaKategori = this.value;
    const altKategoriSelect = document.getElementById("altKategori");
    
    altKategoriSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
    altKategoriSelect.style.display = "none";

    if (altKategoriler[anaKategori]) {
      altKategoriSelect.style.display = "block";
      altKategoriler[anaKategori].forEach(kategori => {
        const option = document.createElement("option");
        option.value = kategori.toLowerCase().replace(' ', '');
        option.textContent = kategori;
        altKategoriSelect.appendChild(option);
      });
    }
  });

  // Deezer kategori modal işlemleri
  document.getElementById("deezerKategoriSelect").addEventListener("change", function() {
    const anaKategori = this.value;
    const altKategoriContainer = document.getElementById("deezerAltKategoriContainer");
    const altKategoriSelect = document.getElementById("deezerAltKategoriSelect");
    
    altKategoriSelect.innerHTML = '<option value="">Alt Kategori Seç</option>';
    altKategoriContainer.style.display = "none";

    if (altKategoriler[anaKategori]) {
      altKategoriContainer.style.display = "block";
      altKategoriler[anaKategori].forEach(kategori => {
        const option = document.createElement("option");
        option.value = `${anaKategori}-${kategori.toLowerCase().replace(' ', '')}`;
        option.textContent = kategori;
        altKategoriSelect.appendChild(option);
      });
    }
  });

  // Deezer modal butonları
  document.getElementById("deezerKategoriEvet").addEventListener("click", function() {
    const anaKategori = document.getElementById("deezerKategoriSelect").value;
    const altKategori = document.getElementById("deezerAltKategoriSelect").value;
    
    if (!anaKategori) {
      alert("Lütfen kategori seçin!");
      return;
    }

    if ((anaKategori === "turkce" || anaKategori === "yabanci") && !altKategori) {
      alert("Lütfen alt kategori seçin!");
      return;
    }

    const tamKategori = altKategori || anaKategori;
    const sarki = window.secilenDeezerSarki;
    const tamCevap = `${sarki.artist.name} - ${sarki.title_short}`;
    const gosterim = `🎵 Şarkı çalıyor. (${tamCevap})`;

    sarkiListesi.push({
      kategori: tamKategori,
      cevap: tamCevap,
      sarki: gosterim,
      dosya: sarki.preview
    });

    localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
    showSuccessToast('✅ Deezer şarkısı başarıyla eklendi!');

    islemKayitlari.push({
      baslik: "Deezer Şarkısı Eklendi",
      tarih: new Date().toLocaleString("tr-TR"),
      detay: { "Sanatçı": sarki.artist.name, "Şarkı": sarki.title_short, "Kategori": tamKategori },
      tur: "ekle"
    });
    localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));

    document.getElementById("deezerKategoriModal").style.display = "none";
    guncelleIslemKaydiListesi();
    guncelleListe();
  });

  document.getElementById("deezerKategoriHayir").addEventListener("click", function() {
    document.getElementById("deezerKategoriModal").style.display = "none";
  });
});

// 20. ÇIKIŞ FONKSİYONU
function logout() {
  localStorage.removeItem("adminGiris");
  window.location.href = "login.html";
}

// Yeni Şarkı Ekle formunu aç-kapat
document.addEventListener("DOMContentLoaded", function () {
  const formToggleBtn = document.getElementById("formToggleBtn");
  const manualForm = document.getElementById("manualForm");

  formToggleBtn.addEventListener("click", () => {
    const isVisible = manualForm.style.display === "block";
    manualForm.style.display = isVisible ? "none" : "block";
    formToggleBtn.textContent = isVisible ? "🎼 Yeni Şarkı Ekle" : "✖️ Kapat";
  });
});
