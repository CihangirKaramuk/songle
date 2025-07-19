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

// BURADA KİLİT NOKTA SVG'LAR! 
const eyeOpenSvg = `
<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
  <ellipse cx="12" cy="12" rx="9" ry="5" stroke="#aaa" stroke-width="2"/>
  <circle cx="12" cy="12" r="2.7" stroke="#aaa" stroke-width="2" fill="none"/>
  <path d="M6 8 Q12 2 18 8" stroke="#aaa" stroke-width="1.5" fill="none" />
</svg>
`;

const eyeClosedSvg = `
<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
  <!-- Kapalı göz kapağı -->
  <path d="M4 12 Q12 6 20 12" stroke="#aaa" stroke-width="2.5" fill="none"/>
  <!-- Hafif alt göz izi -->
  <path d="M4 13 Q12 18 20 13" stroke="#aaa" stroke-width="1" fill="none"/>
  <!-- Kirpikler -->
  <path d="M7 11 Q8 9 9 11" stroke="#aaa" stroke-width="1.1" fill="none"/>
  <path d="M12 10 Q12 7 13 10" stroke="#aaa" stroke-width="1.1" fill="none"/>
  <path d="M17 11 Q16 9 15 11" stroke="#aaa" stroke-width="1.1" fill="none"/>
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

updateTogglePasswordIcon();

