// ----- Tema (Dark/Light) Toggle Ayarları -----
document.addEventListener('DOMContentLoaded', () => {
  const bodyEl = document.getElementById('panelBody')
  const toggleEl = document.getElementById('themeToggle')
  if (!toggleEl) return

  // Kayıtlı tema varsayılanı uygula
  const storedTheme = localStorage.getItem('songleTheme')
  if (storedTheme === 'light') {
    bodyEl.classList.add('light')
    toggleEl.checked = true
  }

  // Değişiklik olduğunda güncelle ve kaydet
  toggleEl.addEventListener('change', () => {
    if (toggleEl.checked) {
      bodyEl.classList.add('light')
      localStorage.setItem('songleTheme', 'light')
    } else {
      bodyEl.classList.remove('light')
      localStorage.setItem('songleTheme', 'dark')
    }
  })
})
