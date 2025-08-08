// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn')
  const logoutConfirmDialog = document.getElementById('logoutConfirmDialog')
  const logoutConfirmBtn = document.getElementById('logoutConfirmBtn')
  const logoutCancelBtn = document.getElementById('logoutCancelBtn')
  let isLoggingOut = false

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!isLoggingOut) {
        logoutConfirmDialog.style.display = 'flex'
      }
    })
  }

  if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', () => {
      logoutConfirmDialog.style.display = 'none'
    })
  }

  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', async () => {
      isLoggingOut = true
      logoutConfirmDialog.style.display = 'none'

      try {
        // Backend'e logout isteği gönder
        const response = await fetch(
          'http://localhost/songle-backend/api/kullanicilar.php',
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.ok) {
          console.log('Logout successful')
        }
      } catch (error) {
        console.error('Logout error:', error)
      }

      // Session storage'ı temizle
      sessionStorage.removeItem('userInfo')
      localStorage.removeItem('adminGiris')

      // Perform logout after hiding dialog
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 100)
    })
  }

  // Close dialog when clicking outside
  if (logoutConfirmDialog) {
    logoutConfirmDialog.addEventListener('click', function (e) {
      if (e.target === logoutConfirmDialog) {
        logoutConfirmDialog.style.display = 'none'
      }
    })
  }
})
