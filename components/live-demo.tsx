'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Maximize2, Square } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Minimal Moondream Live Video Example
 * 
 * This example demonstrates detecting thumbs-up gestures from a webcam stream
 * using Moondream's vision API.
 */

interface MinimalExampleProps {
  inferenceUrl: string;
  apiKey: string;
  defaultFullscreen?: boolean;
}

interface Trigger {
  id: string;
  name: string;
  query: string;
  triggerText: string;
  notificationText: string;
}

const PRE_DEFINED_TRIGGERS: Trigger[] = [
  {
    id: 'smiling',
    name: 'Smiling',
    query: 'is anyone smiling? yes or no',
    triggerText: 'yes',
    notificationText: '😊 Smile Detected!',
  },
  {
    id: 'thumbs-up',
    name: 'Thumbs Up',
    query: 'is anyone giving a thumbs-up gesture? yes or no',
    triggerText: 'yes',
    notificationText: '👍 Thumbs Up Detected!',
  },
  {
    id: 'tongue-out',
    name: 'Sticking Tongue Out',
    query: 'is anyone sticking their tongue out? yes or no',
    triggerText: 'yes',
    notificationText: '👅 Tongue Out Detected!',
  },
  {
    id: 'peace-sign',
    name: 'Peace Sign',
    query: 'is anyone making a peace sign? yes or no',
    triggerText: 'yes',
    notificationText: '✌️ Peace Sign Detected!',
  },
  {
    id: 'drinking-water',
    name: 'Drinking Water',
    query: 'is anyone drinking water? yes or no',
    triggerText: 'yes',
    notificationText: '💧 Drinking Water Detected!',
  },
];

const STORAGE_KEY = 'moondream-custom-triggers';

