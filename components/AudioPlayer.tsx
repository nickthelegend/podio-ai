'use client'

import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Download } from 'lucide-react'
import { Button } from './ui/button'

interface AudioPlayerProps {
  audioUrl: string
  onDownload?: () => void
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onDownload }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(168, 85, 247, 0.4)', // Purple-400 with opacity
      progressColor: '#d946ef', // Pink-500
      cursorColor: '#fff',
      barWidth: 2,
      barGap: 3,
      height: 80,
      normalize: true,
      backend: 'MediaElement',
    })

    wavesurfer.current.load(audioUrl)

    wavesurfer.current.on('finish', () => setIsPlaying(false))

    return () => {
      wavesurfer.current?.destroy()
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause()
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
      <div ref={containerRef} className="w-full" />
      
      <div className="flex justify-between items-center">
        <Button 
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-purple-500/50 hover:bg-purple-500/20 text-purple-400 hover:text-white"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-1" />}
        </Button>

        {onDownload && (
          <Button 
            onClick={onDownload} 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <Download className="mr-2 w-4 h-4" /> Download
          </Button>
        )}
      </div>
    </div>
  )
}
