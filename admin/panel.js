let sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
let duzenlenenIndex = null;
let siralamaArtan = true;
let silinecekIndex = null;

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

  const tamCevap = `${yeniSanatci} - ${yeniSarki}`;
  const gosterim = `🎵 Şarkı çalıyor... (${tamCevap})`;

  // Mevcut şarkının audio verisini kaybetme!
  let eskiAudio = sarkiListesi[duzenlenenIndex]?.audio || "";

  sarkiListesi[duzenlenenIndex] = {
    kategori: yeniKategori,
    cevap: tamCevap,
    sarki: gosterim,
    audio: eskiAudio
  };

  localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
  guncelleListe();
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

  // "Evet" butonuna tıklanınca çalışır
  document.getElementById("btn-evet").onclick = function() {
    if (silinecekIndex !== null) {
      sarkiListesi.splice(silinecekIndex, 1);
      localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
      guncelleListe();
      silinecekIndex = null;
    }
    document.getElementById("modal-onay").style.display = "none";
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

// "Evet" butonuna tıklanınca çalışır
document.getElementById("btn-evet").onclick = function() {
  if (silinecekIndex !== null) {
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
