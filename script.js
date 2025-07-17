// 🎵 Şarkı listesi admin panelden gelir
let sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
let soruListesi = [];
let kullanilanSarkilar = [];
let soruIndex = 0;
let selectedDiziAltKategori = "";
let selectedFilmAltKategori = "";

// Custom dropdown işlemleri
const dropdownSelected = document.querySelector(".dropdown-selected");
const dropdownOptions = document.querySelector(".dropdown-options");
const options = document.querySelectorAll(".option");

dropdownSelected.addEventListener("click", () => {
  dropdownOptions.style.display =
    dropdownOptions.style.display === "block" ? "none" : "block";
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    dropdownSelected.textContent = option.textContent;
    dropdownSelected.setAttribute("data-value", option.getAttribute("data-value"));
    dropdownOptions.style.display = "none";
    document.getElementById("secili-kategori").textContent = option.textContent;

const diziAltKategoriler = document.getElementById("diziAltKategoriler");
const filmAltKategoriler = document.getElementById("filmAltKategoriler");

if (option.getAttribute("data-value") === "dizi") {
  diziAltKategoriler.style.display = "flex";
  diziAltKategoriler.classList.add("gorunur");
  filmAltKategoriler.classList.remove("gorunur");
  setTimeout(() => { filmAltKategoriler.style.display = "none"; }, 300);
} else if (option.getAttribute("data-value") === "film") {
  filmAltKategoriler.style.display = "flex";
  filmAltKategoriler.classList.add("gorunur");
  diziAltKategoriler.classList.remove("gorunur");
  setTimeout(() => { diziAltKategoriler.style.display = "none"; }, 300);
} else {
  diziAltKategoriler.classList.remove("gorunur");
  filmAltKategoriler.classList.remove("gorunur");
  setTimeout(() => { diziAltKategoriler.style.display = "none"; }, 300);
  setTimeout(() => { filmAltKategoriler.style.display = "none"; }, 300);
  selectedDiziAltKategori = "";
  selectedFilmAltKategori = "";
  document.getElementById('diziTurkceCard').classList.remove('selected');
  document.getElementById('diziYabanciCard').classList.remove('selected');
  document.getElementById('filmTurkceCard').classList.remove('selected');
  document.getElementById('filmYabanciCard').classList.remove('selected');
}
  });
});

document.getElementById('diziTurkceCard').addEventListener('click', function() {
  selectedDiziAltKategori = "dizi-turkce";
  this.classList.add('selected');
  document.getElementById('diziYabanciCard').classList.remove('selected');
});

document.getElementById('diziYabanciCard').addEventListener('click', function() {
  selectedDiziAltKategori = "dizi-yabanci";
  this.classList.add('selected');
  document.getElementById('diziTurkceCard').classList.remove('selected');
});

document.getElementById('filmTurkceCard').addEventListener('click', function() {
  selectedFilmAltKategori = "film-turkce";
  this.classList.add('selected');
  document.getElementById('filmYabanciCard').classList.remove('selected');
});

document.getElementById('filmYabanciCard').addEventListener('click', function() {
  selectedFilmAltKategori = "film-yabanci";
  this.classList.add('selected');
  document.getElementById('filmTurkceCard').classList.remove('selected');
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    dropdownOptions.style.display = "none";
  }
});

document.querySelector(".start-btn").addEventListener("click", function () {
  const secilenKategori = dropdownSelected.textContent;
  const kategoriKey = dropdownSelected.getAttribute("data-value");

  // --- Dizi kontrolü
  if (kategoriKey === "dizi") {
    if (!selectedDiziAltKategori) {
      alert("Lütfen dizi için Türkçe veya Yabancı seçin!");
      return;
    }
  }

  // --- Film kontrolü
  if (kategoriKey === "film") {
    if (!selectedFilmAltKategori) {
      alert("Lütfen film için Türkçe veya Yabancı seçin!");
      return;
    }
  }

  // Diğer kategorilerde boşsa uyarı
  if (
    (!kategoriKey || secilenKategori === "Kategori Seç") &&
    kategoriKey !== "dizi" && kategoriKey !== "film"
  ) {
    alert("Lütfen bir kategori seç!");
    return;
  }

  sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];

  // Kategoriye göre filtrele
  let oyunKategoriKey = kategoriKey;
  if (kategoriKey === "dizi") {
    oyunKategoriKey = selectedDiziAltKategori;
  }
  if (kategoriKey === "film") {
    oyunKategoriKey = selectedFilmAltKategori;
  }

  soruListesi = sarkiListesi.filter(sarki => sarki.kategori === oyunKategoriKey);

  if (!soruListesi || soruListesi.length === 0) {
    alert("Bu kategoride henüz şarkı yok!");
    return;
  }

  kullanilanSarkilar = [];

  soruIndex = rastgeleSoruIndex();
  guncelleSoru();
  baslatSayac();

  document.querySelector(".container").style.display = "none";
  document.querySelector(".game-screen").style.display = "block";
  document.getElementById("geriBtn").style.display = "block";
});

