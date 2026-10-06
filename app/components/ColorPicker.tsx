"use client";

import { clsx } from "clsx";
import { Check } from "lucide-react";

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
}

export function ColorPicker({
	value,
	onChange,
	swatches = DEFAULT_COLOR_SWATCHES,
	size = "sm",
	className,
	showCustomInput = true,
}: ColorPickerProps) {
	const swatchSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
	const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

	return (
		<div className={clsx("flex items-center gap-1.5", className)}>
			<div className="flex items-center gap-1 flex-wrap">
				{swatches.map((color) => {
					const isSelected = value?.toLowerCase() === color.toLowerCase();
					return (
						<button
							key={color}
							type="button"
							onClick={() => onChange(color)}
							style={{ backgroundColor: color }}
							className={clsx(
								swatchSize,
								"rounded-full border transition-all hover:scale-110 flex items-center justify-center cursor-pointer shadow-2xs",
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
						value={value || "#71717a"}
						onChange={(e) => onChange(e.target.value)}
						className={clsx(
							swatchSize,
							"p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden shadow-2xs transition-transform hover:scale-110",
						)}
						title="Choose Custom Color"
					/>
				</div>
			)}
		</div>
	);
}