export default function MinimalExample({ inferenceUrl, apiKey, defaultFullscreen = false }: MinimalExampleProps) {
  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzeFrameRef = useRef<(() => Promise<void>) | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState(PRE_DEFINED_TRIGGERS[0].query);
  const [triggerText, setTriggerText] = useState(PRE_DEFINED_TRIGGERS[0].triggerText);
  const [notificationText, setNotificationText] = useState(PRE_DEFINED_TRIGGERS[0].notificationText);
  const [resultHistory, setResultHistory] = useState<Array<{ id: number; text: string; isNotification?: boolean }>>([]);
  const [error, setError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(defaultFullscreen);
  
  // Trigger system state
  const [customTriggers, setCustomTriggers] = useState<Trigger[]>([]);
  const [selectedTriggerId, setSelectedTriggerId] = useState('smiling');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTriggerForm, setCustomTriggerForm] = useState({
    name: '',
    query: '',
    triggerText: '',
    notificationText: '',
  });
  const [videoDisplayInfo, setVideoDisplayInfo] = useState({ 
    displayWidth: 0, 
    displayHeight: 0, 
    offsetX: 0, 
    offsetY: 0,
    containerHeight: 0,
    isLargeView: false
  });

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam. Please check permissions.');
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
      videoRef.current.pause();
    }
    setIsStreaming(false);
    setResultHistory([]);
  }, []);

  // Start video file
  const startVideo = useCallback(async (file: File) => {
    try {
      setError('');
      
      if (!videoRef.current) return;
      
      const video = videoRef.current;
      
      // Check if browser can play this video type
      const canPlay = video.canPlayType(file.type);
      if (canPlay === '') {
        setError(`Video format "${file.type}" not supported. Try a different video format (MP4/WebM).`);
        return;
      }
      
      const url = URL.createObjectURL(file);
      video.srcObject = null;
      video.src = url;
      video.loop = true;
      
      // Wait for metadata to load before playing
      await new Promise<void>((resolve, reject) => {
        const onLoadedMetadata = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(new Error('Video failed to load'));
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
        
        // Trigger load
        video.load();
      });
      
      await video.play();
      setIsStreaming(true);
      
    } catch (err) {
      console.error('Video error:', err);
      setError('Could not load video file. Try recording in a different format or use an existing MP4 video.');
    }
  }, []);

  // Handle video file change
  const handleVideoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startVideo(file);
    }
  }, [startVideo]);

  // Capture frame from video
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Run inference on frame with retry logic
  const runInference = useCallback(async (imageData: string, question: string, retryCount = 0): Promise<string> => {
    const maxRetries = 3;
    
    try {
      const response = await fetch(inferenceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          image_url: imageData,
          question: question,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded - implement exponential backoff
          if (retryCount < maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 8000); // Max 8 seconds
            console.log(`Rate limit hit, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            return runInference(imageData, question, retryCount + 1);
          }
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.answer || '';
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }, [inferenceUrl, apiKey]);

  // Analyze frame
  const analyzeFrame = useCallback(async () => {
    try {
      setError('');
      
      const frame = captureFrame();
      if (!frame) {
        return;
      }

      // Use default query if query1 is empty
      const effectiveQuery1 = query1.trim() || 'summarize what you see in one short sentence';

      // Run both queries in parallel
      const [answer1, answer2] = await Promise.all([
        runInference(frame, effectiveQuery1),
        runInference(frame, query2)
      ]);
      
      // Check if trigger text is found in query 2 answer
      const detected = answer2.toLowerCase().includes(triggerText.toLowerCase());
      
      if (detected) {
        console.log(`🎯 Detection triggered! (found "${triggerText}" in response)`);
        // Add notification to result history
        setResultHistory(prev => {
          const newResult = { id: Date.now(), text: notificationText, isNotification: true };
          return [newResult, ...prev].slice(0, 3); // Keep only last 3
        });
      } else {
        // Add regular result to history
        if (answer1) {
          setResultHistory(prev => {
            const newResult = { id: Date.now(), text: answer1, isNotification: false };
            return [newResult, ...prev].slice(0, 3); // Keep only last 3
          });
        }
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  }, [captureFrame, runInference, query1, query2, triggerText, notificationText]);

  // Update ref whenever analyzeFrame changes
  useEffect(() => {
    analyzeFrameRef.current = analyzeFrame;
  }, [analyzeFrame]);

  // Continuous analysis loop - fires new request as soon as previous completes
  useEffect(() => {
    if (!isStreaming) return;

    let shouldContinue = true;

    const continuousAnalysis = async () => {
      while (shouldContinue) {
        // Use ref to get latest version of analyzeFrame
        if (analyzeFrameRef.current) {
          await analyzeFrameRef.current();
        }
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    continuousAnalysis();

    return () => {
      shouldContinue = false;
    };
  }, [isStreaming]);

  // Calculate actual video display area within container
  const getVideoDisplayInfo = useCallback(() => {
    const container = videoContainerRef.current;
    
    if (!container) {
      return { displayWidth: 0, displayHeight: 0, offsetX: 0, offsetY: 0, containerHeight: 0, isLargeView: false };
    }
    
    const containerRect = container.getBoundingClientRect();
    let contentWidth = 640;
    let contentHeight = 480;
    
    // Get dimensions from video
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      contentWidth = videoRef.current.videoWidth;
      contentHeight = videoRef.current.videoHeight;
    }
    
    const contentAspect = contentWidth / contentHeight;
    const containerAspect = containerRect.width / containerRect.height;
    
    let displayWidth, displayHeight, offsetX, offsetY;
    
    if (isFullscreen) {
      // Width mode: match max width, maintain aspect ratio
      displayWidth = containerRect.width;
      displayHeight = displayWidth / contentAspect;
      offsetX = 0;
      offsetY = 0;
    } else {
      // In normal mode, use contain mode (letterbox to fit)
      if (contentAspect > containerAspect) {
        // Content wider than container - letterbox top/bottom
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / contentAspect;
        offsetX = 0;
        offsetY = (containerRect.height - displayHeight) / 2;
      } else {
        // Content taller than container - letterbox left/right
        displayWidth = containerRect.height * contentAspect;
        displayHeight = containerRect.height;
        offsetX = (containerRect.width - displayWidth) / 2;
        offsetY = 0;
      }
    }
    
    // Determine if this is a "large" view based on video width
    // Use 800px as breakpoint
    const isLargeView = displayWidth >= 800;
    
    return { 
      displayWidth, 
      displayHeight, 
      offsetX, 
      offsetY,
      containerHeight: containerRect.height,
      isLargeView
    };
  }, [isFullscreen]);

  // Update video display info on resize and when video changes
  useEffect(() => {
    const updateDisplayInfo = () => {
      const info = getVideoDisplayInfo();
      setVideoDisplayInfo(info);
    };

    updateDisplayInfo();
    
    window.addEventListener('resize', updateDisplayInfo);
    
    // Update when video metadata loads
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateDisplayInfo);
    }
    
    return () => {
      window.removeEventListener('resize', updateDisplayInfo);
      if (video) {
        video.removeEventListener('loadedmetadata', updateDisplayInfo);
      }
    };
  }, [getVideoDisplayInfo, isFullscreen, isStreaming]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isFullscreen]);

  // Load custom triggers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomTriggers(parsed);
      }
    } catch (error) {
      console.error('Error loading custom triggers:', error);
    }
  }, []);

  // Save custom triggers to localStorage whenever they change
  useEffect(() => {
    if (customTriggers.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customTriggers));
      } catch (error) {
        console.error('Error saving custom triggers:', error);
      }
    }
  }, [customTriggers]);

  // Get all available triggers (pre-defined + custom)
  const allTriggers = useMemo(() => [...PRE_DEFINED_TRIGGERS, ...customTriggers], [customTriggers]);

  // Update query2, triggerText, and notificationText when trigger selection changes
  useEffect(() => {
    const selectedTrigger = allTriggers.find(t => t.id === selectedTriggerId);
    if (selectedTrigger) {
      setQuery2(selectedTrigger.query);
      setTriggerText(selectedTrigger.triggerText);
      setNotificationText(selectedTrigger.notificationText);
    }
  }, [selectedTriggerId, allTriggers]);

  // Handle trigger selection change
  const handleTriggerChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomModalOpen(true);
    } else {
      setSelectedTriggerId(value);
    }
  };

  // Handle creating a custom trigger
  const handleCreateCustomTrigger = () => {
    if (!customTriggerForm.name || !customTriggerForm.query || !customTriggerForm.triggerText || !customTriggerForm.notificationText) {
      return;
    }

    const newTrigger: Trigger = {
      id: `custom-${Date.now()}`,
      name: customTriggerForm.name,
      query: customTriggerForm.query,
      triggerText: customTriggerForm.triggerText,
      notificationText: customTriggerForm.notificationText,
    };

    setCustomTriggers(prev => [...prev, newTrigger]);
    setSelectedTriggerId(newTrigger.id);
    setIsCustomModalOpen(false);
    setCustomTriggerForm({
      name: '',
      query: '',
      triggerText: '',
      notificationText: '',
    });
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-black flex items-center justify-center" : "w-full max-w-7xl mx-auto mt-8"}>
      <Card className={isFullscreen ? "w-full border-none bg-transparent" : ""}>
        <CardContent className={isFullscreen ? "p-0" : "p-6"}>
          {!isFullscreen && (
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Moondream Live Video Demo</h1>
              <Button
                onClick={() => setIsFullscreen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Fullscreen
              </Button>
            </div>
          )}
          <div className={isFullscreen ? "" : "flex flex-col gap-6"}>
            {/* Video Display */}
            <div className={isFullscreen ? "w-full" : "w-full"}>
              <div 
                ref={videoContainerRef}
                className="relative bg-black overflow-hidden"
                style={{
                  aspectRatio: isFullscreen ? 'unset' : '16/9',
                  width: isFullscreen ? '100%' : 'auto',
                  height: isFullscreen ? 'auto' : 'auto',
                  borderRadius: isFullscreen ? '0' : '0.5rem',
                }}
              >
              {!isStreaming ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="flex flex-col gap-3 items-center px-4">
                      <button 
                        onClick={startWebcam}
                        className="text-white font-semibold shadow-lg hover:scale-105 transition-transform px-8 py-4 text-lg"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          background: 'rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          borderRadius: '9999px',
                        }}
                      >
                        Start Webcam
                      </button>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="hidden"
                        id="video-upload"
                      />
                      <label 
                        htmlFor="video-upload" 
                        className="cursor-pointer text-white/70 hover:text-white text-sm underline transition-colors"
                      >
                        or choose video
                      </label>
                    </div>
                  </div>
                  
                  {/* Moondream Logo - Top Left (Start View) */}
                  <div 
                    className="absolute z-20 flex items-center opacity-90"
                    style={{
                      top: isFullscreen ? `${videoDisplayInfo.offsetY + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                      left: isFullscreen ? `${videoDisplayInfo.offsetX + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                      gap: videoDisplayInfo.isLargeView ? '16px' : '8px',
                    }}
                  >
                    <div style={{ width: videoDisplayInfo.isLargeView ? '48px' : '32px', height: videoDisplayInfo.isLargeView ? '48px' : '32px' }}>
                      <Image
                        src="/md_logo.svg"
                        alt="Moondream"
                        width={48}
                        height={48}
                        className="w-full h-full"
                      />
                    </div>
                    <span 
                      className="text-white font-semibold tracking-tight"
                      style={{
                        fontSize: videoDisplayInfo.isLargeView ? '24px' : '16px',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
                      }}
                    >
                      Moondream
                    </span>
                  </div>
                </>
              ) : null}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full"
                style={{ 
                  objectFit: 'contain',
                  objectPosition: isFullscreen ? 'top left' : 'center',
                }}
              />
              


              {/* Bottom Controls Container - Flex Layout */}
              {isStreaming && (
              <div 
                className="absolute z-20 flex gap-3 items-end"
                style={{
                  bottom: isFullscreen ? `${videoDisplayInfo.containerHeight - (videoDisplayInfo.offsetY + videoDisplayInfo.displayHeight) + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  left: isFullscreen ? `${videoDisplayInfo.offsetX + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  right: isFullscreen ? `calc(100% - ${videoDisplayInfo.offsetX + videoDisplayInfo.displayWidth - (videoDisplayInfo.isLargeView ? 64 : 32)}px)` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  pointerEvents: 'auto',
                }}
              >
                {/* Query 1 Input */}
                <div className="flex-1 min-w-0">
                  <div 
                    className={`text-white uppercase tracking-wider mb-1 font-semibold ${videoDisplayInfo.isLargeView ? 'text-xs' : ''}`}
                    style={{
                      fontSize: videoDisplayInfo.isLargeView ? undefined : '10px',
                      paddingLeft: videoDisplayInfo.isLargeView ? '32px' : '16px',
                      opacity: 0.25,
                    }}
                  >
                    Prompt
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={query1}
                      onChange={(e) => setQuery1(e.target.value)}
                      className={`w-full text-white shadow-lg leading-snug outline-none focus:outline-none placeholder:text-white placeholder:opacity-50 ${videoDisplayInfo.isLargeView ? 'text-2xl' : 'text-xs'}`}
                      style={{
                        padding: videoDisplayInfo.isLargeView ? '24px 32px' : '12px 16px',
                        paddingRight: videoDisplayInfo.isLargeView ? '88px' : '52px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderRadius: '9999px',
                      }}
                      placeholder="Enter query..."
                    />
                    <button
                      onClick={stopWebcam}
                      className="absolute flex items-center justify-center bg-white hover:bg-white/90 transition-colors shadow-lg"
                      style={{
                        top: '50%',
                        right: videoDisplayInfo.isLargeView ? '16px' : '8px',
                        transform: 'translateY(-50%)',
                        width: videoDisplayInfo.isLargeView ? '48px' : '32px',
                        height: videoDisplayInfo.isLargeView ? '48px' : '32px',
                        borderRadius: '50%',
                      }}
                    >
                      <Square className="text-black fill-black" style={{ width: videoDisplayInfo.isLargeView ? '20px' : '14px', height: videoDisplayInfo.isLargeView ? '20px' : '14px' }} />
                    </button>
                  </div>
                </div>

                {/* Trigger Selector */}
                <div className="flex-shrink-0 min-w-0" style={{ flexBasis: videoDisplayInfo.isLargeView ? '400px' : '180px', maxWidth: videoDisplayInfo.isLargeView ? '400px' : '180px' }}>
                  <div 
                    className={`text-white uppercase tracking-wider mb-1 font-semibold ${videoDisplayInfo.isLargeView ? 'text-xs' : ''}`}
                    style={{
                      fontSize: videoDisplayInfo.isLargeView ? undefined : '10px',
                      paddingLeft: videoDisplayInfo.isLargeView ? '32px' : '16px',
                      opacity: 0.25,
                    }}
                  >
                    action to detect
                  </div>
                  <Select value={selectedTriggerId} onValueChange={handleTriggerChange}>
                    <SelectTrigger 
                      className={`w-full text-white shadow-lg leading-snug border-none outline-none focus:outline-none focus:ring-0 truncate white-caret ${videoDisplayInfo.isLargeView ? 'text-2xl' : 'text-xs'}`}
                      style={{
                        padding: videoDisplayInfo.isLargeView ? '24px 32px' : '12px 16px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderRadius: '9999px',
                        height: 'auto',
                      }}
                    >
                      <SelectValue placeholder="Select trigger" className="truncate" />
                    </SelectTrigger>
                    <SelectContent 
                      className="text-white shadow-2xl"
                      align="end"
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderRadius: '24px',
                        padding: '8px',
                      }}
                    >
                      {PRE_DEFINED_TRIGGERS.map((trigger) => (
                        <SelectItem key={trigger.id} value={trigger.id} className="text-white focus:bg-white/20 focus:text-white rounded-xl mb-1 last:mb-0">
                          {trigger.name}
                        </SelectItem>
                      ))}
                      {customTriggers.map((trigger) => (
                        <SelectItem key={trigger.id} value={trigger.id} className="text-white focus:bg-white/20 focus:text-white rounded-xl mb-1 last:mb-0">
                          {trigger.name} (Custom)
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className="text-white focus:bg-white/20 focus:text-white rounded-xl mb-1 last:mb-0">+ Create Custom Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              )}

              {/* Query 2 Result Overlay - Stacked Feed */}
              {isStreaming && (
              <div 
                className="absolute"
                style={{
                  left: isFullscreen ? `${videoDisplayInfo.offsetX + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  right: isFullscreen ? `calc(100% - ${videoDisplayInfo.offsetX + videoDisplayInfo.displayWidth - (videoDisplayInfo.isLargeView ? 64 : 32)}px)` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  // Position above input: base bottom position + label height + input padding*2 + font size + gap
                  bottom: isFullscreen 
                    ? `${videoDisplayInfo.containerHeight - (videoDisplayInfo.offsetY + videoDisplayInfo.displayHeight) + (videoDisplayInfo.isLargeView ? 64 : 32) + (videoDisplayInfo.isLargeView ? 16 : 14) + (videoDisplayInfo.isLargeView ? 48 : 24) + (videoDisplayInfo.isLargeView ? 31 : 14) + (videoDisplayInfo.isLargeView ? 48 : 32)}px` 
                    : `${(videoDisplayInfo.isLargeView ? 32 : 16) + (videoDisplayInfo.isLargeView ? 16 : 14) + (videoDisplayInfo.isLargeView ? 48 : 24) + (videoDisplayInfo.isLargeView ? 31 : 14) + (videoDisplayInfo.isLargeView ? 48 : 32)}px`,
                  maxWidth: videoDisplayInfo.isLargeView ? '800px' : undefined,
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  gap: videoDisplayInfo.isLargeView ? '16px' : '8px',
                  pointerEvents: 'none',
                }}
              >
                {resultHistory.map((result, index) => {
                  const opacityLevels = [1.0, 0.5, 0.25];
                  return (
                  <div
                    key={result.id}
                    className={`text-white shadow-lg leading-snug ${videoDisplayInfo.isLargeView ? 'text-2xl' : 'text-xs'}`}
                    style={{
                      padding: videoDisplayInfo.isLargeView ? '24px 32px' : '12px 16px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      background: result.isNotification ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      opacity: opacityLevels[index] || 0.25,
                      animation: index === 0 ? 'slideUp 0.3s ease-out' : 'none',
                      transition: 'opacity 0.3s ease-out',
                      borderRadius: videoDisplayInfo.isLargeView ? '24px' : '16px',
                    }}
                  >
                    {result.text}
                  </div>
                  );
                })}
              </div>
              )}
              
              {/* Keyframe animation for slide up */}
              <style jsx>{`
                @keyframes slideUp {
                  from {
                    transform: translateY(20px);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }
              `}</style>

              {/* Moondream Logo - Top Left with Live Indicator */}
              {isStreaming && (
              <div 
                className="absolute z-20 flex items-center opacity-90"
                style={{
                  top: isFullscreen ? `${videoDisplayInfo.offsetY + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  left: isFullscreen ? `${videoDisplayInfo.offsetX + (videoDisplayInfo.isLargeView ? 64 : 32)}px` : (videoDisplayInfo.isLargeView ? '32px' : '16px'),
                  gap: videoDisplayInfo.isLargeView ? '16px' : '8px',
                }}
              >
                <div style={{ width: videoDisplayInfo.isLargeView ? '48px' : '32px', height: videoDisplayInfo.isLargeView ? '48px' : '32px' }}>
                  <Image
                    src="/md_logo.svg"
                    alt="Moondream"
                    width={48}
                    height={48}
                    className="w-full h-full"
                  />
                </div>
                <span 
                  className={`text-white font-semibold tracking-tight ${videoDisplayInfo.isLargeView ? 'text-2xl' : 'text-base'}`}
                  style={{
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  Moondream
                </span>
                
                {/* Live Indicator */}
                <div 
                  className="flex items-center bg-red-500 rounded-md px-2 py-1" 
                  style={{ 
                    gap: '4px', 
                    marginLeft: '4px'
                  }}
                >
                  <div 
                    className="bg-white rounded-full animate-pulse" 
                    style={{
                      width: '6px',
                      height: '6px',
                    }}
                  />
                  <span 
                    className="text-white font-bold uppercase tracking-wide text-xs"
                    style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    Live
                  </span>
                </div>
              </div>
              )}

              </div>
            </div>

            {/* Controls Column - Hidden in Fullscreen */}
            {!isFullscreen && (
            <div className="w-full space-y-4">
              {/* Query Controls */}
              <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Query 1: a live visual summary</label>
                <input
                  type="text"
                  value={query1}
                  onChange={(e) => setQuery1(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm placeholder:opacity-50"
                  placeholder="Enter first query..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Detection trigger</label>
                <Select value={selectedTriggerId} onValueChange={handleTriggerChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent 
                    className="shadow-2xl"
                    style={{
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      borderRadius: '12px',
                      padding: '8px',
                    }}
                  >
                    {PRE_DEFINED_TRIGGERS.map((trigger) => (
                      <SelectItem key={trigger.id} value={trigger.id} className="rounded-xl mb-1 last:mb-0">
                        {trigger.name}
                      </SelectItem>
                    ))}
                    {customTriggers.map((trigger) => (
                      <SelectItem key={trigger.id} value={trigger.id} className="rounded-xl mb-1 last:mb-0">
                        {trigger.name} (Custom)
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="rounded-xl mb-1 last:mb-0">+ Create Custom Trigger</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select what gesture or action to detect
                </p>
              </div>
            </div>

            {/* Controls */}
            {isStreaming && (
            <div className="flex gap-4">
              <Button onClick={stopWebcam} variant="destructive" className="flex-1">
                Stop
              </Button>
            </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Trigger Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="border-white/20 text-white rounded-3xl" style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Create custom trigger</DialogTitle>
            <DialogDescription className="text-white/70">
              Define a custom gesture or action to detect in the video stream.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="trigger-name" className="text-white/90 text-sm font-semibold">Trigger name</Label>
              <Input
                id="trigger-name"
                value={customTriggerForm.name}
                onChange={(e) => setCustomTriggerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Waving hand"
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="trigger-query" className="text-white/90 text-sm font-semibold">Detection query</Label>
              <Input
                id="trigger-query"
                value={customTriggerForm.query}
                onChange={(e) => setCustomTriggerForm(prev => ({ ...prev, query: e.target.value }))}
                placeholder="e.g., is anyone waving? yes or no"
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
              <p className="text-xs text-white/50 mt-2">
                The question to ask about each frame
              </p>
            </div>
            <div>
              <Label htmlFor="trigger-text" className="text-white/90 text-sm font-semibold">Trigger text</Label>
              <Input
                id="trigger-text"
                value={customTriggerForm.triggerText}
                onChange={(e) => setCustomTriggerForm(prev => ({ ...prev, triggerText: e.target.value }))}
                placeholder="e.g., yes"
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
              <p className="text-xs text-white/50 mt-2">
                Text to look for in the response (case-insensitive)
              </p>
            </div>
            <div>
              <Label htmlFor="notification-text" className="text-white/90 text-sm font-semibold">Notification text</Label>
              <Input
                id="notification-text"
                value={customTriggerForm.notificationText}
                onChange={(e) => setCustomTriggerForm(prev => ({ ...prev, notificationText: e.target.value }))}
                placeholder="e.g., 👋 Wave Detected!"
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
              <p className="text-xs text-white/50 mt-2">
                Message to display when the trigger is detected
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCustomModalOpen(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCustomTrigger}
              className="bg-white text-black hover:bg-white/90 rounded-xl"
            >
              Create trigger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

