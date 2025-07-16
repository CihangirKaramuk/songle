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
