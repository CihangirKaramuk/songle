let sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
let duzenlenenIndex = null;
let siralamaArtan = true;

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

filtrelenmisListe.forEach((sarki) => {
  const li = document.createElement("li");

  li.innerHTML = `
    [${sarki.kategori}] ${sarki.cevap}
    <div class="btn-group">
      <button class="duzenleBtn">✏️</button>
      <button class="silBtn">🗑️</button>
      ${sarki.audio ? '<span class="audio-var">🎵</span>' : ''}
    </div>
  `;

  const duzenleBtn = li.querySelector(".duzenleBtn");
  const silBtn = li.querySelector(".silBtn");

  duzenleBtn.addEventListener("click", () => {
    sarkiDuzenleManual(sarki);
  });

  silBtn.addEventListener("click", () => {
    const index = sarkiListesi.findIndex(s => s.cevap === sarki.cevap && s.kategori === sarki.kategori);
    if (index !== -1) sarkiSil(index);
  });

  ul.appendChild(li);
});

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



  document.getElementById("duzenleFormu").style.display = "none";
}

function sarkiSil(index) {
  sarkiListesi.splice(index, 1);
  localStorage.setItem("sarkilar", JSON.stringify(sarkiListesi));
  guncelleListe();
}

function sarkiDuzenle(index) {
  const sarki = sarkiListesi[index];
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


  duzenlenenIndex = index;
}

document.getElementById("kaydetBtn").addEventListener("click", () => {
  const yeniSanatci = document.getElementById("duzenleSanatci").value.trim();
  const yeniSarki = document.getElementById("duzenleSarki").value.trim();
  const yeniKategori = document.getElementById("duzenleKategori").value;

  if (!yeniSanatci || !yeniSarki || (yeniKategori !== "turkce" && yeniKategori !== "yabanci")) {
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

  if (!sarki || !sanatci || (kategori !== "turkce" && kategori !== "yabanci") || !mp3Input.files[0]) {
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
