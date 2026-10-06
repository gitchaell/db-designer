"use client";

import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const DEFAULT_COLOR_SWATCHES = [
	"#71717a", // Zinc
	"#3b82f6", // Blue
	"#10b981", // Emerald
	"#f59e0b", // Amber
	"#ef4444", // Red
	"#8b5cf6", // Purple
	"#ec4899", // Pink
	"#06b6d4", // Cyan
];

interface ColorPickerProps {
	value: string;
	onChange: (color: string) => void;
	swatches?: string[];
	size?: "sm" | "md";
	className?: string;
	showCustomInput?: boolean;
	variant?: "popover" | "inline";
}

export function ColorPicker({
	value,
	onChange,
	swatches = DEFAULT_COLOR_SWATCHES,
	size = "sm",
	className,
	showCustomInput = true,
	variant = "popover",
}: ColorPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

	const currentColor = value || "#71717a";

	const updatePosition = () => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		// Position popover below trigger, aligned to the right
		setPopoverPos({
			top: rect.bottom + 6,
			left: Math.max(12, rect.right - 210), // 210px popover width
		});
	};

	const handleToggle = () => {
		if (!isOpen) {
			updatePosition();
		}
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		if (!isOpen) return;

		const handleScrollOrResize = () => updatePosition();
		const handleClickOutside = (e: MouseEvent) => {
			if (
				triggerRef.current?.contains(e.target as Node) ||
				(e.target as HTMLElement).closest(".color-picker-portal-dropdown")
			) {
				return;
			}
			setIsOpen(false);
		};

		window.addEventListener("scroll", handleScrollOrResize, true);
		window.addEventListener("resize", handleScrollOrResize);
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("scroll", handleScrollOrResize, true);
			window.removeEventListener("resize", handleScrollOrResize);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	if (variant === "inline") {
		const swatchSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
		const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

		return (
			<div className={clsx("flex items-center gap-1.5 flex-nowrap", className)}>
				<div className="flex items-center gap-1 flex-nowrap">
					{swatches.map((color) => {
						const isSelected = currentColor.toLowerCase() === color.toLowerCase();
						return (
							<button
								key={color}
								type="button"
								onClick={() => onChange(color)}
								style={{ backgroundColor: color }}
								className={clsx(
									swatchSize,
									"rounded-full border transition-all hover:scale-110 flex items-center justify-center cursor-pointer shadow-2xs shrink-0",
									isSelected
										? "border-foreground ring-1 ring-foreground/20 scale-110"
										: "border-black/10 dark:border-white/10 opacity-80 hover:opacity-100",
								)}
								title={color}
							>
								{isSelected && (
									<Check className={clsx(iconSize, "text-white drop-shadow-xs")} />
								)}
							</button>
						);
					})}
				</div>

				{showCustomInput && (
					<div className="relative flex items-center shrink-0">
						<input
							type="color"
							value={currentColor}
							onChange={(e) => onChange(e.target.value)}
							className={clsx(
								swatchSize,
								"p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden shadow-2xs transition-transform hover:scale-110 shrink-0",
							)}
							title="Choose Custom Color"
						/>
					</div>
				)}
			</div>
		);
	}

	// Default "popover" variant for clean compact layout inside settings rows
	return (
		<div className={clsx("relative inline-block", className)}>
			<button
				ref={triggerRef}
				type="button"
				onClick={handleToggle}
				className="flex items-center gap-2 h-7 px-2.5 rounded-lg border border-border/80 bg-background hover:bg-muted/60 transition-all cursor-pointer shadow-2xs group"
			>
				<span
					className="w-4 h-4 rounded-full border border-black/15 dark:border-white/20 shadow-2xs shrink-0 transition-transform group-hover:scale-105"
					style={{ backgroundColor: currentColor }}
				/>
				<span className="text-xs font-mono text-muted-foreground uppercase group-hover:text-foreground">
					{currentColor}
				</span>
				<ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-transform duration-150" />
			</button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						style={{ top: popoverPos.top, left: popoverPos.left }}
						className="color-picker-portal-dropdown fixed z-[9999] w-[210px] p-2.5 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
					>
						<div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
							Paleta de Colores
						</div>
						<div className="grid grid-cols-4 gap-1.5 mb-2.5">
							{swatches.map((color) => {
								const isSelected = currentColor.toLowerCase() === color.toLowerCase();
								return (
									<button
										key={color}
										type="button"
										onClick={() => {
											onChange(color);
											setIsOpen(false);
										}}
										style={{ backgroundColor: color }}
										className={clsx(
											"h-7 rounded-md border flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-2xs",
											isSelected
												? "border-foreground ring-2 ring-primary/40 scale-105"
												: "border-black/10 dark:border-white/10 opacity-85 hover:opacity-100",
										)}
										title={color}
									>
										{isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
									</button>
								);
							})}
						</div>

						{showCustomInput && (
							<div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
								<span className="text-xs text-muted-foreground font-medium">Color Personalizado</span>
								<div className="flex items-center gap-1.5">
									<input
										type="color"
										value={currentColor}
										onChange={(e) => onChange(e.target.value)}
										className="w-6 h-6 p-0 border-0 rounded-md cursor-pointer bg-transparent overflow-hidden shadow-2xs"
									/>
									<span className="text-[11px] font-mono text-foreground font-semibold uppercase">
										{currentColor}
									</span>
								</div>
							</div>
						)}
					</div>,
					document.body,
				)}
		</div>
	);
}
