const API_BASE_URL = 'https://songle.app/songle-backend/api'

const apiService = {
  // Get all songs
  async getSongs() {
    try {
      const response = await fetch(`${API_BASE_URL}/songs.php`)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch songs: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Get songs error:', error)
      // Fallback to empty array if API fails
      return []
    }
  },

  async getKategoriler(isParent = null) {
    let _url = ''

    if (isParent !== null) {
      _url = `${API_BASE_URL}/kategoriler.php?is_parent=${isParent}`
    } else {
      _url = `${API_BASE_URL}/kategoriler.php`
    }

    try {
      const response = await fetch(_url)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()

      // Backend success response formatını kontrol et
      if (data.success && data.data) {
        return data.data
      } else {
        return data // Eğer farklı format varsa direkt döndür
      }
    } catch (error) {
      // Fallback to empty array if API fails
      return []
    }
  },
  //update songs
  async updateSong(songData) {
    try {
      const response = await fetch(`${API_BASE_URL}/songs.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to update song: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Update song error:', error)
      throw error // Re-throw to handle in the calling code
    }
  },

  // Add a new song
  async addSong(songData) {
    try {
      const response = await fetch(`${API_BASE_URL}/songs.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      })

      if (!response.ok) {
        // 409 Conflict hatası özel durum - şarkı zaten mevcut
        if (response.status === 409) {
          const error = new Error(
            `Song already exists: ${response.status} ${response.statusText}`
          )
          error.status = response.status
          error.response = response
          throw error
        }

        // Diğer hatalar için normal hata mesajı
        const error = new Error(
          `Failed to add song: ${response.status} ${response.statusText}`
        )
        error.status = response.status
        error.response = response
        throw error
      }

      return await response.json()
    } catch (error) {
      // 409 hatası normal bir durum, console'da loglama
      if (error.status !== 409) {
        console.error('Add song error:', error)
      }
      throw error // Re-throw to handle in the calling code
    }
  },

  // Delete a song
  async deleteSong(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/songs.php?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete song')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting song:', error)
      throw error // Re-throw to handle in the calling code
    }
  },

  // Get songs by category
  async getSongsByCategory(category) {
    const songs = await this.getSongs()
    return songs.filter((song) => song.kategori === category)
  },

  // Kategori yönetimi fonksiyonları
  async addKategori(kategoriData) {
    try {
      const response = await fetch(`${API_BASE_URL}/kategoriler.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kategoriData),
      })

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  },

  async updateKategori(id, kategoriData) {
    try {
      const response = await fetch(`${API_BASE_URL}/kategoriler.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kategoriData),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  async deleteKategori(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/kategoriler.php?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  },

  // Get song by ID
  async getSongById(id) {
    const songs = await this.getSongs()
    return songs.find((song) => song.id === id)
  },
  async linkliSongs() {
    try {
      const response = await fetch(`${API_BASE_URL}/songs.php?linkliler=true`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch songs')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching linkli songs:', error)
      throw error // Re-throw to handle in the calling code
    }
  },

  // login
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/kullanicilar.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kullanici_adi: username, sifre: password }),
      })

      return await response.json()
    } catch (error) {
      console.error('Error logging in:', error)
      throw error // Re-throw to handle in the calling code
    }
  },

  // Get user settings
  async getAyarlar(kullaniciId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ayarlar.php?kullanici_id=${kullaniciId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.error || 'Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Return default settings if API fails
      return {
        tema: 'dark',
        sayfa_boyutu: 10,
        bildirim_sesi: true,
      }
    }
  },

  // Save user settings
  async saveAyarlar(kullaniciId, ayarlar) {
    try {
      const response = await fetch(`${API_BASE_URL}/ayarlar.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kullanici_id: kullaniciId,
          tema: ayarlar.tema,
          sayfa_boyutu: ayarlar.sayfa_boyutu,
          bildirim_sesi: ayarlar.bildirim_sesi,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const data = await response.json()
      if (data.success) {
        return data
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      throw error
    }
  },

  // Get system information
  async getSistemBilgileri() {
    try {
      const response = await fetch(`${API_BASE_URL}/sistem-bilgileri.php`)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch system info: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      if (data.success && data.data) {
        return data.data
      } else {
        throw new Error('Invalid system info response format')
      }
    } catch (error) {
      console.error('Get system info error:', error)
      // Return default values if API fails
      return {
        toplam_sarki: 0,
        toplam_kategori: 0,
        toplam_kullanici: 0,
        son_7_gun_islem: 0,
        bugun_islem: 0,
      }
    }
  },
}

export default apiService
