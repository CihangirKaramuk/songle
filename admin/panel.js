let islemKayitlari = JSON.parse(localStorage.getItem("islemKayitlari")) || [];
let acikIslemDetay = null; // Tıklanan detayın id'si
let sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
let duzenlenenIndex = null;
let siralamaArtan = true;
let silinecekIndex = null;

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
  // Sadece "Şarkı Ekle" sekmesi aktifse göster
  if (!document.getElementById("ekle").classList.contains("active")) return;
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

function guncelleListe() {
  const arama = document.getElementById("aramaInput")?.value?.toLowerCase() || "";
  const kategori = document.getElementById("kategoriFiltre")?.value || "tum";
  const ul = document.getElementById("sarkiListesi");
  ul.innerHTML = "";

  let filtrelenmisListe = sarkiListesi
    .filter(sarki =>
      (kategori === "tum" || sarki.kategori === kategori) &&
      sarki.cevap.toLowerCase().includes(arama)
    );

  filtrelenmisListe.sort((a, b) => {
    const sanatciA = a.cevap.toLowerCase();
    const sanatciB = b.cevap.toLowerCase();
    return siralamaArtan ? sanatciA.localeCompare(sanatciB) : sanatciB.localeCompare(sanatciA);
  });

  filtrelenmisListe.forEach((sarki, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      [${sarki.kategori}] ${sarki.cevap}
      <div class="btn-group">
        <button class="duzenleBtn" onclick='sarkiDuzenleManual(${JSON.stringify(sarki)})'>✏️</button>
        <button class="silBtn" onclick="sarkiSil(${index})">🗑️</button>
        ${sarki.audio ? '<span class="audio-var">🎵</span>' : ''}
      </div>
    `;
    ul.appendChild(li);
  });

  document.getElementById("duzenleFormu").style.display = "none";
}

function sarkiDuzenleManual(secilenSarki) {
  const index = sarkiListesi.findIndex(s => s.cevap === secilenSarki.cevap && s.kategori === secilenSarki.kategori);
  if (index === -1) {
    alert("Şarkı bulunamadı.");
    return;
  }

  duzenlenenIndex = index;

  const [sanatci, sarkiAdi] = secilenSarki.cevap.split(" - ");
  document.getElementById("duzenleSanatci").value = sanatci;
  document.getElementById("duzenleSarki").value = sarkiAdi;
  document.getElementById("duzenleKategori").value = secilenSarki.kategori;
  document.getElementById("duzenleFormu").style.display = "block";
}


function sarkiDuzenle(index) {
  const sarki = sarkiListesi[index];
  const [sanatci, sarkiAdi] = sarki.cevap.split(" - ");

  document.getElementById("duzenleSanatci").value = sanatci;
  document.getElementById("duzenleSarki").value = sarkiAdi;
  document.getElementById("duzenleKategori").value = sarki.kategori;
  document.getElementById("duzenleFormu").style.display = "block";

  duzenlenenIndex = index;
}

document.getElementById("kaydetBtn").addEventListener("click", () => {
  const yeniSanatci = document.getElementById("duzenleSanatci").value.trim();
  const yeniSarki = document.getElementById("duzenleSarki").value.trim();
  const yeniKategori = document.getElementById("duzenleKategori").value;

  if (!yeniSanatci || !yeniSarki || (yeniKategori !== "turkce" && yeniKategori !== "yabanci" && yeniKategori !== "dizi" && yeniKategori !== "film")) {
    alert("Lütfen geçerli tüm bilgileri girin.");
    return;
  }

  // Eski bilgileri güncellemeden ÖNCE al!
  const eskiSanatci = sarkiListesi[duzenlenenIndex].cevap.split(" - ")[0];
  const eskiSarki = sarkiListesi[duzenlenenIndex].cevap.split(" - ")[1];
  const eskiKategori = sarkiListesi[duzenlenenIndex].kategori;

  // Mevcut şarkının audio verisini kaybetme!
  let eskiAudio = sarkiListesi[duzenlenenIndex]?.audio || "";

  // Cevap ve gosterim hazırla (bunlar yukarıda da hazırlanmış olabilir)
  const tamCevap = `${yeniSanatci} - ${yeniSarki}`;
  const gosterim = `🎵 Şarkı çalıyor... (${tamCevap})`;

  // 1) ÖNCE LOG'A EKLE
  islemKayitlari.push({
    baslik: "Şarkı Düzenlendi",
    tarih: new Date().toLocaleString("tr-TR"),
    detay: {
      oncekiBilgi: `${eskiSanatci} - ${eskiSarki} (${eskiKategori})`,
      yeniBilgi: `${yeniSanatci} - ${yeniSarki} (${yeniKategori})`
    },
    tur: "duzenle"
  });
  localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
  guncelleIslemKaydiListesi();

  // 2) SONRA GÜNCELLEMEYİ YAP
  sarkiListesi[duzenlenenIndex] = {
    kategori: yeniKategori,
    cevap: tamCevap,
    sarki: gosterim,
    audio: eskiAudio
  };
  localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
  guncelleListe();

  // Düzenleme panelini kapat
  document.getElementById("duzenleFormu").style.display = "none";
  showGuncelleToast('Güncellendi');
});

document.getElementById("ekleBtn").addEventListener("click", () => {
  const sarki = document.getElementById("sarkiAdi").value.trim();
  const sanatci = document.getElementById("sanatciAdi").value.trim();
  const kategori = document.getElementById("kategori").value;
  const mp3Input = document.getElementById("mp3File");

  if (!sarki || !sanatci || (kategori !== "turkce" && kategori !== "yabanci" && kategori !== "dizi" && kategori !== "film") || !mp3Input.files[0]) {
    alert("Lütfen tüm alanları doldurun ve bir MP3 dosyası yükleyin.");
    return;
  }

  const file = mp3Input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const audioData = e.target.result;
    const tamCevap = `${sanatci} - ${sarki}`;
    const gosterim = `🎵 Şarkı çalıyor. (${tamCevap})`;

    sarkiListesi.push({ kategori, sarki: gosterim, cevap: tamCevap, dosya: audioData });
    localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));

    document.getElementById("sarkiAdi").value = "";
    document.getElementById("sanatciAdi").value = "";
    document.getElementById("kategori").value = "";
    document.getElementById("mp3File").value = "";

    showSuccessToast('✅ Şarkı başarıyla eklendi!'); // ← işte burası!

    // BURAYA EKLE
    islemKayitlari.push({
      baslik: "Şarkı Eklendi",
      tarih: new Date().toLocaleString("tr-TR"),
      detay: { "Sanatçı": sanatci, "Şarkı": sarki, "Kategori": kategori },
      tur: "ekle"
    });
    localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));

    guncelleIslemKaydiListesi(); // ← BUNU EKLE!

    guncelleListe();
  };


  reader.readAsDataURL(file);
});

function logout() {
  localStorage.removeItem("adminGiris");
  window.location.href = "login.html";
}

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
    // İşlem kaydı paneli açık ise kapat
    const islemKaydiPanel = document.getElementById("islemKaydiPanel");
    if (islemKaydiPanel) islemKaydiPanel.style.display = "none";
    const islemKaydiArrow = document.getElementById("islemKaydiArrow");
    if (islemKaydiArrow) islemKaydiArrow.textContent = "▶";
    
    // *** EKLE: Sekme değişince toplu sil menüsü kapansın ***
    const topluSilMenu = document.getElementById("topluSilMenu");
    if (topluSilMenu) topluSilMenu.style.display = "none";
  });
});

// Tema başlatma (sayfa yüklenmeden önce tema uygula)
(function () {
  const theme = localStorage.getItem("panelTheme");
  const body = document.getElementById("panelBody");

  if (theme === "light") {
    body.classList.add("light");
  } else {
    body.classList.remove("light");
  }
})();

// Sayfa tamamen yüklendiğinde
window.addEventListener("load", () => {
  guncelleListe();

  const toggle = document.getElementById("themeToggle");
  const body = document.getElementById("panelBody");

  // Tema toggle ilk durumu
  toggle.checked = !body.classList.contains("light");
  document.getElementById("temaLabel").textContent = toggle.checked ? "🌙 Dark" : "☀️ Light";

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

  document.getElementById("aramaInput").addEventListener("input", guncelleListe);
  document.getElementById("kategoriFiltre").addEventListener("change", guncelleListe);
  document.getElementById("siralaBtn").addEventListener("click", () => {
    siralamaArtan = !siralamaArtan;
    document.getElementById("siralaBtn").textContent = siralamaArtan ? "🔼 A-Z Sırala" : "🔽 Z-A Sırala";
    guncelleListe();
  });
});

  // "Hayır" butonuna tıklanınca çalışır
  document.getElementById("btn-hayir").onclick = function() {
    document.getElementById("modal-onay").style.display = "none";
    silinecekIndex = null;
  };

  // Modalın dışına tıklayınca da kapanır
  document.getElementById("modal-onay").onclick = function(e) {
    if (e.target === this) {
      this.style.display = "none";
      silinecekIndex = null;
    }
  };

document.getElementById("modal-onay").onclick = function(e) {
  if (e.target === this) {
    this.style.display = "none";
    silinecekIndex = null;
  }
};

// Şarkı silme butonuna basınca çalışır
function sarkiSil(index) {
  if (!document.getElementById("liste").classList.contains("active")) return;
  silinecekIndex = index;
  document.getElementById("modal-onay").style.display = "flex";
  document.getElementById("modal-msg").textContent = "Şarkıyı silmek istediğine emin misin?";
}

document.getElementById("btn-evet").onclick = function() {
  if (silinecekIndex !== null) {
    // Silinen şarkının bilgileri:
    const silinenSarki = sarkiListesi[silinecekIndex];
    islemKayitlari.push({
      baslik: "Şarkı Silindi",
      tarih: new Date().toLocaleString("tr-TR"),
      detay: {
        "Sanatçı": silinenSarki?.cevap?.split(" - ")[0] || "-",
        "Şarkı": silinenSarki?.cevap?.split(" - ")[1] || "-",
        "Kategori": silinenSarki?.kategori || "-"
      },
      tur: "sil"
    });
    localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));

    guncelleIslemKaydiListesi(); // ← BUNU EKLE!

    // Sonra sil
    sarkiListesi.splice(silinecekIndex, 1);
    localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
    guncelleListe();
    silinecekIndex = null;
  }
  document.getElementById("modal-onay").style.display = "none";
  showDeleteToast('🗑️ Şarkı silindi!');
};

// "Hayır" butonuna tıklanınca çalışır
document.getElementById("btn-hayir").onclick = function() {
  document.getElementById("modal-onay").style.display = "none";
  silinecekIndex = null;
};

// Modalın dışına tıklayınca da kapanır
document.getElementById("modal-onay").onclick = function(e) {
  if (e.target === this) {
    this.style.display = "none";
    silinecekIndex = null;
  }
};

// Silme bildirimi (sağ üstte çıkan)
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

// İşlem Kaydı Aç/Kapat
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

// Kayıtları listele
function guncelleIslemKaydiListesi() {
  const ul = document.getElementById("islemKaydiListesi");
  ul.innerHTML = "";

  if (islemKayitlari.length === 0) {
    ul.innerHTML = `<li style="color:#888;padding:14px;">Hiç işlem kaydı yok.</li>`;
    return;
  }

  // En son işlem en üstte!
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

// Detay penceresi
function islemDetayGoster(index) {
  const kayit = islemKayitlari[index];
  let detay = `
    <div style="
      padding:32px 28px 22px 28px;
      min-width:300px;
      max-width:440px;
      display:flex;
      flex-direction:column;
      gap:22px;
      background:rgba(50,42,85,0.92);
      border-radius:28px;
      box-shadow:0 8px 36px 0 rgba(100,90,220,0.17);
      backdrop-filter: blur(6px);
      position:relative;
    ">
      <div style="font-size:24px;font-weight:800;letter-spacing:.2px;margin-bottom:-12px;">
        ${kayit.baslik}
      </div>
      ${
        kayit.tur === "duzenle"
          ? (() => {
              let onceki = kayit.detay.oncekiBilgi.match(/(.*) - (.*) \((.*)\)/);
              let yeni = kayit.detay.yeniBilgi.match(/(.*) - (.*) \((.*)\)/);
              return `
                <div>
                  <div style="font-weight:600;color:#cabff5;font-size:17px;">Önceki Bilgiler</div>
                  <div style="margin-left:12px;font-size:15px;line-height:1.7;">
                    <div><b>Sanatçı:</b> ${onceki ? onceki[1] : "-"}</div>
                    <div><b>Şarkı:</b> ${onceki ? onceki[2] : "-"}</div>
                    <div><b>Kategori:</b> ${onceki ? onceki[3] : "-"}</div>
                  </div>
                  <div style="border-top:1.2px solid #6059a3;margin:16px 0 10px 0;opacity:.5"></div>
                  <div style="font-weight:600;color:#aee9ff;font-size:17px;">Yeni Bilgiler</div>
                  <div style="margin-left:12px;font-size:15px;line-height:1.7;">
                    <div><b>Sanatçı:</b> ${yeni ? yeni[1] : "-"}</div>
                    <div><b>Şarkı:</b> ${yeni ? yeni[2] : "-"}</div>
                    <div><b>Kategori:</b> ${yeni ? yeni[3] : "-"}</div>
                  </div>
                </div>
              `;
            })()
          : `<div style="margin-left:6px;display:flex;flex-direction:column;gap:6px;font-size:16px;line-height:1.7;">
                ${Object.entries(kayit.detay).map(([k, v]) =>
                  `<div><b>${k}:</b> ${v}</div>`
                ).join("")}
             </div>`
      }
      <div style="color:#b5b6bb;margin-top:2px;font-size:15px;letter-spacing:.3px;">
        <b>Tarih:</b> ${kayit.tarih}
      </div>
      <button id="islemKaydiSilBtn"
        style="margin-top:16px;align-self:center;width:70%;padding:13px 0;border-radius:19px;font-size:18px;box-shadow:0 2px 12px 0 rgba(240,80,160,0.08);background:#e7487c;font-weight:600;color:#fff;border:none;cursor:pointer;transition:.2s;"
        class="btn-evet">İşlem Kaydını Sil</button>
    </div>
  `;

  let modal = document.createElement("div");
  modal.id = "islemKaydiDetayModal";
  modal.style.cssText = `
    position:fixed;top:0;left:0;width:100vw;height:100vh;
    background:rgba(32,28,42,0.48);z-index:1999;display:flex;
    align-items:center;justify-content:center;
    backdrop-filter: blur(2.5px);
  `;
  modal.innerHTML = `<div style="position:relative;">
    <span style="
      position:absolute;top:12px;right:24px;cursor:pointer;
      font-size:27px;color:#fff;z-index:3;opacity:.76;transition:.2s;
    " id="detayKapatBtn"
    onmouseover="this.style.opacity=1"
    onmouseout="this.style.opacity=0.76"
    >&times;</span>
    ${detay}
  </div>`;

  document.body.appendChild(modal);

  document.getElementById("detayKapatBtn").onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  document.getElementById("islemKaydiSilBtn").onclick = () => {
    islemKaydiSil(index, modal);
  };
}

// Kayıt sil
function islemKaydiSil(index, modalEl) {
  gosterEminMisiniz("İşlem kaydını silmek istediğine emin misin?", () => {
    islemKayitlari.splice(index, 1);
    localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
    guncelleIslemKaydiListesi();
    if (modalEl) modalEl.remove();
  });
}

// Toplu Sil Menü Aç/Kapat
const topluSilBtn = document.getElementById("islemTopluSilBtn");
const topluSilMenu = document.getElementById("topluSilMenu");
topluSilBtn.onclick = (e) => {
  e.stopPropagation();
  topluSilMenu.style.display = (topluSilMenu.style.display === "block") ? "none" : "block";
};

topluSilMenu.onclick = (e) => e.stopPropagation();

// Güncellenmiş Emin misin fonksiyonu
// Emin misin? modalı (BİR TANE OLACAK)
function gosterEminMisiniz(mesaj, evetCallback, hayirCallback) {
  let eskiModal = document.getElementById('ozelEminModal');
  if (eskiModal) eskiModal.remove();

  let modal = document.createElement("div");
  modal.id = "ozelEminModal";
  modal.style.cssText = `
    position:fixed;left:0;top:0;width:100vw;height:100vh;
    background:rgba(24,21,42,0.45);z-index:2100;display:flex;
    align-items:center;justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:#242043;padding:34px 26px 20px 26px;border-radius:22px;max-width:95vw;min-width:220px;box-shadow:0 8px 36px 0 rgba(100,90,220,0.14);text-align:center;">
      <div style="font-size:18px;margin-bottom:22px;">${mesaj}</div>
      <div style="display:flex;gap:18px;justify-content:center;">
        <button id="eminEvetBtn" class="btn-evet">Evet</button>
        <button id="eminHayirBtn" class="btn-hayir">Hayır</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("eminEvetBtn").onclick = () => { modal.remove(); evetCallback && evetCallback(); };
  document.getElementById("eminHayirBtn").onclick = () => { modal.remove(); hayirCallback && hayirCallback(); };
  modal.onclick = (e) => { if (e.target === modal) { modal.remove(); hayirCallback && hayirCallback(); } };
}

// SAYFA YÜKLENDİĞİNDE TOPLU SİL BUTONLARI ÇALIŞSIN
window.addEventListener("DOMContentLoaded", function() {
  // Toplu sil butonlarına tıklama ekle
  document.querySelectorAll(".toplu-sil-btn").forEach(btn => {
    btn.onclick = function() {
      let tip = this.getAttribute("data-tip");
      gosterEminMisiniz("Seçili işlemi silmek istediğine emin misin?", () => {
        let simdi = Date.now();
        if (tip === "son") {
          islemKayitlari.pop();
        } else if (tip === "saat") {
          islemKayitlari = islemKayitlari.filter(x => {
            let t = new Date(x.tarih).getTime();
            return simdi - t > 3600 * 1000;
          });
        } else if (tip === "gun") {
          let gun = new Date().toLocaleDateString("tr-TR");
          islemKayitlari = islemKayitlari.filter(x => !x.tarih.startsWith(gun));
        } else if (tip === "tum") {
          islemKayitlari = [];
        }
        localStorage.setItem("islemKayitlari", JSON.stringify(islemKayitlari));
        guncelleIslemKaydiListesi();
        // Menü kapansın
        const topluSilMenu = document.getElementById("topluSilMenu");
        if (topluSilMenu) topluSilMenu.style.display = "none";
      });
    }
  });
});

// KAPATMA - Kopyala ve yapıştır
document.addEventListener("mousedown", function(e) {
  if (document.getElementById("ozelEminModal")) return;
  const topluSilMenu = document.getElementById("topluSilMenu");
  const topluSilBtn = document.getElementById("islemTopluSilBtn");
  if (
    topluSilMenu &&
    topluSilMenu.style.display === "block" &&
    !topluSilMenu.contains(e.target) &&
    !topluSilBtn.contains(e.target)
  ) {
    topluSilMenu.style.display = "none";
  }
});