const geriBtn = document.getElementById("geriBtn");
geriBtn.addEventListener("click", function () {
  document.querySelector(".container").style.display = "flex";
  document.querySelector(".game-screen").style.display = "none";
  document.getElementById("geriBtn").style.display = "none";
  document.getElementById("zamanGoster").textContent = "Kalan Süre: 30";
  clearInterval(sayacInterval);

  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  if (window.durdurCalmaAnimasyonu) durdurCalmaAnimasyonu();
});

function rastgeleSoruIndex() {
  if (kullanilanSarkilar.length === soruListesi.length) {
    kullanilanSarkilar = []; // tüm sorular kullanıldıysa sıfırla
  }

  let index;
  do {
    index = Math.floor(Math.random() * soruListesi.length);
  } while (kullanilanSarkilar.includes(index) && kullanilanSarkilar.length < soruListesi.length);

  kullanilanSarkilar.push(index);
  return index;
}

function cevapDogruMu(tahmin, cevap) {
  tahmin = tahmin.toLowerCase();
  cevap = cevap.toLowerCase();

  const sarkiAdi = cevap.split(" - ")[1]?.trim();
  if (!sarkiAdi) return false;

  return tahmin.includes(sarkiAdi);
}

document.querySelector(".tahmin-gonder").addEventListener("click", function () {
  const input = document.querySelector(".tahmin-input");
  const tahmin = input.value.trim();

  if (cevapDogruMu(tahmin, soruListesi[soruIndex].cevap)) {
    confetti();
    clearInterval(sayacInterval);

    setTimeout(() => {
      soruIndex = rastgeleSoruIndex();
      guncelleSoru();
      baslatSayac();
    }, 1500);

  } else {
    document.body.classList.add("error");
    input.classList.add("shake");

    setTimeout(() => {
      document.body.classList.remove("error");
      input.classList.remove("shake");
    }, 1000);
  }
});

document.querySelector(".tahmin-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    document.querySelector(".tahmin-gonder").click();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (geriBtn && geriBtn.style.display !== "none") {
      geriBtn.click();
    }
  }
});

function guncelleSoru() {
  const soru = soruListesi[soruIndex];
  document.querySelector(".sarki-kutusu").textContent = soru.sarki;
  document.querySelector(".tahmin-input").value = "";
  document.getElementById("zamanGoster").textContent = "Kalan Süre: 30";
  document.getElementById('audio-player').src = soru.dosya;

  // Yeni bar için: bar ve glow sıfırla, nota animasyonunu durdur
  if(window.progressBar) progressBar.style.width = '0%';
  if(window.progressGlow) progressGlow.style.left = '0px';
  if(window.durdurCalmaAnimasyonu) durdurCalmaAnimasyonu();

  // --- BURAYA EKLE ---
  setTimeout(() => {
    audioPlayer.play();
  }, 150);
}

let kalanSure = 30;
let sayacInterval;

function baslatSayac() {
  kalanSure = 30;
  document.getElementById("zamanGoster").textContent = `Kalan Süre: ${kalanSure}`;

  sayacInterval = setInterval(() => {
    kalanSure--;
    document.getElementById("zamanGoster").textContent = `Kalan Süre: ${kalanSure}`;

    if (kalanSure <= 0) {
      clearInterval(sayacInterval);
      alert("Süre doldu! Yeni soruya geçiliyor...");
      soruIndex = rastgeleSoruIndex();
      guncelleSoru();
      baslatSayac();
    }
  }, 1000);
}

// --- YENİ MÜZİK BAR JS KISMI --- //
const audioPlayer = document.getElementById('audio-player');
const progressBar = document.getElementById('progressBar');
const progressGlow = document.getElementById('progressGlow');
const musicNote = document.getElementById('musicNote');
const replayBtn = document.getElementById('replayBtn');

