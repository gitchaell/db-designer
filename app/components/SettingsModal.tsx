"use client";

import { useStore } from "@/app/store/useStore";
import {
	Download,
	Eye,
	Grid,
	Grid3x3,
	LayoutGrid,
	Maximize2,
	Minimize2,
	Palette,
	Printer,
	Settings,
	Sparkles,
	Waypoints,
	X,
} from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import ExportDropdown from "./ExportDropdown";
import { Select } from "./Select";
import { ThemeToggle } from "./ThemeToggle";

const COLOR_PALETTE = [
	"#71717a",
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#ec4899",
	"#06b6d4",
];

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

	if (!isOpen || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
			<div className="bg-popover border border-border text-popover-foreground rounded-2xl p-6 w-full max-w-3xl shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b border-border pb-4">
					<div className="flex items-center gap-2.5">
						<div className="p-2 bg-primary/10 text-primary rounded-xl">
							<Settings className="w-5 h-5" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-foreground font-display">
								Canvas & Application Settings
							</h2>
							<p className="text-xs text-muted-foreground">
								Configure grid snapping, layout, styles, edges, and export options
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Options Grid Layout (Square / 2-Column Wide Grid) */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					{/* Section 1: Canvas & Grid */}
					<div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border border-border/60">
						<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
							<Grid className="w-4 h-4" /> Canvas & Grid Layout
						</h3>

						<div className="flex flex-col gap-2.5 pt-1">
							{/* Snap to Grid */}
							<label
								htmlFor="snap-to-grid-checkbox"
								className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 cursor-pointer hover:border-primary/50 transition-colors"
							>
								<div className="flex items-center gap-2">
									<Grid3x3 className="w-4 h-4 text-muted-foreground" />
									<span className="text-xs font-medium text-foreground">
										Snap to Grid
									</span>
								</div>
								<Checkbox
									id="snap-to-grid-checkbox"
									checked={snapToGrid}
									onChange={toggleSnapToGrid}
								/>
							</label>

							{/* Grid Size Selector */}
							{snapToGrid && (
								<div className="flex items-center justify-between px-2 py-1 bg-background rounded-lg border border-border/80 text-xs">
									<span className="text-muted-foreground font-medium">
										Grid Cell Size
									</span>
									<Select
										value={String(snapGridSize)}
										onChange={(val) => setSnapGridSize(Number(val))}
										className="w-28 h-7 text-xs"
										options={[
											{ label: "10 px (Fine)", value: "10" },
											{ label: "15 px (Default)", value: "15" },
											{ label: "20 px (Coarse)", value: "20" },
											{ label: "25 px (Large)", value: "25" },
										]}
									/>
								</div>
							)}

							{/* Auto Layout Action */}
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									onAutoLayout();
									onClose();
								}}
								className="w-full justify-start text-xs font-medium"
							>
								<LayoutGrid className="w-4 h-4 mr-2 text-muted-foreground" />
								Re-arrange Diagram (Auto Layout)
							</Button>

							{/* Simple View Toggle */}
							<Button
								variant="secondary"
								size="sm"
								onClick={toggleCompactView}
								className="w-full justify-start text-xs font-medium"
							>
								{isCompactView ? (
									<Maximize2 className="w-4 h-4 mr-2 text-muted-foreground" />
								) : (
									<Minimize2 className="w-4 h-4 mr-2 text-muted-foreground" />
								)}
								{isCompactView
									? "Full Table View (All Columns)"
									: "Simple Table View (Headers Only)"}
							</Button>

							{/* Smart Relation Suggestions Modal */}
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									onOpenSuggestionsModal();
									onClose();
								}}
								className="w-full justify-start text-xs font-medium text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30"
							>
								<Sparkles className="w-4 h-4 mr-2" />
								Smart Relation Suggestions
							</Button>
						</div>
					</div>

					{/* Section 2: Edges & Links */}
					<div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border border-border/60">
						<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
							<Waypoints className="w-4 h-4" /> Relationship Links & Edges
						</h3>

						<div className="flex flex-col gap-2.5 pt-1">
							{/* Edge Type */}
							<div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80">
								<span className="text-xs font-medium text-foreground">
									Routing Style
								</span>
								<Select
									value={edgeSettings.type}
									onChange={(val) =>
										updateEdgeSettings({
											type: val as
												| "step"
												| "smoothstep"
												| "straight"
												| "bezier",
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
							<div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80">
								<span className="text-xs font-medium text-foreground">
									Default Edge Color
								</span>
								<div className="flex items-center gap-1.5">
									{COLOR_PALETTE.slice(0, 5).map((color) => (
										<button
											key={color}
											type="button"
											onClick={() =>
												updateEdgeSettings({ defaultColor: color })
											}
											style={{ backgroundColor: color }}
											className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${
												edgeSettings.defaultColor === color
													? "ring-2 ring-primary ring-offset-1"
													: "opacity-80"
											}`}
										/>
									))}
									<input
										type="color"
										value={edgeSettings.defaultColor || "#71717a"}
										onChange={(e) =>
											updateEdgeSettings({ defaultColor: e.target.value })
										}
										className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
									/>
								</div>
							</div>

							{/* Relation Markers */}
							<label
								htmlFor="relation-markers-checkbox"
								className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 cursor-pointer hover:border-primary/50 transition-colors"
							>
								<span className="text-xs font-medium text-foreground">
									Show Crow's Foot Markers
								</span>
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

							{/* Animated Edges */}
							<label
								htmlFor="animated-edges-checkbox"
								className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 cursor-pointer hover:border-primary/50 transition-colors"
							>
								<span className="text-xs font-medium text-foreground">
									Animated Edges
								</span>
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

					{/* Section 3: Field Styles & Colors */}
					<div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border border-border/60">
						<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
							<Palette className="w-4 h-4" /> Column Field Highlighting
						</h3>

						<div className="flex flex-col gap-2 pt-1">
							{/* PK Color */}
							<div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 text-xs">
								<span className="flex items-center gap-2 font-medium text-foreground">
									<span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Primary
									Key (PK) Color
								</span>
								<input
									type="color"
									value={columnStyleSettings?.pk?.textColor || "#f59e0b"}
									onChange={(e) =>
										updateColumnStyleSettings({
											pk: {
												...columnStyleSettings?.pk,
												textColor: e.target.value,
											},
										})
									}
									className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
								/>
							</div>

							{/* FK Color */}
							<div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 text-xs">
								<span className="flex items-center gap-2 font-medium text-foreground">
									<span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Foreign
									Key (FK) Color
								</span>
								<input
									type="color"
									value={columnStyleSettings?.fk?.textColor || "#3b82f6"}
									onChange={(e) =>
										updateColumnStyleSettings({
											fk: {
												...columnStyleSettings?.fk,
												textColor: e.target.value,
											},
										})
									}
									className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
								/>
							</div>

							{/* Audit Fields Color */}
							<div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 text-xs">
								<span className="flex items-center gap-2 font-medium text-foreground">
									<span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Audit
									Fields Color
								</span>
								<input
									type="color"
									value={columnStyleSettings?.audit?.textColor || "#a855f7"}
									onChange={(e) =>
										updateColumnStyleSettings({
											audit: {
												...columnStyleSettings?.audit,
												textColor: e.target.value,
											},
										})
									}
									className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
								/>
							</div>
						</div>
					</div>

					{/* Section 4: Export & System Preferences */}
					<div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border border-border/60">
						<h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
							<Download className="w-4 h-4" /> Export & Modes
						</h3>

						<div className="flex flex-col gap-2.5 pt-1">
							{/* Export Dropdown */}
							<div className="w-full">
								<ExportDropdown onExport={onExportType} />
							</div>

							{/* Advanced Print Modal Trigger */}
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									onOpenPrintModal();
									onClose();
								}}
								className="w-full justify-start text-xs font-medium"
							>
								<Printer className="w-4 h-4 mr-2 text-muted-foreground" />
								Print & HD Export (Poster / Multi-scale)
							</Button>

							{/* Quick Download Image */}
							<Button
								variant="secondary"
								size="sm"
								onClick={onDownloadImage}
								disabled={isDownloadingImage}
								className="w-full justify-start text-xs font-medium"
							>
								<Download className="w-4 h-4 mr-2 text-muted-foreground" />
								Download Quick Diagram PNG
							</Button>

							{/* Read Only Toggle */}
							<Button
								variant="secondary"
								size="sm"
								onClick={toggleReadOnly}
								className="w-full justify-start text-xs font-medium"
							>
								<Eye className="w-4 h-4 mr-2 text-muted-foreground" />
								{isReadOnly ? "Disable Read Only Mode" : "Enable Read Only Mode"}
							</Button>

							{/* Theme Switcher */}
							<div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80">
								<span className="text-xs font-medium text-foreground">
									Color Theme
								</span>
								<ThemeToggle className="!p-1 !h-7 text-xs bg-transparent border-none [&>span.sr-only]:not-sr-only [&>span.sr-only]:ml-1" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
