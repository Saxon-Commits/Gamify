import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, SkipForward, Music } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';

const PLAYLIST = [
    '/XPFocus music/A cup of tea.mp3',
    '/XPFocus music/Florist.mp3',
    '/XPFocus music/Cue.mp3',
    '/XPFocus music/lofihiphop.ogg'
];

export const BackgroundMusicPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { isSidePanelOpen } = useGameStore();
    const { musicVolume, isMusicMuted } = useSettingsStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Math.floor(Math.random() * PLAYLIST.length));
    const [hasInteracted, setHasInteracted] = useState(false);

    // Sync Volume & Mute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicVolume;
            audioRef.current.muted = isMusicMuted;
        }
    }, [musicVolume, isMusicMuted]);

    // Auto-play / Track Change
    useEffect(() => {
        if (audioRef.current) {
            // Only attempt to play if we haven't been paused manually, OR if it's a track change (which usually implies continuing playback)
            // Actually, for simplicity, we try to play on mount/track change if intended state isn't "paused by user".
            // But browser policy often blocks auto-play.

            const playAudio = async () => {
                try {
                    // If we haven't interacted yet, simple play might fail.
                    await audioRef.current?.play();
                    setIsPlaying(true);
                } catch (err) {
                    console.log("Autoplay blocked:", err);
                    setIsPlaying(false);
                }
            };

            playAudio();
        }
    }, [currentTrackIndex]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
        setHasInteracted(true);
    };

    const nextTrack = () => {
        let nextIndex = currentTrackIndex;
        // Simple shuffle-like behavior: pick random different track
        while (nextIndex === currentTrackIndex && PLAYLIST.length > 1) {
            nextIndex = Math.floor(Math.random() * PLAYLIST.length);
        }
        setCurrentTrackIndex(nextIndex);
        setHasInteracted(true);
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={PLAYLIST[currentTrackIndex]}
                onEnded={nextTrack}
                onError={(e) => console.error("Audio error:", e)}
            />

            <div
                className={`fixed bottom-6 z-50 flex items-center gap-2 transition-all duration-500 ease-in-out ${isSidePanelOpen ? 'right-[38rem]' : 'right-6'}`}
            >
                {/* Track Info (Hover to see) */}
                <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 whitespace-nowrap bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-xs text-slate-400">
                    Now Playing: {PLAYLIST[currentTrackIndex].split('/').pop()?.split(' - ')[0]?.replace('ES_', '')}
                </div>

                <button
                    onClick={nextTrack}
                    className="p-3 rounded-full shadow-lg backdrop-blur-md border border-white/10 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300"
                    title="Next Track"
                >
                    <SkipForward size={20} />
                </button>

                <button
                    onClick={togglePlay}
                    className={`
            p-3 rounded-full shadow-xl backdrop-blur-md border border-white/10 transition-all duration-300 group
            ${isPlaying
                            ? 'bg-indigo-600/80 text-white hover:bg-indigo-500 hover:scale-110 hover:shadow-indigo-500/50'
                            : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }
          `}
                    title={isPlaying ? "Pause Music" : "Play Music"}
                >
                    {isPlaying ? (
                        <div className="relative">
                            <Volume2 size={24} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                    ) : (
                        <VolumeX size={24} />
                    )}
                </button>
            </div>
        </>
    );
};
