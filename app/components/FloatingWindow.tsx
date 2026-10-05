"use client";

import { GripHorizontal, Minus, Square, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface FloatingWindowProps {
	isOpen: boolean;
	onClose: () => void;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	icon?: React.ReactNode;
	children: React.ReactNode;
	defaultPosition?: { x: number; y: number };
	className?: string;
}

export function FloatingWindow({
	isOpen,
	onClose,
	title,
	subtitle,
	icon,
	children,
	defaultPosition = { x: 120, y: 70 },
	className = "w-[660px]",
}: FloatingWindowProps) {
	const [position, setPosition] = useState(defaultPosition);
	const [isMinimized, setIsMinimized] = useState(false);
	const isDraggingRef = useRef(false);
	const dragStartRef = useRef({ x: 0, y: 0 });

	const handlePointerDown = (e: React.PointerEvent) => {
		if ((e.target as HTMLElement).closest("button, input, select, label, a"))
			return;
		isDraggingRef.current = true;
		dragStartRef.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDraggingRef.current) return;
		setPosition({
			x: Math.max(
				10,
				Math.min(window.innerWidth - 120, e.clientX - dragStartRef.current.x),
			),
			y: Math.max(
				10,
				Math.min(window.innerHeight - 60, e.clientY - dragStartRef.current.y),
			),
		});
	};

	const handlePointerUp = (e: React.PointerEvent) => {
		if (isDraggingRef.current) {
			isDraggingRef.current = false;
			try {
				(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
			} catch {}
		}
	};

	if (!isOpen || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 pointer-events-none z-[9990] font-sans">
			<div
				style={{ left: `${position.x}px`, top: `${position.y}px` }}
				className={`absolute pointer-events-auto bg-popover/95 backdrop-blur-md border border-border text-popover-foreground rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-100 ${className}`}
			>
				{/* Draggable Header */}
				<div
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					className="flex items-center justify-between px-4 py-3 border-b border-border select-none cursor-grab active:cursor-grabbing bg-muted/40 rounded-t-2xl"
				>
					<div className="flex items-center gap-2.5 min-w-0">
						<GripHorizontal className="w-4 h-4 text-muted-foreground/60 flex-none" />
						{icon && <div className="text-primary flex-none">{icon}</div>}
						<div className="flex flex-col min-w-0">
							<div className="text-sm font-bold text-foreground font-display truncate">
								{title}
							</div>
							{subtitle && (
								<div className="text-[11px] text-muted-foreground truncate">
									{subtitle}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-1 flex-none ml-2">
						<button
							type="button"
							onClick={() => setIsMinimized(!isMinimized)}
							className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
							title={isMinimized ? "Expand" : "Minimize"}
						>
							{isMinimized ? (
								<Square className="w-3.5 h-3.5" />
							) : (
								<Minus className="w-3.5 h-3.5" />
							)}
						</button>
						<button
							type="button"
							onClick={onClose}
							className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
							title="Close"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Body Content */}
				{!isMinimized && (
					<div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
						{children}
					</div>
				)}
			</div>
		</div>,
		document.body,
	);
}
