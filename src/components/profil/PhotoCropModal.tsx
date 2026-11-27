import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, Move, Upload } from 'lucide-react';

interface PhotoCropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
  onChooseAnotherFile?: () => void;
}

const CROP_SIZE = 260;
const OUTPUT_SIZE = 400;
const MAX_FIRESTORE_PHOTO_BYTES = 185000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.5;

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  imageSrc,
  onCancel,
  onConfirm,
  onChooseAnotherFile
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cropError, setCropError] = useState('');

  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const syncNaturalSizeFromImg = useCallback(() => {
    const img = imgRef.current;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalSize(prev =>
        prev && prev.w === img.naturalWidth && prev.h === img.naturalHeight
          ? prev
          : { w: img.naturalWidth, h: img.naturalHeight }
      );
      setCropError('');
      return { w: img.naturalWidth, h: img.naturalHeight };
    }
    return null;
  }, []);

  // Reset controls on imageSrc change, and read dimensions immediately if image is already cached/complete
  useLayoutEffect(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setCropError('');
    setIsExporting(false);

    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    } else {
      setNaturalSize(null);
    }
  }, [imageSrc]);

  const getScaleAndBounds = useCallback(
    (z: number, rot: number, nat: { w: number; h: number } | null) => {
      if (!nat || nat.w <= 0 || nat.h <= 0) {
        return {
          totalScale: 1,
          maxOffsetX: CROP_SIZE * 0.45,
          maxOffsetY: CROP_SIZE * 0.45
        };
      }
      const isSwapped = rot % 180 !== 0;
      const effW = isSwapped ? nat.h : nat.w;
      const effH = isSwapped ? nat.w : nat.h;
      const baseScale = Math.max(CROP_SIZE / effW, CROP_SIZE / effH);
      const totalScale = baseScale * z;
      const dispW = effW * totalScale;
      const dispH = effH * totalScale;

      // Always allow comfortable dragging even on 1:1 square images at 1.0x or zoomed-out logos
      const panBuffer = CROP_SIZE * 0.35;
      const maxOffsetX = Math.max(panBuffer, Math.abs(dispW - CROP_SIZE) / 2 + (dispW <= CROP_SIZE ? panBuffer : 0));
      const maxOffsetY = Math.max(panBuffer, Math.abs(dispH - CROP_SIZE) / 2 + (dispH <= CROP_SIZE ? panBuffer : 0));

      return { totalScale, maxOffsetX, maxOffsetY };
    },
    []
  );

  const effectiveNaturalSize =
    naturalSize ||
    (imgRef.current && imgRef.current.naturalWidth > 0
      ? { w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight }
      : null);

  const { totalScale, maxOffsetX, maxOffsetY } = getScaleAndBounds(
    zoom,
    rotation,
    effectiveNaturalSize
  );

  const updateZoom = useCallback(
    (nextZoom: number) => {
      const nat = effectiveNaturalSize || syncNaturalSizeFromImg();
      const clampedZoom = clamp(Number(nextZoom.toFixed(2)), MIN_ZOOM, MAX_ZOOM);
      const bounds = getScaleAndBounds(clampedZoom, rotation, nat);
      setZoom(clampedZoom);
      setOffset(prev => ({
        x: clamp(prev.x, -bounds.maxOffsetX, bounds.maxOffsetX),
        y: clamp(prev.y, -bounds.maxOffsetY, bounds.maxOffsetY)
      }));
    },
    [effectiveNaturalSize, getScaleAndBounds, rotation, syncNaturalSizeFromImg]
  );

  // Attach non-passive wheel zoom on the crop stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY < 0 ? 0.12 : -0.12;
      setZoom(prevZoom => {
        const nextZoom = clamp(Number((prevZoom + step).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
        const bounds = getScaleAndBounds(nextZoom, rotation, effectiveNaturalSize);
        setOffset(prevOffset => ({
          x: clamp(prevOffset.x, -bounds.maxOffsetX, bounds.maxOffsetX),
          y: clamp(prevOffset.y, -bounds.maxOffsetY, bounds.maxOffsetY)
        }));
        return nextZoom;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [effectiveNaturalSize, getScaleAndBounds, rotation]);

  // Global pointer move & up listeners so dragging stays responsive across iframes/viewports
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.pointerX;
      const dy = e.clientY - dragStartRef.current.pointerY;
      setOffset({
        x: clamp(dragStartRef.current.startOffsetX + dx, -maxOffsetX, maxOffsetX),
        y: clamp(dragStartRef.current.startOffsetY + dy, -maxOffsetY, maxOffsetY)
      });
    };

    const handleWindowPointerUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [isDragging, maxOffsetX, maxOffsetY]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    syncNaturalSizeFromImg();
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y
    };
  };

  const handleRotate = () => {
    const nat = effectiveNaturalSize || syncNaturalSizeFromImg();
    const nextRot = (rotation + 90) % 360;
    const bounds = getScaleAndBounds(zoom, nextRot, nat);
    setRotation(nextRot);
    setOffset(prev => ({
      x: clamp(prev.x, -bounds.maxOffsetX, bounds.maxOffsetX),
      y: clamp(prev.y, -bounds.maxOffsetY, bounds.maxOffsetY)
    }));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirmCrop = () => {
    const img = imgRef.current;
    const nat = effectiveNaturalSize || syncNaturalSizeFromImg();
    if (!img || !nat) {
      setCropError('Gambar belum siap diproses. Tunggu sebentar atau pilih file lain.');
      return;
    }

    setIsExporting(true);
    setCropError('');

    try {
      const { totalScale: activeScale } = getScaleAndBounds(zoom, rotation, nat);

      const renderAtSize = (size: number, quality: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        const outRatio = size / CROP_SIZE;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(size / 2 + offset.x * outRatio, size / 2 + offset.y * outRatio);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(activeScale * outRatio, activeScale * outRatio);
        ctx.drawImage(img, -nat.w / 2, -nat.h / 2, nat.w, nat.h);
        ctx.restore();

        return canvas.toDataURL('image/jpeg', quality);
      };

      let resultUrl = renderAtSize(OUTPUT_SIZE, 0.88);
      if (resultUrl.length > MAX_FIRESTORE_PHOTO_BYTES) {
        resultUrl = renderAtSize(OUTPUT_SIZE, 0.72);
      }
      if (resultUrl.length > MAX_FIRESTORE_PHOTO_BYTES) {
        resultUrl = renderAtSize(320, 0.68);
      }

      if (!resultUrl) {
        setCropError('Gagal memproses hasil crop gambar. Silakan coba lagi.');
        setIsExporting(false);
        return;
      }

      onConfirm(resultUrl);
    } catch {
      setCropError('Terjadi kendala saat menyimpan hasil crop. Coba gunakan gambar JPG/PNG lain.');
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs select-none"
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md max-h-[94vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Sesuaikan &amp; Crop Foto Profil</h3>
            <p className="text-[11px] text-slate-500">
              Seret foto &amp; atur zoom sebelum klik OK untuk menyimpan.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
            aria-label="Tutup modal crop"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Viewport */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center gap-2.5 shrink-0">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            className={`relative overflow-hidden rounded-2xl bg-white select-none touch-none border border-slate-700 shadow-inner ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Preview Crop Foto Profil"
              draggable={false}
              onLoad={syncNaturalSizeFromImg}
              onError={() => setCropError('Gambar tidak dapat dimuat. Silakan pilih file gambar lain.')}
              style={{
                width: effectiveNaturalSize ? effectiveNaturalSize.w : '100%',
                height: effectiveNaturalSize ? effectiveNaturalSize.h : '100%',
                maxWidth: 'none',
                maxHeight: 'none',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${totalScale})`,
                transformOrigin: 'center center',
                pointerEvents: 'none'
              }}
            />

            {/* Circular Avatar Mask Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="w-full h-full rounded-full border-2 border-white/95"
                style={{ boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.58)' }}
              />
            </div>

            {/* Subtle Crosshair Guide */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium select-none">
            <Move className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Seret / geser foto langsung di area lingkaran di atas</span>
          </div>
        </div>

        {/* Zoom & Rotate Controls */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 space-y-2.5">
          {cropError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
              {cropError}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateZoom(zoom - 0.15)}
              disabled={zoom <= MIN_ZOOM}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={e => updateZoom(parseFloat(e.target.value))}
              aria-label="Zoom foto profil"
              className="flex-1 accent-blue-700 cursor-pointer"
            />

            <button
              type="button"
              onClick={() => updateZoom(zoom + 0.15)}
              disabled={zoom >= MAX_ZOOM}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono font-bold text-slate-700 w-11 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar 90°</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {onChooseAnotherFile && (
              <button
                type="button"
                onClick={onChooseAnotherFile}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto Lain</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={!effectiveNaturalSize || isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isExporting ? 'Menyimpan...' : 'OK & Simpan Foto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
