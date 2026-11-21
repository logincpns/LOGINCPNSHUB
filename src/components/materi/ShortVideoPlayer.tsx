import React, { useEffect, useState } from 'react';
import { Film, Play, AlertCircle, BookOpen } from 'lucide-react';
import { ShortVideo, ShortVideoCategory } from '../../types';
import { getVideoBlob, parseEmbedVideoUrl } from '../../utils/videoStorage';

export function getShortVideoCategoryLabel(cat: ShortVideoCategory): string {
  switch (cat) {
    case 'KIAT_BELAJAR':
      return 'Kiat Belajar';
    case 'TIU':
      return 'TIU / Matematika';
    case 'TWK':
      return 'Materi TWK';
    case 'TKP':
      return 'Materi TKP';
    case 'STRATEGI':
      return 'Strategi Ujian';
  }
}

export function getShortVideoAccentClasses(cat: ShortVideoCategory): {
  surface: string;
  badge: string;
} {
  switch (cat) {
    case 'KIAT_BELAJAR':
      return {
        surface: 'from-sky-900 via-blue-900 to-slate-950',
        badge: 'bg-sky-50 text-sky-800 border-sky-200'
      };
    case 'TIU':
      return {
        surface: 'from-emerald-900 via-teal-900 to-slate-950',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    case 'TWK':
      return {
        surface: 'from-blue-900 via-indigo-950 to-slate-950',
        badge: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    case 'TKP':
      return {
        surface: 'from-amber-900 via-stone-900 to-slate-950',
        badge: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    case 'STRATEGI':
      return {
        surface: 'from-indigo-900 via-slate-900 to-slate-950',
        badge: 'bg-indigo-50 text-indigo-800 border-indigo-200'
      };
  }
}

interface ShortVideoThumbnailProps {
  video: ShortVideo;
  isLocked?: boolean;
}

export const ShortVideoThumbnail: React.FC<ShortVideoThumbnailProps> = ({
  video,
  isLocked = false
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const accent = getShortVideoAccentClasses(video.category);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (video.source_type === 'UPLOAD' && video.video_blob_id) {
      getVideoBlob(video.video_blob_id).then(blob => {
        if (!active || !blob) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      });
    } else {
      setBlobUrl(null);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [video.source_type, video.video_blob_id]);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${accent.surface} select-none`}
    >
      {blobUrl ? (
        <video
          src={`${blobUrl}#t=0.5`}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-200"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-white/80">
            <span className="truncate">{video.topic || getShortVideoCategoryLabel(video.category)}</span>
            {video.duration_label && (
              <span className="font-mono tabular-nums shrink-0">{video.duration_label}</span>
            )}
          </div>
          <div className="my-auto pr-4">
            <p className="text-sm font-bold leading-snug text-white line-clamp-2">
              {video.title}
            </p>
          </div>
          <div className="text-[11px] text-white/70 truncate">
            {video.video_url?.trim() ? 'Video Pembahasan Eksternal' : 'Ringkasan Visual & Kiat'}
          </div>
        </div>
      )}

      {/* Measured scrim for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none" />

      {/* Play affordance */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-150 group-hover:scale-105 shadow-lg ${
            isLocked
              ? 'bg-amber-500/95 text-slate-950'
              : 'bg-white/95 text-blue-700'
          }`}
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom duration bar when real video blob is loaded */}
      {blobUrl && (
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white">
          <span className="truncate drop-shadow">Video Upload</span>
          {video.duration_label && (
            <span className="font-mono tabular-nums bg-slate-950/75 px-2 py-0.5 rounded">
              {video.duration_label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface ShortVideoPlayerProps {
  video: ShortVideo;
  autoPlay?: boolean;
  className?: string;
}

export const ShortVideoPlayer: React.FC<ShortVideoPlayerProps> = ({
  video,
  autoPlay = false,
  className = ''
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    setLoadError(null);
    if (video.source_type === 'UPLOAD' && video.video_blob_id) {
      setLoading(true);
      getVideoBlob(video.video_blob_id)
        .then(blob => {
          if (!active) return;
          if (!blob) {
            setLoadError('File video tidak ditemukan di penyimpanan browser perangkat ini.');
            setBlobUrl(null);
          } else {
            createdUrl = URL.createObjectURL(blob);
            setBlobUrl(createdUrl);
          }
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setLoadError('Gagal memuat file video.');
          setLoading(false);
        });
    } else {
      setBlobUrl(null);
      setLoading(false);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [video.id, video.source_type, video.video_blob_id]);

  if (loading) {
    return (
      <div
        className={`w-full aspect-video bg-slate-950 rounded-xl flex flex-col items-center justify-center text-slate-300 gap-2 ${className}`}
      >
        <Film className="w-7 h-7 text-sky-400 animate-pulse" />
        <span className="text-xs font-medium">Memuat video pembahasan...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`w-full aspect-video bg-slate-950 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-300 gap-2 ${className}`}
      >
        <AlertCircle className="w-7 h-7 text-amber-400" />
        <p className="text-xs font-semibold text-white">{loadError}</p>
        <p className="text-[11px] text-slate-400 max-w-sm">
          File video yang diupload langsung tersimpan di browser yang digunakan saat mengunggah. Silakan unggah ulang di Panel Super Admin jika berpindah perangkat.
        </p>
      </div>
    );
  }

  // 1. Uploaded file video from IndexedDB
  if (video.source_type === 'UPLOAD' && blobUrl) {
    return (
      <div className={`w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
        <video
          key={blobUrl}
          src={blobUrl}
          controls
          playsInline
          autoPlay={autoPlay}
          className="w-full max-h-[65vh] object-contain bg-slate-950"
        />
      </div>
    );
  }

  // 2. External URL (YouTube, Google Drive, or direct MP4)
  const parsed = parseEmbedVideoUrl(video.video_url);
  if (parsed.kind === 'IFRAME') {
    return (
      <div className={`w-full aspect-video bg-slate-950 rounded-xl overflow-hidden ${className}`}>
        <iframe
          src={parsed.src}
          title={video.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (parsed.kind === 'VIDEO') {
    return (
      <div className={`w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
        <video
          key={parsed.src}
          src={parsed.src}
          controls
          playsInline
          autoPlay={autoPlay}
          className="w-full max-h-[65vh] object-contain bg-slate-950"
        />
      </div>
    );
  }

  // 3. Clean structured visual slide card when starter seed / text-first short has no video file attached yet
  const accent = getShortVideoAccentClasses(video.category);
  return (
    <div
      className={`w-full rounded-xl bg-gradient-to-br ${accent.surface} p-6 sm:p-8 text-white flex flex-col justify-between min-h-[260px] ${className}`}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-sky-200 font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span>{video.topic || getShortVideoCategoryLabel(video.category)}</span>
        </span>
        {video.duration_label && (
          <span className="font-mono tabular-nums">{video.duration_label}</span>
        )}
      </div>

      <div className="my-6 space-y-2">
        <h3 className="text-lg sm:text-xl font-extrabold leading-snug text-white">
          {video.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
          {video.description}
        </p>
      </div>

      <div className="pt-3 border-t border-white/15 text-[11px] text-slate-300">
        Catatan: Super Admin dapat mengunggah video MP4/WebM atau menempelkan link video pada item ini melalui Panel Super Admin &rarr; Short Video.
      </div>
    </div>
  );
};

export const UploadedBlobVideo: React.FC<{ blobId: string; title?: string }> = ({ blobId, title }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;
    getVideoBlob(blobId).then(blob => {
      if (!active || !blob) return;
      createdUrl = URL.createObjectURL(blob);
      setBlobUrl(createdUrl);
    });
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [blobId]);

  if (!blobUrl) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-300">
        Memuat video pembahasan...
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 rounded-xl overflow-hidden">
      <video
        src={blobUrl}
        title={title}
        controls
        playsInline
        className="w-full max-h-[420px] object-contain"
      />
    </div>
  );
};

