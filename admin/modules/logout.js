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
    logoutConfirmBtn.addEventListener('click', () => {
      isLoggingOut = true
      logoutConfirmDialog.style.display = 'none'
      // Perform logout after hiding dialog
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 100)
    })
  }
})

// Simple Logout Confirmation
document.addEventListener('DOMContentLoaded', function () {
  const logoutBtn = document.getElementById('logoutBtn')
  const confirmDialog = document.getElementById('logoutConfirmDialog')

  if (logoutBtn && confirmDialog) {
    logoutBtn.addEventListener('click', function (e) {
      e.stopPropagation()
      confirmDialog.style.display = 'flex'
    })

    document
      .getElementById('logoutConfirmBtn')
      .addEventListener('click', function () {
        window.location.href = 'login.html'
      })

    document
      .getElementById('logoutCancelBtn')
      .addEventListener('click', function () {
        confirmDialog.style.display = 'none'
      })

    // Close dialog when clicking outside
    confirmDialog.addEventListener('click', function (e) {
      if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none'
      }
    })
  }
})
