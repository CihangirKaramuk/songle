const API_BASE_URL = 'http://localhost/songle-backend/api'

const apiService = {
  // Get all songs
  async getSongs() {
    try {
      const response = await fetch(`${API_BASE_URL}/songs.php`)
      if (!response.ok) {
        throw new Error('Failed to fetch songs')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching songs:', error)
      // Fallback to empty array if API fails
      return []
    }
  },

  async getKategoriler(isParent) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/kategoriler.php?is_parent=${isParent}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching categories:', error)
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
        throw new Error('Failed to update song')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating song:', error)
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
        throw new Error('Failed to add song')
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding song:', error)
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
}

export default apiService
