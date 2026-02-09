'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { useSlidesStore, EnhancedSlide, Project } from '@/lib/slidesStore'
import { getProjectById } from '@/lib/projects'
import { SlideComposition } from '@/components/remotion/SlideComposition'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Play,
    Download,
    Share2,
    Copy,
    Check,
    ArrowLeft,
    Presentation,
    Clock,
    Layers,
    ExternalLink,
    FileVideo
} from 'lucide-react'
import { Player, PlayerRef } from '@remotion/player'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { exportSlidesToPDF } from '@/lib/pdf'
import { VideoProcessingModal } from '@/components/VideoProcessingModal'
import html2canvas from 'html2canvas'

export default function ProjectExportPage() {
    const router = useRouter()
    const params = useParams()
    const projectId = params.id as string

    const { slides, topic, style, format, brand, hasVideo, loadProject, getProject } = useSlidesStore()
    const [copied, setCopied] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [project, setProject] = useState<Project | null>(null)
    const [isExportingPDF, setIsExportingPDF] = useState(false)
    const [showVideoModal, setShowVideoModal] = useState(false)
    const [videoStatus, setVideoStatus] = useState<'processing' | 'complete' | 'error'>('processing')
    const [videoProgress, setVideoProgress] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
    const playerRef = useRef<PlayerRef>(null)

    useEffect(() => {
        const loadProjectData = async () => {
            setIsLoading(true)

            // First check if current store has this project
            const currentProject = getProject()
            if (currentProject && currentProject.id === projectId) {
                setProject(currentProject)
                setIsLoading(false)
                return
            }

            // Try to load from Supabase
            try {
                const data = await getProjectById(projectId)

                if (data) {
                    const projectData: Project = {
                        id: data.id,
                        topic: data.title,
                        style: data.content?.style || 'Modern',
                        format: data.content?.format || '16:9',
                        brand: data.content?.brand,
                        slides: data.content?.slides || [],
                        createdAt: data.created_at,
                        updatedAt: data.created_at,
                        hasVideo: data.content?.slides?.some((s: EnhancedSlide) => s.audioUrl) || false
                    }
                    setProject(projectData)
                    loadProject(projectData)
                }
            } catch (e) {
                console.error('Failed to load project:', e)
            }

            setIsLoading(false)
        }

        loadProjectData()
    }, [projectId, getProject, loadProject])

    const handleCopyLink = () => {
        const url = `${window.location.origin}/project/${projectId}/export`
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/project/${projectId}/export`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: topic || 'AI Presentation',
                    text: `Check out this AI-generated presentation: ${topic}`,
                    url
                })
            } catch (e) {
                handleCopyLink()
            }
        } else {
            handleCopyLink()
        }
    }

    const handleExportPDF = async () => {
        if (!slides.length) return
        setIsExportingPDF(true)
        try {
            await exportSlidesToPDF(slides as any, topic || 'Presentation', format, brand)
            toast.success("PDF Downloaded!")
        } catch (e) {
            toast.error("Failed to export PDF")
        } finally {
            setIsExportingPDF(false)
        }
    }

    const downloadVoiceover = () => {
        // Collect all audio and provide as a bundle or individual
        slides.forEach((slide, i) => {
            if (slide.audioUrl) {
                const link = document.createElement('a');
                link.href = slide.audioUrl;
                link.download = `slide_${i + 1}_voiceover.mp3`;
                link.click();
            }
        });
        toast.success("Voiceover files downloading...");
    }

    const handleExportVideo = async () => {
        if (!hasVideo || !playerRef.current) {
            toast.error("Please generate video from the editor first")
            return
        }

        setShowVideoModal(true)
        setVideoStatus('processing')
        setVideoProgress(0)

        try {
            const player = playerRef.current;
            const container = document.querySelector('.remotion-player-container');
            if (!container) throw new Error("Could not find player container");

            // 1. Create a workspace canvas
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not initialize canvas context");

            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                bitsPerSecond: 5000000 // 5Mbps for high quality
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            const p = new Promise<void>((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    setRecordedUrl(url);
                    setVideoStatus('complete');
                    resolve();
                };
            });

            mediaRecorder.start();

            // 2. Render Loop (Frame by Frame)
            // We use a small batch size to keep the UI responsive
            const totalFramesCount = totalFrames;
            for (let f = 0; f < totalFramesCount; f += 1) {
                // Seek to frame
                player.seekTo(f);

                // Wait for layout/paint
                await new Promise(r => setTimeout(r, 60));

                // Capture current view
                const frameCanvas = await html2canvas(container as HTMLElement, {
                    width: w,
                    height: h,
                    scale: 1,
                    useCORS: true,
                    backgroundColor: null,
                    onclone: (clonedDoc) => {
                        // Fix for Tailwind CSS v4 oklab/oklch colors which crash html2canvas
                        const elements = clonedDoc.getElementsByTagName("*");
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i] as HTMLElement;
                            if (el.style) {
                                // Search for modern color functions in any style property
                                const style = clonedDoc.defaultView?.getComputedStyle(el);
                                if (style) {
                                    // We check common properties that might have oklab
                                    ['color', 'backgroundColor', 'borderColor', 'backgroundImage'].forEach(prop => {
                                        const val = (el.style as any)[prop] || style.getPropertyValue(prop);
                                        if (val && (val.includes('oklab') || val.includes('oklch'))) {
                                            // Fallback to transparent or black/white depending on property
                                            (el.style as any)[prop] = prop === 'color' ? '#ffffff' : 'transparent';
                                        }
                                    });
                                }
                            }
                        }
                    }
                });

                // Draw to our recording canvas
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(frameCanvas, 0, 0, w, h);

                setVideoProgress((f / totalFramesCount) * 100);
            }

            mediaRecorder.stop();
            await p;
            toast.success("Video Captured Successfully!");

        } catch (e) {
            console.error("Recording failed", e);
            setVideoStatus('error');
            toast.error("Video capture failed. Is your browser blocking canvas access?");
        }
    }

    const downloadRecordedVideo = () => {
        if (recordedUrl) {
            const link = document.createElement('a');
            link.href = recordedUrl;
            link.download = `${topic.replace(/\s+/g, '_')}.webm`;
            link.click();
            setShowVideoModal(false);
            toast.success("Download started!");
        }
    }

    const totalDuration = slides.reduce((acc, s) => acc + (s.duration || 5), 0)
    const totalFrames = slides.reduce((acc, s) => acc + (s.duration ? Math.ceil(s.duration * 30) : 150), 0)

    // Determine dimensions
    const dimensions = {
        '16:9': { w: 1280, h: 720, aspect: '16/9' },
        '4:5': { w: 1080, h: 1350, aspect: '4/5' },
        '9:16': { w: 720, h: 1280, aspect: '9/16' }
    };
    const { w, h, aspect } = dimensions[format || '16:9'];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading project...</p>
                </div>
            </div>
        )
    }

    if (!project && slides.length === 0) {
        return (
            <div className="min-h-screen bg-[#030014] text-white">
                <Header />
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                    <Presentation className="w-16 h-16 text-gray-600" />
                    <h2 className="text-2xl font-bold text-white">Project not found</h2>
                    <p className="text-gray-400">This project doesn't exist or has been deleted.</p>
                    <Button
                        onClick={() => router.push('/create/slides')}
                        className="mt-4 bg-gradient-to-r from-pink-600 to-rose-600"
                    >
                        Create New Presentation
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030014] text-white">
            <Header />

            {/* Video Processing Modal */}
            <VideoProcessingModal
                isOpen={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                status={videoStatus}
                progress={videoProgress}
                currentSlide={Math.floor((videoProgress / 100) * slides.length)}
                totalSlides={slides.length}
                onViewVideo={downloadRecordedVideo}
            />

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-pink-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />
            </div>

            <main className="relative container mx-auto px-6 pt-28 pb-16 max-w-6xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                </button>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Video Player Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 text-pink-400 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
                                <Play className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Video Preview</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">{topic}</h1>
                            {format !== '16:9' && (
                                <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded ml-2">
                                    {format} Format
                                </span>
                            )}
                        </div>

                        {/* Video Player Container */}
                        <div className={`remotion-player-container rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mx-auto`} style={{ maxWidth: format === '16:9' ? '100%' : '400px' }}>
                            {hasVideo ? (
                                <Player
                                    ref={playerRef}
                                    component={SlideComposition}
                                    inputProps={{ slides, brand: brand || undefined }}
                                    durationInFrames={totalFrames}
                                    fps={30}
                                    compositionWidth={w}
                                    compositionHeight={h}
                                    style={{ width: '100%', height: 'auto', aspectRatio: aspect }}
                                    controls
                                />
                            ) : (
                                <div className="flex items-center justify-center bg-neutral-900" style={{ aspectRatio: aspect }}>
                                    <div className="text-center">
                                        <Presentation className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500">Video not generated yet</p>
                                        <p className="text-gray-600 text-sm mt-1">Generate video from the editor</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Video Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Layers className="w-4 h-4" />
                                    Slides
                                </div>
                                <div className="text-2xl font-bold text-white">{slides.length}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Clock className="w-4 h-4" />
                                    Duration
                                </div>
                                <div className="text-2xl font-bold text-white">{Math.round(totalDuration)}s</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Presentation className="w-4 h-4" />
                                    Style
                                </div>
                                <div className="text-2xl font-bold text-white">{style}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Share & Export Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Share Card */}
                        <div className="bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-pink-400" />
                                Share Presentation
                            </h2>

                            <p className="text-gray-400 text-sm mb-4">
                                Share this link with anyone to let them view your presentation.
                            </p>

                            {/* Share Link */}
                            <div className="flex gap-2 mb-4">
                                <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/10 text-gray-400 text-sm truncate">
                                    {typeof window !== 'undefined' && `${window.location.origin}/project/${projectId}/export`}
                                </div>
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="border-white/10 hover:bg-white/5 shrink-0"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>

                            <Button
                                onClick={handleShare}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Presentation
                            </Button>
                        </div>

                        {/* Export Options */}
                        <div className="bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Download className="w-5 h-5 text-pink-400" />
                                Export Options
                            </h2>

                            <div className="space-y-3">
                                <button
                                    onClick={handleExportPDF}
                                    disabled={isExportingPDF}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                            <span className="text-red-400 text-lg">📄</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-white">Export as PDF</div>
                                            <div className="text-xs text-gray-500">Download slides as PDF</div>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                </button>

                                <button
                                    onClick={handleExportVideo}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors group ${hasVideo
                                        ? 'bg-white/5 hover:bg-white/10 border-white/5'
                                        : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                                        }`}
                                    disabled={!hasVideo}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <span className="text-purple-400 text-lg">🎬</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-white">Export as Video</div>
                                            <div className="text-xs text-gray-500">
                                                {hasVideo ? 'Download MP4 video' : 'Generate video first'}
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-blue-400 text-lg">📊</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-white">Export as PPTX</div>
                                            <div className="text-xs text-gray-500">PowerPoint format</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded-full">Coming Soon</span>
                                </button>
                            </div>
                        </div>

                        {/* Project ID */}
                        <div className="text-center text-xs text-gray-600">
                            Project ID: <span className="font-mono text-gray-500">{projectId}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Slides Preview Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12"
                >
                    <h3 className="text-lg font-bold text-white mb-4">Slide Overview</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {slides.map((slide, i) => (
                            <div
                                key={i}
                                className="shrink-0 w-64 aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-900 relative group cursor-pointer hover:border-pink-500/50 transition-colors"
                            >
                                {slide.htmlContent ? (
                                    <div
                                        className="w-full h-full transform scale-[0.25] origin-top-left"
                                        style={{ width: '400%', height: '400%' }}
                                        dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center p-4"
                                        style={{ backgroundColor: slide.backgroundColor, color: slide.textColor }}
                                    >
                                        <span className="text-xs font-medium text-center">{slide.title}</span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/60 px-2 py-1 rounded-full text-white">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
