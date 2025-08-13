# AscendEd: Tech Lab Breakout

A gamified learning simulation for mastering technical skills - Only A True Tech Master Can Escape!

## 🎯 Overview

AscendEd is an interactive educational game that teaches technical concepts through engaging scenarios and hands-on challenges. Players progress through different "rooms" in a virtual tech lab, each focusing on different technical skills.

## 🎮 Features

- **Interactive Learning**: Learn through doing, not just reading
- **Gamified Progress**: Track your advancement with XP, badges, and leaderboards  
- **Multiple Learning Modules**:
  - 🔄 **FLOWBYTE**: Master flowchart design and logical thinking
  - 🌐 **NETXUS**: Dive deep into network protocols and infrastructure
  - 🤖 **AITRIX**: Train AI models and understand machine learning
  - 🗄️ **SCHEMAX**: Design and optimize database systems
  - 💻 **CODEVANCE**: Master programming concepts and algorithms

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ascended-tech-lab.git
   cd ascended-tech-lab
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have live-server installed)
   npx live-server
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## 🎯 How to Play

1. **Create an Account**: Register with your username and email
2. **Enter the Command Center**: Access different learning modules
3. **Choose Your Path**: Select from available training rooms
4. **Complete Challenges**: Follow scenario-based learning experiences
5. **Track Progress**: Earn XP, unlock badges, and advance through levels

## 🏗️ Project Structure

```
ui-test-2/
├── index.html                 # Main entry point
├── src/
│   ├── pages/
│   │   ├── dashboard/         # User dashboard
│   │   └── command-center.html # Module selection
│   └── rooms/                 # Individual learning modules
│       └── flowchart-room.html
├── static/
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript files
│   ├── img/                   # Images and assets
│   └── video/                 # Video content
└── server/                    # Backend server files
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Bootstrap Icons
- **Backend**: Python Flask (optional)
- **Database**: SQLite (for user progress)
- **Graphics**: SVG for interactive elements

## 🎨 Current Learning Modules

### FLOWBYTE - Flowchart Construction Lab
- Learn flowchart fundamentals through story-driven scenarios
- Interactive drag-and-drop interface
- Real-time validation and feedback
- Character-driven learning with Sarah's Coffee Shop story

*More modules coming soon!*

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Complete all 5 learning modules
- [ ] Add multiplayer functionality
- [ ] Implement advanced progress tracking
- [ ] Mobile responsive design improvements
- [ ] Add more interactive scenarios
- [ ] Integration with learning management systems

## 📞 Contact

Project Link: [https://github.com/yourusername/ascended-tech-lab](https://github.com/yourusername/ascended-tech-lab)

---

*Ready to escape the Tech Lab? Let the learning adventure begin!* 🚀
