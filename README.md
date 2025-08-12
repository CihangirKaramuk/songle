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
- **Theme Support**: Light and Dark mode with automatic switching

### 🔧 Technical Features

- **Vanilla JavaScript**: No framework dependencies
- **RESTful API**: Backend integration for song management
- **Admin Panel**: Complete content management system with modular architecture
- **Audio Management**: MP3 file handling and playback
- **Image Management**: Album cover storage and display
- **Deezer Integration**: Direct song search and download from Deezer
- **Comprehensive Logging**: Operation logs for all admin actions
- **User Management**: Role-based access control for administrators

### 🛡️ Admin Panel Features

- **Song Management**: Add, edit, delete songs with audio and cover files
- **Category Management**: Organize songs into categories and subcategories
- **User Management**: Add, edit, delete authorized personnel with role management
- **Operation Logs**: Complete audit trail of all admin actions
- **File Management**: Upload and manage MP3 files and album covers
- **Deezer Integration**: Search and download songs directly from Deezer
- **Responsive Design**: Works on all devices with modern UI

## 🚀 Installation

### Prerequisites

- XAMPP (or similar local server with PHP and MySQL)
- Web browser with JavaScript enabled
- PHP 7.4+ with MySQL support

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/songle.git
   cd songle
   ```

2. **Set up the backend**

   - Place the project in your XAMPP `htdocs` folder
   - Ensure the backend API is running at `http://localhost/songle-backend/api`
   - Import `songle-backend/songle.sql` to create the database
   - Configure your database connection in `songle-backend/config/database.php`

3. **Add music files**

   - Place MP3 files in the `songs/` directory
   - Add album cover images to the `kapaklar/` directory
   - Update the database with song information via admin panel

4. **Start the server**
   - Start XAMPP Apache and MySQL services
   - Navigate to `http://localhost/songle` in your browser
   - Access admin panel at `http://localhost/songle/admin/`

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

### Database Configuration

Update database settings in `songle-backend/config/database.php`:

```php
$host = 'localhost'
$dbname = 'songle'
$username = 'root'
$password = ''
```

### Categories

The game supports the following categories:

- **Türkçe** (Turkish): Rock, Pop, Hip Hop, Mixed
- **Yabancı** (Foreign): Rock, Pop, Hip Hop, Mixed
- **Dizi** (TV Series): Turkish, Foreign
- **Film** (Movies): Turkish, Foreign

## 🛠️ Development

### Project Structure

```
songle/
├── admin/                 # Admin panel files
│   ├── modules/          # Modular JavaScript files
│   ├── api-panel.html    # Main admin interface
│   └── panel-style.css   # Admin panel styles
├── songle-backend/        # Backend API
│   ├── api/              # API endpoints
│   ├── config/           # Configuration files
│   └── songle.sql        # Database schema
├── songs/                 # MP3 audio files
├── kapaklar/              # Album cover images
├── script.js              # Main game logic
├── apiService.js          # API communication
└── style.css              # Game styles
```

### Adding New Songs

1. Upload MP3 files to the `songs/` directory
2. Add album cover images to the `kapaklar/` directory
3. Use the admin panel to add song metadata to the database
4. Or use Deezer integration to search and download songs

### Admin Panel

Access the admin panel at `http://localhost/songle/admin/` to:

- Add/edit/delete songs with audio and cover files
- Manage categories and subcategories
- Upload audio files and images
- Monitor operation logs and system statistics
- Manage authorized personnel with role-based access
- Search and download songs from Deezer

### Modular Architecture

The admin panel uses a modular JavaScript architecture:

- **`global-variables.js`**: Centralized state management
- **`settings.js`**: Operation logs and system settings
- **`song-management.js`**: Song CRUD operations
- **`category-management.js`**: Category management
- **`deezer.js`**: Deezer API integration
- **`utils.js`**: Utility functions and helpers
- **`theme.js`**: Theme management
- **`logout.js`**: Session management

### Customization

- Modify `style.css` for visual changes
- Update game logic in `script.js`
- Add new categories in the HTML structure
- Customize admin panel in `admin/modules/`

## 🎵 Supported Audio Formats

- **Primary**: MP3 files
- **Location**: `songs/` directory
- **Naming**: Use descriptive filenames (e.g., `Artist-Song_Title.mp3`)
- **Size**: Recommended under 10MB for optimal performance

## 🖼️ Image Requirements

- **Format**: JPG/PNG
- **Location**: `kapaklar/` directory
- **Naming**: `song_[ID].jpg` format
- **Size**: Recommended 300x300px or larger
- **Quality**: High quality for better visual experience

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📱 Mobile Support

The game is fully responsive and optimized for mobile devices with touch-friendly controls and adaptive layouts. The admin panel also works seamlessly on mobile devices.

## 🔐 Security Features

- **Session Management**: Secure admin authentication
- **Role-based Access**: Different permission levels for users
- **Operation Logging**: Complete audit trail of all actions
- **Input Validation**: XSS and SQL injection protection
- **File Upload Security**: Secure file handling and validation

## 📊 Monitoring & Logging

- **Operation Logs**: Track all admin actions with timestamps
- **User Activity**: Monitor user login/logout and actions
- **System Statistics**: View game usage and performance metrics
- **Error Logging**: Comprehensive error tracking and reporting

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
- Deezer for music API integration

## 📞 Support

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.

## 🔄 Recent Updates

### v2.0.0 - Major Admin Panel Update

- Complete modular JavaScript architecture
- Comprehensive operation logging system
- Enhanced user management with role-based access
- Deezer integration for song search and download
- Improved UI/UX with theme support
- Better error handling and validation

### v1.5.0 - Operation Logs

- Added comprehensive logging for all admin actions
- User activity tracking
- Audit trail for compliance and debugging

### v1.0.0 - Initial Release

- Core game functionality
- Basic admin panel
- Song and category management

---

**Enjoy playing Songle! 🎵✨**