let progressInterval = null;

// Şarkı çalmaya başlayınca nota sallansın, bar ilerlesin
function baslatCalmaAnimasyonu() {
  if (musicNote) musicNote.classList.add('sallaniyor');
  clearInterval(progressInterval);

  progressInterval = setInterval(() => {
    if (audioPlayer.duration && !audioPlayer.paused) {
      const oran = audioPlayer.currentTime / audioPlayer.duration;
      progressBar.style.width = `${oran * 100}%`;
      progressGlow.style.left = `calc(${oran * 100}% - 18px)`;
    }
  }, 100);
}

// Şarkı durunca nota dursun, bar olduğu yerde kalsın
function durdurCalmaAnimasyonu() {
  if (musicNote) musicNote.classList.remove('sallaniyor');
  clearInterval(progressInterval);
}

// Oynat/durdur yönetimi
audioPlayer.addEventListener('play', baslatCalmaAnimasyonu);
audioPlayer.addEventListener('pause', durdurCalmaAnimasyonu);
audioPlayer.addEventListener('ended', durdurCalmaAnimasyonu);

// Replay tuşuna tıklayınca hızlı bir tur dön, sonra plak gibi dönmeye başla
replayBtn.addEventListener('click', () => {
  // Önce hızlı dönüş!
  replayBtn.classList.add('donuyor');
  replayBtn.classList.remove('donuyor-surekli'); // Hızlı dönerken yavaş döngüyü kaldır

  audioPlayer.currentTime = 0;
  audioPlayer.play();

  setTimeout(() => {
    replayBtn.classList.remove('donuyor');
    // Hızlı animasyon bittikten ve şarkı çalıyorsa plak gibi dönmeye başlasın
    if (!audioPlayer.paused) {
      replayBtn.classList.add('donuyor-surekli');
    }
  }, 800); // hızlı animasyon süresiyle aynı olmalı
});

// Şarkı çalarken plak gibi dönmeye başlasın
audioPlayer.addEventListener('play', () => {
  setTimeout(() => {
    if (!replayBtn.classList.contains('donuyor')) {
      replayBtn.classList.add('donuyor-surekli');
    }
  }, 820); // Hızlı animasyon bittikten sonra başlat
});

// Şarkı durunca veya bitince plak gibi dönmeyi durdur
audioPlayer.addEventListener('pause', () => {
  replayBtn.classList.remove('donuyor-surekli');
});
audioPlayer.addEventListener('ended', () => {
  replayBtn.classList.remove('donuyor-surekli');
});

// Volume Kontrolü — Masaüstü: hover ile, Mobil: tıklama ile açılır
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeSliderContainer = document.querySelector('.volume-slider-container');
const volumeControl = document.querySelector('.volume-control');

// Ses seviyesi ayarla
volumeSlider.addEventListener('input', function () {
  audioPlayer.volume = this.value;
});

// Mobil mi kontrolü
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

let volumeTimeout;
if (isMobile()) {
  // MOBİLDE — tıklayınca aç/kapa
  let volumeOpen = false;

  volumeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    volumeOpen = !volumeOpen;
    if (volumeOpen) {
  volumeSliderContainer.classList.add('active');
} else {
  volumeSliderContainer.classList.remove('active');
}

  });

  // Dışarı tıklayınca kapat
  document.addEventListener('click', function () {
    volumeSliderContainer.classList.remove('active');
    volumeOpen = false;
  });

  volumeSliderContainer.addEventListener('click', function (e) {
    e.stopPropagation();
  });

} else {
  // MASAÜSTÜNDE — sadece hover ile açılır
  volumeControl.addEventListener('mouseenter', () => {
    clearTimeout(volumeTimeout);
    volumeSliderContainer.classList.add('active');
  });
  volumeControl.addEventListener('mouseleave', () => {
    volumeTimeout = setTimeout(() => {
      volumeSliderContainer.classList.remove('active');
    }, 1100);
  });
  // Slider'a tekrar hover olursa açık kalsın
  volumeSliderContainer.addEventListener('mouseenter', () => {
    clearTimeout(volumeTimeout);
  });
  volumeSliderContainer.addEventListener('mouseleave', () => {
    volumeTimeout = setTimeout(() => {
      volumeSliderContainer.classList.remove('active');
    }, 1100);
  });
}
