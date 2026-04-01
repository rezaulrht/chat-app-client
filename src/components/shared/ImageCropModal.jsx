"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, RotateCcw, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";

/**
 * ImageCropModal
 * Banner cropper with 16:9 aspect ratio overlay
 * 
 * Features:
 * - Drag to position image
 * - Scroll or slider to zoom
 * - Keyboard navigation support
 * - Error handling for failed images
 * - App theme integration
 */
export default function ImageCropModal({
    imageUrl,
    onSave,
    onCancel,
    isLoading = false,
}) {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [image, setImage] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });

    // Load image with error handling
    useEffect(() => {
        setImageError(false);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        
        img.onload = () => {
            setImage(img);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        };
        
        img.onerror = () => {
            setImageError(true);
            console.error("Failed to load image for cropping");
        };
    }, [imageUrl]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLoading) return;
            
            const step = 10;
            switch (e.key) {
                case "ArrowUp":
                    e.preventDefault();
                    setPosition((p) => ({ ...p, y: p.y + step }));
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setPosition((p) => ({ ...p, y: p.y - step }));
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    setPosition((p) => ({ ...p, x: p.x + step }));
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    setPosition((p) => ({ ...p, x: p.x - step }));
                    break;
                case "+":
                case "=":
                    e.preventDefault();
                    setZoom((z) => Math.min(3, z + 0.2));
                    break;
                case "-":
                    e.preventDefault();
                    setZoom((z) => Math.max(0.5, z - 0.2));
                    break;
                case "Escape":
                    e.preventDefault();
                    onCancel();
                    break;
                case "Enter":
                    e.preventDefault();
                    if (!isLoading) handleSave();
                    break;
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoading, onCancel, handleSave]);

    // Measure container
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Calculate 16:9 crop dimensions
    const getCropDimensions = useCallback(() => {
        // Use default dimensions if container not measured yet
        const width = containerSize.width || 800;
        const height = containerSize.height || 500;
        
        const padding = 40;
        const availableWidth = width - padding * 2;
        const availableHeight = height - padding * 2;

        let cropWidth, cropHeight;
        
        if (availableWidth / availableHeight > 16 / 9) {
            cropHeight = availableHeight;
            cropWidth = cropHeight * (16 / 9);
        } else {
            cropWidth = availableWidth;
            cropHeight = cropWidth / (16 / 9);
        }

        return {
            width: cropWidth,
            height: cropHeight,
            x: (width - cropWidth) / 2,
            y: (height - cropHeight) / 2,
        };
    }, [containerSize]);

    // Mouse/Touch handlers
    const handlePointerDown = useCallback((e) => {
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    }, [position]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y,
        });
    }, [isDragging, dragStart]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
    }, []);

    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    // Save cropped image
    const handleSave = () => {
        if (!image) return;

        const crop = getCropDimensions();
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        // Create output canvas at 1920x1080
        const outputCanvas = document.createElement("canvas");
        const targetWidth = 1920;
        const targetHeight = 1080;
        outputCanvas.width = targetWidth;
        outputCanvas.height = targetHeight;
        const ctx = outputCanvas.getContext("2d");

        // Calculate image dimensions
        const imgWidth = (image.width || image.naturalWidth) * zoom;
        const imgHeight = (image.height || image.naturalHeight) * zoom;

        // Center of image in container space
        const imgCenterX = containerSize.width / 2 + position.x;
        const imgCenterY = containerSize.height / 2 + position.y;

        // Top-left of image in container space
        const imgLeft = imgCenterX - imgWidth / 2;
        const imgTop = imgCenterY - imgHeight / 2;

        // Crop area in container space
        const cropLeft = crop.x;
        const cropTop = crop.y;

        // Source rectangle in image natural coordinates
        const srcX = Math.max(0, (cropLeft - imgLeft) / zoom) * scaleX;
        const srcY = Math.max(0, (cropTop - imgTop) / zoom) * scaleY;
        const srcW = Math.min(image.naturalWidth - srcX, crop.width / zoom * scaleX);
        const srcH = Math.min(image.naturalHeight - srcY, crop.height / zoom * scaleY);

        // Draw the cropped portion
        ctx.drawImage(
            image,
            srcX, srcY, srcW, srcH,
            0, 0, targetWidth, targetHeight
        );

        const croppedDataUrl = outputCanvas.toDataURL("image/jpeg", 0.9);
        onSave(croppedDataUrl, outputCanvas);
    };

    // Loading or error state
    if (!image || imageError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-center p-6">
                    {imageError ? (
                        <>
                            <AlertCircle size={48} className="text-red-400" />
                            <p className="text-ivory text-lg font-medium">Failed to load image</p>
                            <p className="text-ivory/50 text-sm">Please try again or select a different image</p>
                            <button
                                onClick={onCancel}
                                className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                            <p className="text-ivory/50 text-sm">Loading image...</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const crop = getCropDimensions();

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchEnd={handlePointerUp}
        >
            {/* Modal container */}
            <div className="relative w-full max-w-4xl bg-obsidian rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-white font-semibold text-lg">
                            Crop Banner
                        </h2>
                        <p className="text-ivory/50 text-sm mt-0.5">
                            Drag to position, scroll to zoom. 16:9 ratio required.
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-ivory/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Canvas area */}
                <div 
                    ref={containerRef}
                    className="flex-1 relative overflow-hidden bg-deep cursor-grab active:cursor-grabbing min-h-[300px]"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onWheel={handleWheel}
                >
                    {/* Image */}
                    <div
                        className="absolute"
                        style={{
                            left: "50%",
                            top: "50%",
                            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                        }}
                    >
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Banner preview"
                            className="max-w-none select-none"
                            draggable={false}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                            }}
                        />
                    </div>

                    {/* Dark overlay outside crop area */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Top overlay */}
                        <div 
                            className="absolute left-0 right-0 bg-black/70"
                            style={{ top: 0, height: crop.y }}
                        />
                        {/* Bottom overlay */}
                        <div 
                            className="absolute left-0 right-0 bg-black/70"
                            style={{ top: crop.y + crop.height, bottom: 0 }}
                        />
                        {/* Left overlay */}
                        <div 
                            className="absolute top-0 bottom-0 bg-black/70"
                            style={{ left: 0, width: crop.x }}
                        />
                        {/* Right overlay */}
                        <div 
                            className="absolute top-0 bottom-0 bg-black/70"
                            style={{ left: crop.x + crop.width, right: 0 }}
                        />
                    </div>

                    {/* Crop guide border - accent colored */}
                    <div
                        className="absolute border-2 border-accent pointer-events-none shadow-lg shadow-accent/20"
                        style={{
                            left: crop.x,
                            top: crop.y,
                            width: crop.width,
                            height: crop.height,
                        }}
                    >
                        {/* Corner handles */}
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full shadow" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full shadow" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full shadow" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full shadow" />
                    </div>

                    {/* Rule of thirds grid */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            left: crop.x,
                            top: crop.y,
                            width: crop.width,
                            height: crop.height,
                        }}
                    >
                        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-accent/30" />
                        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-accent/30" />
                        <div className="absolute left-0 right-0 top-1/3 h-px bg-accent/30" />
                        <div className="absolute left-0 right-0 top-2/3 h-px bg-accent/30" />
                    </div>
                </div>

                {/* Controls */}
                <div className="border-t border-white/10 px-5 py-4">
                    {/* Zoom slider */}
                    <div className="flex items-center gap-3 mb-4">
                        <ZoomOut className="w-5 h-5 text-ivory/40 shrink-0" />
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent"
                        />
                        <ZoomIn className="w-5 h-5 text-ivory/40 shrink-0" />
                        <span className="text-ivory/50 text-sm w-12 text-right">{Math.round(zoom * 100)}%</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Apply Banner"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
