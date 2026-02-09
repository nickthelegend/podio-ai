# Podio AI 🎙️💻

Podio AI is an all-in-one AI Content Studio designed to transform ideas into stunning presentations and engaging podcasts in minutes. Built for creators, marketers, and professionals who need high-quality content without the manual grind.

## ✨ Features

### 🎨 AI Slide Studio
- **Instant Generation**: Create a full slide deck from a simple prompt.
- **Smart Editor**: Edit slides using natural language. Ask to "make it more detailed", "use a funny tone", or "add statistics".
- **Premium Layouts**: Support for Title, Content, Statistics, Quotes, and Conclusion slides.
- **Multi-Format Support**: Switch between **16:9 (Presentation)**, **9:16 (Viral Shorts)**, and **4:5 (LinkedIn Carousel)**.
- **Brand Kits**: Apply your brand's colors and theme instantly across all content.

### 🎙️ Podcast Engine
- **AI Scripting**: Generate professional conversational scripts between hosts and guests.
- **Voiceover (TTS)**: Integrated high-quality Text-to-Speech for every slide.
- **Real-time Sync**: Audio is perfectly synced with slide transitions and animations.

### 📤 Premium Export Suite
- **PDF Export**: Generate high-fidelity PDFs that preserve your brand's gradients and layouts.
- **Video Export (MP4/WebM)**: A unique **Serverless-compatible** video rendering engine that captures frames directly in your browser. No expensive backend FFmpeg required.
- **Presentation Bundle**: Download your voiceovers and slides together for easy sharing.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Modern oklab/oklch color spaces)
- **AI Engine**: Google Gemini 2.0 Flash
- **Video Engine**: Remotion (Composition & Playback)
- **State Management**: Zustand
- **Database & Auth**: Supabase
- **PDF Generation**: jsPDF
- **Browser Capturing**: html2canvas + MediaRecorder API

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nickthelegend/podio-ai.git
   cd podio-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3002](http://localhost:3002) to start creating.

## 📱 roadmap & Phase 2
- [x] Viral Shorts Mode (9:16)
- [x] LinkedIn Carousel Support
- [x] Brand Kit Integration
- [x] Browser-side Video Export
- [ ] AI Image Generation for Slides (DALL-E 3 / Imagen)
- [ ] Direct LinkedIn/Instagram Publishing
- [ ] Interactive Polls for Presentations

## 📄 License
MIT License - Created by [Nick](https://github.com/nickthelegend)
