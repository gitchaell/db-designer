"use client";

import {
	Download,
	Eye,
	Grid,
	Grid3x3,
	LayoutGrid,
	Maximize2,
	Minimize2,
	Moon,
	Palette,
	Printer,
	Settings,
	Sparkles,
	Sun,
	Waypoints,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Checkbox } from "@/app/components/Checkbox";
import { ColorPicker } from "@/app/components/ColorPicker";
import ExportDropdown from "@/app/components/ExportDropdown";
import { FloatingWindow } from "@/app/components/FloatingWindow";
import { Select } from "@/app/components/Select";
import { useStore } from "@/app/store/useStore";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAutoLayout: () => void;
	onOpenPrintModal: () => void;
	onOpenSuggestionsModal: () => void;
	onDownloadImage: () => void;
	isDownloadingImage: boolean;
	onExportType: (type: "sql" | "ts" | "prisma" | null) => void;
}

export default function SettingsModal({
	isOpen,
	onClose,
	onAutoLayout,
	onOpenPrintModal,
	onOpenSuggestionsModal,
	onDownloadImage,
	isDownloadingImage,
	onExportType,
}: SettingsModalProps) {
	const {
		isCompactView,
		toggleCompactView,
		snapToGrid,
		toggleSnapToGrid,
		snapGridSize,
		setSnapGridSize,
		edgeSettings,
		updateEdgeSettings,
		columnStyleSettings,
		updateColumnStyleSettings,
		isReadOnly,
		toggleReadOnly,
	} = useStore();

	const { theme, setTheme } = useTheme();

	// Standard option row card styling for uniform layout and padding
	const rowCardStyle =
		"min-h-11 px-3 py-2 rounded-lg bg-background border border-border/70 hover:border-border transition-all flex items-center justify-between gap-3 shadow-xs";
	const clickableRowCardStyle = `${rowCardStyle} cursor-pointer hover:bg-muted/50 group`;

	return (
		<FloatingWindow
			isOpen={isOpen}
			onClose={onClose}
			title="Canvas & Settings"
			subtitle="Configure grid snapping, layout, styles, edges, and export options"
			icon={<Settings className="w-5 h-5 text-primary" />}
			defaultPosition={{ x: 120, y: 70 }}
			className="w-[720px]"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Section 1: Canvas & Grid */}
				<div className="flex flex-col gap-3 p-3.5 bg-muted/30 rounded-xl border border-border/60">
					<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 px-0.5">
						<Grid className="w-3.5 h-3.5 text-primary" /> Canvas & Grid Layout
					</h3>

					<div className="flex flex-col gap-2">
						{/* Snap to Grid Toggle */}
						<label
							htmlFor="snap-to-grid-checkbox"
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<Grid3x3 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								<span>Snap to Grid</span>
							</div>
							<Checkbox
								id="snap-to-grid-checkbox"
								checked={snapToGrid}
								onChange={toggleSnapToGrid}
							/>
						</label>

						{/* Grid Cell Size */}
						{snapToGrid && (
							<div className={rowCardStyle}>
								<div className="flex items-center gap-2 text-xs font-medium text-foreground">
									<Grid className="w-4 h-4 text-muted-foreground" />
									<span>Grid Cell Size</span>
								</div>
								<Select
									value={String(snapGridSize)}
									onChange={(val) => setSnapGridSize(Number(val))}
									className="w-32 h-7 text-xs"
									options={[
										{ label: "10 px (Fine)", value: "10" },
										{ label: "15 px (Default)", value: "15" },
										{ label: "20 px (Coarse)", value: "20" },
										{ label: "25 px (Large)", value: "25" },
									]}
								/>
							</div>
						)}

						{/* Re-arrange Diagram (Auto Layout) */}
						<button
							type="button"
							onClick={() => {
								onAutoLayout();
								onClose();
							}}
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<LayoutGrid className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								<span>Re-arrange Diagram (Auto Layout)</span>
							</div>
						</button>

						{/* Compact/Full View Toggle */}
						<button
							type="button"
							onClick={toggleCompactView}
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								{isCompactView ? (
									<Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								) : (
									<Minimize2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								)}
								<span>
									{isCompactView
										? "Full Table View (All Columns)"
										: "Simple Table View (Headers Only)"}
								</span>
							</div>
						</button>

						{/* Smart Relation Suggestions */}
						<button
							type="button"
							onClick={() => {
								onOpenSuggestionsModal();
								onClose();
							}}
							className="min-h-11 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-xs text-amber-600 dark:text-amber-400 font-medium text-xs"
						>
							<div className="flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-amber-500" />
								<span>Smart Relation Suggestions</span>
							</div>
						</button>
					</div>
				</div>

				{/* Section 2: Relationship Links & Edges */}
				<div className="flex flex-col gap-3 p-3.5 bg-muted/30 rounded-xl border border-border/60">
					<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 px-0.5">
						<Waypoints className="w-3.5 h-3.5 text-primary" /> Relationship Links & Edges
					</h3>

					<div className="flex flex-col gap-2">
						{/* Routing Style */}
						<div className={rowCardStyle}>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<Waypoints className="w-4 h-4 text-muted-foreground" />
								<span>Routing Style</span>
							</div>
							<Select
								value={edgeSettings.type}
								onChange={(val) =>
									updateEdgeSettings({
										type: val as "step" | "smoothstep" | "straight" | "bezier",
									})
								}
								className="w-32 h-7 text-xs"
								options={[
									{ label: "Smooth Step", value: "smoothstep" },
									{ label: "Step", value: "step" },
									{ label: "Straight", value: "straight" },
									{ label: "Bezier", value: "bezier" },
								]}
							/>
						</div>

						{/* Default Edge Color */}
						<div className={rowCardStyle}>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<Palette className="w-4 h-4 text-muted-foreground" />
								<span>Default Edge Color</span>
							</div>
							<ColorPicker
								value={edgeSettings.defaultColor || "#71717a"}
								onChange={(color) => updateEdgeSettings({ defaultColor: color })}
								size="sm"
							/>
						</div>

						{/* Crow's Foot Markers Toggle */}
						<label
							htmlFor="relation-markers-checkbox"
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<span>Show Crow&apos;s Foot Markers</span>
							</div>
							<Checkbox
								id="relation-markers-checkbox"
								checked={edgeSettings.showRelationMarkers || false}
								onChange={(e) =>
									updateEdgeSettings({
										showRelationMarkers: e.target.checked,
									})
								}
							/>
						</label>

						{/* Animated Edges Toggle */}
						<label
							htmlFor="animated-edges-checkbox"
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<span>Animated Edges</span>
							</div>
							<Checkbox
								id="animated-edges-checkbox"
								checked={edgeSettings.animated}
								onChange={(e) =>
									updateEdgeSettings({ animated: e.target.checked })
								}
							/>
						</label>
					</div>
				</div>

				{/* Section 3: Column Field Highlighting */}
				<div className="flex flex-col gap-3 p-3.5 bg-muted/30 rounded-xl border border-border/60">
					<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 px-0.5">
						<Palette className="w-3.5 h-3.5 text-primary" /> Column Field Highlighting
					</h3>

					<div className="flex flex-col gap-2">
						{/* PK Highlight Color */}
						<div className={rowCardStyle}>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
								<span>Primary Key (PK)</span>
							</div>
							<ColorPicker
								value={columnStyleSettings?.pk?.textColor || "#f59e0b"}
								onChange={(color) =>
									updateColumnStyleSettings({
										pk: {
											...columnStyleSettings?.pk,
											textColor: color,
										},
									})
								}
								size="sm"
							/>
						</div>

						{/* FK Highlight Color */}
						<div className={rowCardStyle}>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
								<span>Foreign Key (FK)</span>
							</div>
							<ColorPicker
								value={columnStyleSettings?.fk?.textColor || "#3b82f6"}
								onChange={(color) =>
									updateColumnStyleSettings({
										fk: {
											...columnStyleSettings?.fk,
											textColor: color,
										},
									})
								}
								size="sm"
							/>
						</div>

						{/* Audit Fields Highlight Color */}
						<div className={rowCardStyle}>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
								<span>Audit Fields</span>
							</div>
							<ColorPicker
								value={columnStyleSettings?.audit?.textColor || "#a855f7"}
								onChange={(color) =>
									updateColumnStyleSettings({
										audit: {
											...columnStyleSettings?.audit,
											textColor: color,
										},
									})
								}
								size="sm"
							/>
						</div>
					</div>
				</div>

				{/* Section 4: Export & System Preferences */}
				<div className="flex flex-col gap-3 p-3.5 bg-muted/30 rounded-xl border border-border/60">
					<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 px-0.5">
						<Download className="w-3.5 h-3.5 text-primary" /> Export & Preferences
					</h3>

					<div className="flex flex-col gap-2">
						{/* Export Code Dropdown */}
						<ExportDropdown onExport={onExportType} />

						{/* Print & HD Export */}
						<button
							type="button"
							onClick={() => {
								onOpenPrintModal();
								onClose();
							}}
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<Printer className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								<span>Print & HD Export (Poster / Scaled)</span>
							</div>
						</button>

						{/* Download Quick Diagram PNG */}
						<button
							type="button"
							onClick={onDownloadImage}
							disabled={isDownloadingImage}
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								<span>Download Quick Diagram PNG</span>
							</div>
						</button>

						{/* Read Only Toggle */}
						<button
							type="button"
							onClick={toggleReadOnly}
							className={clickableRowCardStyle}
						>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<Eye className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
								<span>{isReadOnly ? "Disable Read Only Mode" : "Enable Read Only Mode"}</span>
							</div>
						</button>

						{/* App Color Theme Switcher */}
						<div className={rowCardStyle}>
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								{theme === "dark" ? (
									<Moon className="w-4 h-4 text-amber-400" />
								) : (
									<Sun className="w-4 h-4 text-amber-500" />
								)}
								<span>App Theme</span>
							</div>
							<button
								type="button"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="h-7 px-3 text-xs font-medium rounded-md bg-muted/60 hover:bg-muted border border-border/60 transition-colors cursor-pointer text-foreground capitalize"
							>
								{theme || "system"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</FloatingWindow>
	);
}
