# Songle 🎵

A music guessing game inspired by Wordle, where players listen to song clips and try to guess the song title. Built with vanilla JavaScript, HTML, and CSS.

## 🎮 About

Songle is an interactive web-based music guessing game that challenges players to identify songs from short audio clips. The game features various music categories including Turkish and foreign songs, as well as music from TV series and movies.

**"Şarkıyı tahmin et. Atmosferi hisset."** _(Guess the song. Feel the atmosphere.)_

## ✨ Features

### 🎵 Game Features

- **Multiple Categories**: Turkish, Foreign, TV Series, and Movie music
- **Sub-categories**: Rock, Pop, Hip Hop, and Mixed genres
- **30-second Timer**: Each round has a time limit for added challenge
- **Album Cover Hints**: Visual clues with album artwork
- **Smart Answer Matching**: Fuzzy string matching for song titles
- **Score Tracking**: Keep track of your guessing performance
- **Random Daily Songs**: New songs every day for fresh gameplay

### 🎨 User Interface

- **Modern Design**: Clean, neumorphic UI with smooth animations
- **Responsive Layout**: Works on desktop and mobile devices
- **Turkish Language**: Fully localized interface
- **Music Visualizer**: Animated music note during playback
- **Category Selection**: Intuitive dropdown and card-based selection

### 🔧 Technical Features

- **Vanilla JavaScript**: No framework dependencies
- **RESTful API**: Backend integration for song management
- **Admin Panel**: Complete content management system
- **Audio Management**: MP3 file handling and playback
- **Image Management**: Album cover storage and display

## 🚀 Installation

### Prerequisites

- XAMPP (or similar local server with PHP and MySQL)
- Web browser with JavaScript enabled

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/songle.git
   cd songle
   ```

2. **Set up the backend**

   - Place the project in your XAMPP `htdocs` folder
   - Ensure the backend API is running at `http://localhost/songle-backend/api`
   - Configure your database connection

3. **Add music files**

   - Place MP3 files in the `songs/` directory
   - Add album cover images to the `kapaklar/` directory
   - Update the database with song information

4. **Start the server**
   - Start XAMPP Apache and MySQL services
   - Navigate to `http://localhost/songle` in your browser

## 🎯 How to Play

1. **Start the Game**

   - Click "Oynamaya Başla" (Start Playing)
   - Select a music category from the dropdown

2. **Choose Sub-category**

   - Select from available sub-categories (Rock, Pop, Hip Hop, Mixed)
   - For TV Series/Movies: Choose Turkish or Foreign

3. **Guess the Song**

   - Listen to the 30-second audio clip
   - Type your guess in the input field
   - Submit your answer before time runs out

4. **Track Your Score**
   - Correct answers earn points
   - Try to achieve the highest score possible

## 🔧 Configuration

### API Configuration

The game connects to a backend API for song management. Update the API base URL in `apiService.js`:

```javascript
const API_BASE_URL = 'http://localhost/songle-backend/api'
```

### Categories

The game supports the following categories:

- **Türkçe** (Turkish): Rock, Pop, Hip Hop, Mixed
- **Yabancı** (Foreign): Rock, Pop, Hip Hop, Mixed
- **Dizi** (TV Series): Turkish, Foreign
- **Film** (Movies): Turkish, Foreign

## 🛠️ Development

### Adding New Songs

1. Upload MP3 files to the `songs/` directory
2. Add album cover images to the `kapaklar/` directory
3. Use the admin panel to add song metadata to the database

### Admin Panel

Access the admin panel at `http://localhost/songle/admin/` to:

- Add/edit/delete songs
- Manage categories
- Upload audio files and images
- Monitor game statistics

### Customization

- Modify `style.css` for visual changes
- Update game logic in `script.js`
- Add new categories in the HTML structure

## 🎵 Supported Audio Formats

- **Primary**: MP3 files
- **Location**: `songs/` directory
- **Naming**: Use descriptive filenames (e.g., `Artist-Song_Title.mp3`)

## 🖼️ Image Requirements

- **Format**: JPG/PNG
- **Location**: `kapaklar/` directory
- **Naming**: `song_[ID].jpg` format
- **Size**: Recommended 300x300px or larger

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📱 Mobile Support

The game is fully responsive and optimized for mobile devices with touch-friendly controls and adaptive layouts.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Wordle's guessing game concept
- Built with vanilla web technologies
- Turkish music community for song suggestions

## 📞 Support

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.

---

**Enjoy playing Songle! 🎵✨**
