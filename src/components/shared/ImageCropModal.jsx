"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

/**
 * ImageCropModal
 * Canvas-based image cropper for 16:9 aspect ratio (Discord banner style)
 * 
 * Props:
 * - imageUrl: string - URL of image to crop
 * - imageFile?: File - Original file (optional, for uploading)
 * - onSave: (cropData: { x, y, width, height }, croppedCanvas: Canvas) => void
 * - onCancel: () => void
 * - isLoading: boolean
 */
export default function ImageCropModal({
    imageUrl,
    imageFile,
    onSave,
    onCancel,
    isLoading = false,
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Load image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            setImage(img);
            // Center the image initially
            setZoom(1);
            setOffsetX(0);
            setOffsetY(0);
        };
        img.onerror = () => console.error("Failed to load image");
    }, [imageUrl]);

    // Draw canvas
    useEffect(() => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const containerWidth = containerRef.current?.offsetWidth || 800;
        const containerHeight = 450; // 16:9 ratio @ 800px width

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        // Fill background
        ctx.fillStyle = "#0d0d12";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate image dimensions and position
        const scale = zoom;
        const imgWidth = image.width * scale;
        const imgHeight = image.height * scale;

        // Draw image
        ctx.save();
        ctx.drawImage(image, offsetX, offsetY, imgWidth, imgHeight);
        ctx.restore();

        // Draw 16:9 aspect ratio guide overlay
        const guideWidth = containerWidth * 0.9;
        const guideHeight = (guideWidth / 16) * 9;
        const guideX = (containerWidth - guideWidth) / 2;
        const guideY = (containerHeight - guideHeight) / 2;

        // Darken outer area
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, guideX, containerHeight); // Left
        ctx.fillRect(guideX + guideWidth, 0, guideX, containerHeight); // Right
        ctx.fillRect(0, 0, containerWidth, guideY); // Top
        ctx.fillRect(0, guideY + guideHeight, containerWidth, guideY); // Bottom

        // Draw guide border
        ctx.strokeStyle = "rgba(0, 211, 187, 0.5)";
        ctx.lineWidth = 2;
        ctx.rect(guideX, guideY, guideWidth, guideHeight);
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = "rgba(0, 211, 187, 0.2)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(guideX + (guideWidth / 3) * i, guideY);
            ctx.lineTo(guideX + (guideWidth / 3) * i, guideY + guideHeight);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(guideX, guideY + (guideHeight / 3) * i);
            ctx.lineTo(guideX + guideWidth, guideY + (guideHeight / 3) * i);
            ctx.stroke();
        }
    }, [image, zoom, offsetX, offsetY]);

    // Mouse handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setOffsetX(offsetX + deltaX);
        setOffsetY(offsetY + deltaY);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(Math.max(0.5, Math.min(3, zoom * delta)));
    };

    const handleSave = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const containerWidth = containerRef.current?.offsetWidth || 800;
        const containerHeight = 450;

        // Calculate crop region (16:9 area)
        const guideWidth = containerWidth * 0.9;
        const guideHeight = (guideWidth / 16) * 9;
        const guideX = (containerWidth - guideWidth) / 2;
        const guideY = (containerHeight - guideHeight) / 2;

        // Create cropped canvas
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = Math.round(guideWidth);
        croppedCanvas.height = Math.round(guideHeight);

        const ctx = croppedCanvas.getContext("2d");
        ctx.drawImage(
            canvas,
            guideX,
            guideY,
            guideWidth,
            guideHeight,
            0,
            0,
            guideWidth,
            guideHeight
        );

        // Calculate crop data relative to original image
        const scale = zoom;
        const imgWidth = image.width * scale;
        const imgHeight = image.height * scale;

        const cropData = {
            x: Math.max(0, Math.round((-offsetX) / scale)),
            y: Math.max(0, Math.round((-offsetY) / scale)),
            width: Math.round(Math.min(image.width, guideWidth / scale)),
            height: Math.round(Math.min(image.height, guideHeight / scale)),
        };

        onSave(cropData, croppedCanvas);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl rounded-3xl glass-card border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-2xl overflow-hidden animate-in scale-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div>
                        <h2 className="font-display font-bold text-ivory text-lg">
                            Crop Banner
                        </h2>
                        <p className="text-xs text-ivory/40 font-mono">16:9 Aspect Ratio</p>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-ivory/40 hover:text-ivory/60 hover:bg-white/[0.06] transition-all disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Canvas area */}
                <div className="flex-1 overflow-hidden bg-obsidian">
                    <div
                        ref={containerRef}
                        className="w-full h-full relative cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                    >
                        <canvas
                            ref={canvasRef}
                            className="block w-full h-full"
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="px-6 py-4 space-y-4 border-t border-white/[0.06] bg-white/[0.02]">
                    {/* Zoom controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                            disabled={isLoading || zoom <= 0.5}
                            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-ivory/60 hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ZoomOut size={16} />
                        </button>

                        <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-center text-sm font-mono text-ivory/60">
                            {Math.round(zoom * 100)}%
                        </div>

                        <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            disabled={isLoading || zoom >= 3}
                            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-ivory/60 hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ZoomIn size={16} />
                        </button>

                        <button
                            onClick={() => {
                                setZoom(1);
                                setOffsetX(0);
                                setOffsetY(0);
                            }}
                            disabled={isLoading}
                            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-ivory/60 hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reset"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-ivory text-sm font-mono font-semibold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 hover:from-accent/30 hover:to-accent/20 hover:border-accent/50 text-accent text-sm font-mono font-semibold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Saving..." : "Save & Upload"}
                        </button>
                    </div>

                    {/* Info text */}
                    <p className="text-xs text-ivory/40 text-center">
                        Drag to move • Scroll to zoom • Aspect ratio is locked to 16:9
                    </p>
                </div>
            </div>
        </div>
    );
}
