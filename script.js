let sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
let soruListesi = [];
let kullanilanSarkilar = [];
let soruIndex = 0;
let selectedDiziAltKategori = "";
let selectedFilmAltKategori = "";
let selectedTurkceAltKategori = "";
let selectedYabanciAltKategori = "";

const dropdownSelected = document.querySelector(".dropdown-selected");
const dropdownOptions = document.querySelector(".dropdown-options");
const options = document.querySelectorAll(".option");

dropdownSelected.addEventListener("click", () => {
  dropdownOptions.style.display =
    dropdownOptions.style.display === "block" ? "none" : "block";
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll('.alt-kategori-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.dizi-alt-kategori-card.selected').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.film-alt-kategori-card.selected').forEach(card => card.classList.remove('selected'));
    selectedTurkceAltKategori = "";
    selectedYabanciAltKategori = "";
    selectedDiziAltKategori = "";
    selectedFilmAltKategori = "";
    dropdownSelected.textContent = option.textContent;
    dropdownSelected.setAttribute("data-value", option.getAttribute("data-value"));
    dropdownOptions.style.display = "none";
    document.getElementById("secili-kategori").textContent = option.textContent;

    const tumAltlar = [
      "diziAltKategoriler",
      "filmAltKategoriler",
      "turkceAltKategoriler",
      "yabanciAltKategoriler"
    ];
    tumAltlar.forEach(id => {
      document.getElementById(id).classList.remove("gorunur");
      document.getElementById(id).style.display = "none";
    });

    if (option.getAttribute("data-value") === "dizi") {
      const el = document.getElementById("diziAltKategoriler");
      el.style.display = "flex";
      setTimeout(() => { el.classList.add("gorunur"); }, 10);
    }
    if (option.getAttribute("data-value") === "film") {
      const el = document.getElementById("filmAltKategoriler");
      el.style.display = "flex";
      setTimeout(() => { el.classList.add("gorunur"); }, 10);
    }
    if (option.getAttribute("data-value") === "turkce") {
      const el = document.getElementById("turkceAltKategoriler");
      el.style.display = "flex";
      setTimeout(() => { el.classList.add("gorunur"); }, 10);
    }
    if (option.getAttribute("data-value") === "yabanci") {
      const el = document.getElementById("yabanciAltKategoriler");
      el.style.display = "flex";
      setTimeout(() => { el.classList.add("gorunur"); }, 10);
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

document.getElementById('turkceRockCard').addEventListener('click', function() {
    selectedTurkceAltKategori = "rock";
    altKategoriCardSec('turkceAltKategoriler', this);
});
document.getElementById('turkcePopCard').addEventListener('click', function() {
    selectedTurkceAltKategori = "pop";
    altKategoriCardSec('turkceAltKategoriler', this);
});
document.getElementById('turkceHipHopCard').addEventListener('click', function() {
    selectedTurkceAltKategori = "hiphop";
    altKategoriCardSec('turkceAltKategoriler', this);
});
document.getElementById('turkceKarisikCard').addEventListener('click', function() {
    selectedTurkceAltKategori = "karisik";
    altKategoriCardSec('turkceAltKategoriler', this);
});

document.getElementById('yabanciRockCard').addEventListener('click', function() {
    selectedYabanciAltKategori = "rock";
    altKategoriCardSec('yabanciAltKategoriler', this);
});
document.getElementById('yabanciPopCard').addEventListener('click', function() {
    selectedYabanciAltKategori = "pop";
    altKategoriCardSec('yabanciAltKategoriler', this);
});
document.getElementById('yabanciHipHopCard').addEventListener('click', function() {
    selectedYabanciAltKategori = "hiphop";
    altKategoriCardSec('yabanciAltKategoriler', this);
});
document.getElementById('yabanciKarisikCard').addEventListener('click', function() {
    selectedYabanciAltKategori = "karisik";
    altKategoriCardSec('yabanciAltKategoriler', this);
});

function altKategoriCardSec(altKategoriDivId, secilenCard) {
  document.querySelectorAll(`#${altKategoriDivId} .alt-kategori-card`).forEach(card => {
    card.classList.remove('selected');
  });
  secilenCard.classList.add('selected');
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    dropdownOptions.style.display = "none";
  }
});

document.querySelector(".start-btn").addEventListener("click", function () {
  const secilenKategori = dropdownSelected.textContent;
  const kategoriKey = dropdownSelected.getAttribute("data-value");

  // Alt kategori kontrolü (Türkçe/Yabancı için zorunlu)
  if (kategoriKey === "turkce" && !selectedTurkceAltKategori) {
    alert("Lütfen Türkçe için bir alt kategori seçin!");
    return;
  }
  if (kategoriKey === "yabanci" && !selectedYabanciAltKategori) {
    alert("Lütfen Yabancı için bir alt kategori seçin!");
    return;
  }
  if (kategoriKey === "dizi" && !selectedDiziAltKategori) {
    alert("Lütfen dizi için Türkçe veya Yabancı seçin!");
    return;
  }
  if (kategoriKey === "film" && !selectedFilmAltKategori) {
    alert("Lütfen film için Türkçe veya Yabancı seçin!");
    return;
  }

  // Oyun için kategori key oluştur
  let oyunKategoriKey;
  if (kategoriKey === "turkce") {
    oyunKategoriKey = `turkce-${selectedTurkceAltKategori}`; // "turkce-rock"
  } 
  else if (kategoriKey === "yabanci") {
    oyunKategoriKey = `yabanci-${selectedYabanciAltKategori}`; // "yabanci-pop"
  }
  else if (kategoriKey === "dizi") {
    oyunKategoriKey = selectedDiziAltKategori; // "dizi-turkce"
  }
  else if (kategoriKey === "film") {
    oyunKategoriKey = selectedFilmAltKategori; // "film-yabanci"
  }

  // Şarkıları filtrele
  sarkiListesi = JSON.parse(localStorage.getItem("sarkilar")) || [];
  soruListesi = sarkiListesi.filter(sarki => sarki.kategori === oyunKategoriKey);

  if (soruListesi.length === 0) {
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
    kullanilanSarkilar = [];
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
  return sarkiAdi && tahmin.includes(sarkiAdi);
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

  if(window.progressBar) progressBar.style.width = '0%';
  if(window.progressGlow) progressGlow.style.left = '0px';
  if(window.durdurCalmaAnimasyonu) durdurCalmaAnimasyonu();

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

const audioPlayer = document.getElementById('audio-player');
const progressBar = document.getElementById('progressBar');
const progressGlow = document.getElementById('progressGlow');
const musicNote = document.getElementById('musicNote');
const replayBtn = document.getElementById('replayBtn');

let progressInterval = null;

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

function durdurCalmaAnimasyonu() {
  if (musicNote) musicNote.classList.remove('sallaniyor');
  clearInterval(progressInterval);
}

audioPlayer.addEventListener('play', baslatCalmaAnimasyonu);
audioPlayer.addEventListener('pause', durdurCalmaAnimasyonu);
audioPlayer.addEventListener('ended', durdurCalmaAnimasyonu);

replayBtn.addEventListener('click', () => {
  replayBtn.classList.add('donuyor');
  replayBtn.classList.remove('donuyor-surekli');

  audioPlayer.currentTime = 0;
  audioPlayer.play();

  setTimeout(() => {
    replayBtn.classList.remove('donuyor');
    if (!audioPlayer.paused) {
      replayBtn.classList.add('donuyor-surekli');
    }
  }, 800);
});

audioPlayer.addEventListener('play', () => {
  setTimeout(() => {
    if (!replayBtn.classList.contains('donuyor')) {
      replayBtn.classList.add('donuyor-surekli');
    }
  }, 820);
});

audioPlayer.addEventListener('pause', () => {
  replayBtn.classList.remove('donuyor-surekli');
});
audioPlayer.addEventListener('ended', () => {
  replayBtn.classList.remove('donuyor-surekli');
});

const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeSliderContainer = document.querySelector('.volume-slider-container');
const volumeControl = document.querySelector('.volume-control');

volumeSlider.addEventListener('input', function () {
  audioPlayer.volume = this.value;
});

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

let volumeTimeout;
if (isMobile()) {
  let volumeOpen = false;

  volumeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    volumeOpen = !volumeOpen;
    volumeSliderContainer.classList.toggle('active', volumeOpen);
  });

  document.addEventListener('click', function () {
    volumeSliderContainer.classList.remove('active');
    volumeOpen = false;
  });

  volumeSliderContainer.addEventListener('click', function (e) {
    e.stopPropagation();
  });
} else {
  volumeControl.addEventListener('mouseenter', () => {
    clearTimeout(volumeTimeout);
    volumeSliderContainer.classList.add('active');
  });
  volumeControl.addEventListener('mouseleave', () => {
    volumeTimeout = setTimeout(() => {
      volumeSliderContainer.classList.remove('active');
    }, 1100);
  });
  volumeSliderContainer.addEventListener('mouseenter', () => {
    clearTimeout(volumeTimeout);
  });
  volumeSliderContainer.addEventListener('mouseleave', () => {
    volumeTimeout = setTimeout(() => {
      volumeSliderContainer.classList.remove('active');
    }, 1100);
  });
}