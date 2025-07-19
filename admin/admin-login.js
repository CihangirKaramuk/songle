const correctUsername = "admin";
const correctPassword = "admin";

document.getElementById("loginBtn").addEventListener("click", girisKontrol);
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    girisKontrol();
  }
});

function girisKontrol() {
  const usernameInput = document.getElementById("adminUsername").value.trim();
  const passwordInput = document.getElementById("adminPassword").value;

  if (usernameInput === correctUsername && passwordInput === correctPassword) {
    localStorage.setItem("adminGiris", "ok");
    window.location.href = "panel.html";
  } else {
    document.getElementById("errorMsg").textContent = "Kullanıcı adı veya şifre yanlış!";
  }
}

const passwordInput = document.getElementById("adminPassword");
const togglePassword = document.getElementById("togglePassword");

// Modern göz (göz açık)
const eyeOpenSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <ellipse cx="21" cy="24" rx="10" ry="6" stroke="#aaa" stroke-width="2"/>
  <circle cx="21" cy="24" r="2.8" fill="#aaa" stroke="#aaa" stroke-width="1.7"/>
  <path d="M15 17 L13 14" stroke="#aaa" stroke-width="1.5"/>
  <path d="M21 16 L21 12" stroke="#aaa" stroke-width="1.5"/>
  <path d="M27 17 L29 14" stroke="#aaa" stroke-width="1.5"/>
</svg>
`;

// Modern göz kapalı (çapraz çizgiyle, evrensel ve çok net)
const eyeClosedSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <!-- Alt göz eğrisi (daha dar: 8 → 11, 34 → 31) -->
  <path d="M11 23 Q21 29 31 23" stroke="#aaa" stroke-width="2.2" fill="none"/>
  <!-- Kapak (üst eğri) (daha dar: 8 → 11, 34 → 31) -->
  <path d="M11 22 Q21 19 31 22" stroke="#aaa" stroke-width="2.2" fill="none"/>
  <!-- Kirpikler (x koordinatları aynı kalsın) -->
  <path d="M15 24 L13 27" stroke="#aaa" stroke-width="1.5"/>
  <path d="M21 25 L21 30" stroke="#aaa" stroke-width="1.5"/>
  <path d="M27 24 L29 27" stroke="#aaa" stroke-width="1.5"/>
</svg>
`;

function updateTogglePasswordIcon() {
  if (passwordInput.type === "password") {
    togglePassword.innerHTML = eyeClosedSvg;
  } else {
    togglePassword.innerHTML = eyeOpenSvg;
  }
}

passwordInput.addEventListener("input", function() {
  if (this.value.length > 0) {
    togglePassword.style.display = "flex";
    updateTogglePasswordIcon();
  } else {
    togglePassword.style.display = "none";
    passwordInput.type = "password";
  }
});

togglePassword.addEventListener("click", function() {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  updateTogglePasswordIcon();
});

// Başlangıçta simgeyi doğru ayarla
updateTogglePasswordIcon();

