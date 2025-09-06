# Songle 🎵

A music guessing game inspired by Wordle, where players listen to song clips and try to guess the song title. Built with vanilla JavaScript, HTML, and CSS.

## 🎮 About

Songle is an interactive web-based music guessing game that challenges players to identify songs from short audio clips. The game features various music categories including Turkish and foreign songs, as well as music from TV series and movies.

**"Şarkıyı tahmin et. Atmosferi hisset."** _(Guess the song. Feel the atmosphere.)_

## ✨ Features

### 🎵 Game Features

- **Dynamic Categories**: Fully customizable categories and subcategories via admin panel
- **20 Questions Per Game**: Each game consists of 20 questions for extended gameplay
- **30-second Timer**: Each round has a time limit for added challenge
- **Album Cover Hints**: Visual clues with album artwork that gradually becomes clear
- **Smart Answer Matching**: Advanced fuzzy string matching for song titles with 75% similarity threshold
- **Score Tracking**: Real-time score calculation based on remaining time
- **Pass Feature**: Skip difficult questions with Tab key or pass button
- **Detailed Results**: Comprehensive game statistics and question breakdown
- **Volume Control**: Persistent volume settings with localStorage
- **Mobile Optimized**: Touch-friendly controls and responsive design

### 🎨 User Interface

- **Modern Design**: Clean, neumorphic UI with smooth animations and transitions
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Turkish Language**: Fully localized interface with proper Turkish character support
- **Music Visualizer**: Animated music note during playback with progress bar
- **Dynamic Category Selection**: Real-time category loading from database
- **Theme Support**: Light and Dark mode with automatic switching
- **Accessibility**: Keyboard navigation support (Enter, Tab, Escape keys)

### 🔧 Technical Features

- **Vanilla JavaScript**: No framework dependencies, pure ES6+ modules
- **RESTful API**: Complete backend integration for all game data
- **Modular Architecture**: Clean, maintainable code structure
- **Real-time Updates**: Automatic category refresh every 10 seconds
- **Audio Management**: MP3 file handling with error recovery
- **Image Management**: Album cover storage with blur effects
- **Deezer Integration**: Direct song search and download from Deezer API
- **Comprehensive Logging**: Complete audit trail of all admin actions
- **User Management**: Role-based access control with password security

### 🛡️ Admin Panel Features

- **Complete Song Management**: Add, edit, delete songs with audio and cover files
- **Dynamic Category Management**: Create and manage categories and subcategories
- **Advanced User Management**: Add, edit, delete users with role-based permissions
- **Comprehensive Operation Logs**: Complete audit trail with filtering and pagination
- **File Management**: Secure upload and management of MP3 files and album covers
- **Deezer Integration**: Search and download songs directly from Deezer
- **Batch Operations**: Select and delete multiple songs or operation logs
- **Settings Management**: Theme, pagination, and notification preferences
- **System Monitoring**: Real-time statistics and system information
- **Responsive Design**: Works seamlessly on all devices with modern UI

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
   - Choose a sub-category (Rock, Pop, Hip Hop, Mixed, etc.)

2. **Play the Game**

   - Listen to the 30-second audio clip
   - Type your guess in the input field
   - Press Enter to submit or Tab to pass
   - Use the replay button to hear the song again

3. **Score Points**

   - Correct answers earn points based on remaining time
   - 30 seconds = 30 points, 1 second = 1 point
   - Pass difficult questions to continue playing

4. **Complete the Game**
   - Play through 20 questions
   - View detailed results and statistics
   - See which songs you got right, wrong, or passed

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

The game supports dynamic categories that can be managed through the admin panel:

- **Türkçe** (Turkish): Rock, Pop, Hip Hop, Mixed, and custom subcategories
- **Yabancı** (Foreign): Rock, Pop, Hip Hop, Mixed, and custom subcategories
- **Dizi** (TV Series): Turkish, Foreign, and custom subcategories
- **Film** (Movies): Turkish, Foreign, and custom subcategories

Categories are loaded dynamically from the database and can be customized through the admin panel.

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

The admin panel uses a modular JavaScript architecture with ES6 modules:

- **`global-variables.js`**: Centralized state management and global variables
- **`settings.js`**: Operation logs, system settings, and user management
- **`song-management.js`**: Complete song CRUD operations with batch operations
- **`category-management.js`**: Dynamic category and subcategory management
- **`deezer.js`**: Deezer API integration for song search and download
- **`utils.js`**: Utility functions, toast messages, and common helpers
- **`theme.js`**: Theme management with localStorage persistence
- **`logout.js`**: Secure session management and logout functionality

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

### v2.1.0 - Enhanced Game Experience

- **20 Questions Per Game**: Extended gameplay with comprehensive scoring
- **Pass Feature**: Skip difficult questions with Tab key or pass button
- **Detailed Results**: Complete game statistics and question breakdown
- **Volume Control**: Persistent volume settings with localStorage
- **Mobile Optimization**: Enhanced touch controls and responsive design
- **Dynamic Categories**: Real-time category loading from database
- **Advanced Scoring**: Time-based scoring system with visual feedback

### v2.0.0 - Major Admin Panel Update

- Complete modular JavaScript architecture with ES6 modules
- Comprehensive operation logging system with filtering and pagination
- Enhanced user management with role-based access and password security
- Deezer integration for song search and download
- Batch operations for songs and operation logs
- Improved UI/UX with theme support and modern design
- Better error handling and validation throughout

### v1.5.0 - Operation Logs

- Added comprehensive logging for all admin actions
- User activity tracking with detailed audit trails
- Advanced filtering and pagination for operation logs
- System monitoring and statistics dashboard

### v1.0.0 - Initial Release

- Core game functionality with 30-second timer
- Basic admin panel with song management
- Category and subcategory management
- Album cover hints and visual feedback

---

**Enjoy playing Songle! 🎵✨**
