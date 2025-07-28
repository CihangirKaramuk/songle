import apiService from './apiService.js';

let sarkiListesi = [];
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

// Initialize the app by fetching songs
async function initializeApp() {
  try {
    sarkiListesi = await apiService.getSongs();
    console.log('Songs loaded successfully:', sarkiListesi.length);
  } catch (error) {
    console.error('Failed to load songs:', error);
    // Show error to user if needed
    alert('Şarkılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
  }
}

// Initialize the app when the script loads
initializeApp();

// Sayfa yüklendiğinde rastgele kategori seç
function rastgeleKategoriSec() {
  if (options.length > 0) {
    // Rastgele bir ana kategori seç
    const rastgeleIndex = Math.floor(Math.random() * options.length);
    const secilenKategori = options[rastgeleIndex];
    secilenKategori.click();
    
    // Alt kategoriler yüklendikten sonra rastgele bir alt kategori seç
    setTimeout(() => {
      let altKategoriler = [];
      
      // Seçilen kategoriye göre uygun alt kategorileri belirle
      switch(secilenKategori.getAttribute('data-value')) {
        case 'dizi':
          altKategoriler = document.querySelectorAll('.dizi-alt-kategori-card');
          break;
        case 'film':
          altKategoriler = document.querySelectorAll('.film-alt-kategori-card');
          break;
        case 'turkce':
          altKategoriler = document.querySelectorAll('#turkceAltKategoriler .alt-kategori-card');
          break;
        case 'yabanci':
          altKategoriler = document.querySelectorAll('#yabanciAltKategoriler .alt-kategori-card');
          break;
      }
      
      // Eğer alt kategori varsa rastgele birini seç
      if (altKategoriler && altKategoriler.length > 0) {
        const rastgeleAltKategoriIndex = Math.floor(Math.random() * altKategoriler.length);
        altKategoriler[rastgeleAltKategoriIndex].click();
      }
    }, 100);
  }
}

// Sayfa yüklendiğinde rastgele kategori seç
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rastgeleKategoriSec);
} else {
  rastgeleKategoriSec();
}

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

document.addEventListener("click", async (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    dropdownOptions.style.display = "none";
  }
});

document.querySelector(".start-btn").addEventListener("click", async function () {
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
  try {
    sarkiListesi = await apiService.getSongs();
    soruListesi = sarkiListesi.filter(sarki => sarki.kategori === oyunKategoriKey);

    if (soruListesi.length === 0) {
      alert("Bu kategoride henüz şarkı yok!");
      return;
    }
  } catch (error) {
    console.error('Error fetching songs:', error);
    alert('Şarkılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
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
  // Her iki stringi de küçük harfe çevir ve fazla boşlukları temizle
  tahmin = tahmin.toLowerCase().trim();
  cevap = cevap.toLowerCase().trim();
  
  if (!cevap) {
    return false; // Geçersiz format
  }
  
  // Basit karşılaştırma: tam eşleşme
  if (tahmin === cevap) {
    return true;
  }
  
  // Daha esnek karşılaştırma için benzerlik hesapla
  return benzerlikHesapla(tahmin, cevap) > 0.7; // %70 benzerlik eşiği
}

function benzerlikHesapla(str1, str2) {
  // Basit Levenshtein distance tabanlı benzerlik
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Matrix'i başlat
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Matrix'i doldur
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i-1] === str2[j-1]) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1, // değiştir
          matrix[i][j-1] + 1,   // ekle
          matrix[i-1][j] + 1    // sil
        );
      }
    }
  }
  
  // Benzerlik oranını hesapla (0-1 arası)
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
}


document.querySelector(".tahmin-gonder").addEventListener("click", function () {
  const input = document.querySelector(".tahmin-input");
  const tahmin = input.value.trim();

  console.log(tahmin, soruListesi[soruIndex].cevap);

  if (cevapDogruMu(tahmin, soruListesi[soruIndex].cevap)) {
    albumCover.style.filter = 'blur(0px)';
    // Blur kaldır
    sarkiKutusu.classList.remove('blurred');
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
  // Blur while playing (apply before updating text to avoid flicker)
  sarkiKutusu.classList.add('blurred');
  sarkiKutusu.textContent = soru.sarki;
  document.querySelector(".tahmin-input").value = "";
  document.getElementById("zamanGoster").textContent = "Kalan Süre: 30";
  // Önceki çalmayı durdur ve yeni şarkıyı yükle
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioPlayer.src = soru.dosya;
  audioPlayer.load();
  audioPlayer.play().catch(()=>{});

  // Albüm kapağını güncelle
  if (albumCover) {
    if (soru.kapak) {
      // Önce bulanıklığı uygula, sonra görseli güncelle ve göster
      albumCover.style.filter = `blur(${INITIAL_COVER_BLUR}px)`;
      albumCover.src = soru.kapak;
      albumCover.style.display = 'block';
    } else {
      albumCover.style.display = 'none';
    }
  }

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
  // Önceki interval'ı temizle, hızlanmayı önle
  clearInterval(sayacInterval);
  kalanSure = 30;
  document.getElementById("zamanGoster").textContent = `Kalan Süre: ${kalanSure}`;

  sayacInterval = setInterval(() => {
    kalanSure--;
    document.getElementById("zamanGoster").textContent = `Kalan Süre: ${kalanSure}`;

    // Albüm kapağı blur seviyesini kalan süreye göre güncelle
    if (albumCover && albumCover.style.display !== 'none') {
      const blurPx = (kalanSure / 30) * INITIAL_COVER_BLUR;
      albumCover.style.filter = `blur(${blurPx}px)`;
    }

    if (kalanSure <= 0) {
      clearInterval(sayacInterval);
      // Blur kaldır
    sarkiKutusu.classList.remove('blurred');
        // controls kapat
    guessInput.disabled = true;
    guessBtn.disabled = true;
    replayBtn.disabled = true;

    albumCover.style.filter = 'blur(0px)';

    timeUpEl.classList.add('show');

      setTimeout(() => {
        timeUpEl.classList.remove('show');
        // controls aç
        guessInput.disabled = false;
        guessBtn.disabled = false;
        replayBtn.disabled = false;
        soruIndex = rastgeleSoruIndex();
        guncelleSoru();
        baslatSayac();
      }, 2000);
    }
  }, 1000);
}

const audioPlayer = document.getElementById('audio-player');
const albumCover = document.getElementById('album-cover');
const INITIAL_COVER_BLUR = 20; // px
const sarkiKutusu = document.querySelector('.sarki-kutusu');
const guessInput = document.querySelector('.tahmin-input');
const guessBtn = document.querySelector('.tahmin-gonder');
const timeUpEl = document.getElementById('time-up');
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