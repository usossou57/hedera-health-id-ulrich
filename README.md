# 🏥 Hedera Health ID

## Decentralized Digital Health Record for Africa

[![Hedera Hashgraph](https://img.shields.io/badge/Hedera-Hashgraph-00D4AA)](https://hedera.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://hedera-health-id.vercel.app)

### 🎯 Vision
First universal decentralized health record accessible to all Africans, even without smartphones. Leveraging Hedera Hashgraph's enterprise-grade blockchain technology to create a secure, scalable, and affordable healthcare identity system.

### ✨ Key Features
- 📱 **Multi-channel Access**: Web + Mobile PWA + USSD (*coming soon*)
- 🔒 **Blockchain Security**: Hedera Hashgraph smart contracts
- 🌍 **Universal Access**: Works even without smartphones
- 👤 **Patient-Controlled**: Users own and control their data
- 🏥 **Multi-role Support**: Patients, Doctors, Hospital Admins
- 📊 **Real-time Analytics**: Live dashboards and statistics
- 🔍 **QR Code Integration**: Quick patient identification
- 💊 **Complete Medical Records**: Consultations, prescriptions, history

### 🌐 Live Application
**🚀 [Try the Live Demo](https://hedera-health-id.vercel.app)**

#### Test Credentials:
**Doctor Login:**
- Email: `j.adjahoui@chu-mel.bj`
- Password: `password123`
- Hospital: `CHU-MEL - Cotonou`

**Hospital Admin:**
- Admin ID: `ADMIN001`
- Password: `password123`

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/AresGn/hedera-health-id.git
cd hedera-health-id

# Install dependencies
npm install

# Start development servers
npm run dev:all

# Or start individually:
# Frontend: cd frontend && npm run dev
# Backend: cd backend && npm run dev
```

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   React + TS    │◄──►│   Node.js + TS  │◄──►│   Hedera HCS    │
│   Tailwind CSS  │    │   Express       │    │   Smart Contracts│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PWA Service   │    │   PostgreSQL    │    │   Token Service │
│   Worker        │    │   Prisma ORM    │    │   (HTS)         │
│   Offline Cache │    │   Neon Cloud    │    │   Access Control│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📁 Project Structure
```
hedera-health-id/
├── frontend/                 # React PWA Application
│   ├── src/
│   │   ├── pages/           # Dashboard pages
│   │   ├── components/      # Reusable UI components
│   │   └── services/        # API integration
│   └── dist/                # Production build
├── backend/                 # Node.js Backend
│   ├── src/                 # TypeScript source code
│   ├── prisma/              # Database schema & migrations
│   └── contracts/           # Hedera smart contracts
├── docs/                    # 📚 Comprehensive Documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── SMART_CONTRACTS_GUIDE.md
│   ├── HEDERA_INTEGRATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── API.md
├── demo-data/               # Test data and fixtures
└── scripts/                 # Deployment and utility scripts
```

### 📚 Documentation

Explore our comprehensive documentation:

- **[🏗️ System Architecture](docs/SYSTEM_ARCHITECTURE.md)** - Technical architecture overview
- **[🔗 Smart Contracts Guide](docs/SMART_CONTRACTS_GUIDE.md)** - Blockchain implementation details
- **[⚡ Hedera Integration](docs/HEDERA_INTEGRATION.md)** - Hashgraph integration guide
- **[🚀 Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[📡 API Documentation](docs/API.md)** - REST API reference
- **[🔄 Communication Flow](docs/COMMUNICATION_FLOW.md)** - System interaction patterns
- **[🧪 Complete Testing Guide](COMPLETE_TESTING_GUIDE.md)** - Testing procedures
- **[📋 Submission Guide](SUBMISSION_GUIDE.md)** - Hackathon submission details

### 🛠️ Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- PWA capabilities
- QR Code scanning

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication

**Blockchain:**
- Hedera Hashgraph Testnet
- Smart Contracts (Solidity)
- Hedera Consensus Service (HCS)
- Hedera Token Service (HTS)

**Deployment:**
- Frontend: Vercel
- Backend: Vercel Serverless
- Database: Neon PostgreSQL
- Monitoring: Built-in analytics

### 🏆 Hedera Africa Hackathon 2025
Project submitted in the **DLT for Operations** category.

**Key Innovation:** Bringing blockchain-based healthcare identity to Africa through accessible, multi-channel technology that works for everyone, regardless of device access.

### 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and feel free to submit issues and pull requests.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🌍 Developed with ❤️ for Africa | 🚀 Powered by Hedera Hashgraph**

*Making healthcare accessible, secure, and decentralized for everyone.*
