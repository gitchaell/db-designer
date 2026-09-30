"use client";

import { useStore } from "@/app/store/useStore";
import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
	Download,
	FileText,
	Grid,
	Image as ImageIcon,
	Loader2,
	Printer,
	Sliders,
	X,
} from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Select } from "./Select";

interface PrintExportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PAPER_DIMENSIONS_MM: Record<
	"a4" | "letter" | "a3",
	{ portrait: [number, number]; landscape: [number, number] }
> = {
	a4: { portrait: [210, 297], landscape: [297, 210] },
	letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
	a3: { portrait: [297, 420], landscape: [420, 297] },
};

export default function PrintExportModal({
	isOpen,
	onClose,
}: PrintExportModalProps) {
	const { project, isReadOnly, toggleReadOnly, nodes } = useStore();
	const { resolvedTheme } = useTheme();

	const [activeTab, setActiveTab] = useState<"pdf" | "image">("pdf");
	const [isProcessing, setIsProcessing] = useState(false);

	// PDF Grid Print Settings
	const [gridCols, setGridCols] = useState(2);
	const [gridRows, setGridRows] = useState(2);
	const [paperSize, setPaperSize] = useState<"a4" | "letter" | "a3">("a4");
	const [orientation, setOrientation] = useState<"portrait" | "landscape">(
		"landscape",
	);
	const [includeBackgroundPdf, setIncludeBackgroundPdf] = useState(true);

	// HD Image Export Settings
	const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png");
	const [imageScale, setImageScale] = useState(3); // 1x, 2x, 3x, 4x, 5x
	const [includeBackgroundImg, setIncludeBackgroundImg] = useState(true);

	if (!isOpen) return null;

	const captureCanvas = async (includeBg: boolean, scaleMultiplier = 3) => {
		const viewportElement = document.querySelector(
			".react-flow__viewport",
		) as HTMLElement;
		if (!viewportElement) throw new Error("Flow element not found");

		// Compute bounding box covering ALL nodes in the diagram
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		if (nodes.length === 0) {
			minX = 0;
			minY = 0;
			maxX = 800;
			maxY = 600;
		} else {
			for (const node of nodes) {
				const w =
					(node.style?.width as number) ||
					(node.measured?.width as number) ||
					320;
				const h =
					(node.style?.height as number) ||
					(node.measured?.height as number) ||
					200;

				minX = Math.min(minX, node.position.x);
				minY = Math.min(minY, node.position.y);
				maxX = Math.max(maxX, node.position.x + w);
				maxY = Math.max(maxY, node.position.y + h);
			}
		}

		const padding = 80;
		const width = Math.max(600, Math.ceil(maxX - minX + padding * 2));
		const height = Math.max(400, Math.ceil(maxY - minY + padding * 2));
		const translateX = -minX + padding;
		const translateY = -minY + padding;

		const exportFn = imageFormat === "jpeg" ? toJpeg : toPng;

		// Render viewport element transformed to fit bounds
		const rawDataUrl = await exportFn(viewportElement, {
			width,
			height,
			pixelRatio: scaleMultiplier,
			style: {
				transform: `translate(${translateX}px, ${translateY}px) scale(1)`,
				width: `${width}px`,
				height: `${height}px`,
			},
			filter: (node) => {
				const el = node as HTMLElement;
				if (
					el.classList?.contains("react-flow__controls") ||
					el.classList?.contains("react-flow__panel") ||
					el.classList?.contains("react-flow__background")
				) {
					return false;
				}
				return true;
			},
		});

		// Create composite canvas with reliable dot grid background
		const img = new Image();
		img.src = rawDataUrl;
		await new Promise((resolve, reject) => {
			img.onload = resolve;
			img.onerror = reject;
		});

		const finalCanvas = document.createElement("canvas");
		finalCanvas.width = width * scaleMultiplier;
		finalCanvas.height = height * scaleMultiplier;
		const ctx = finalCanvas.getContext("2d");

		if (ctx) {
			const isDark = resolvedTheme === "dark";
			const bgColor = isDark ? "#09090b" : "#f9fafb";
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

			if (includeBg) {
				const dotColor = isDark ? "#27272a" : "#e4e4e7";
				const dotRadius = 1.5 * scaleMultiplier;
				const gap = 20 * scaleMultiplier;

				ctx.fillStyle = dotColor;
				for (let x = gap / 2; x < finalCanvas.width; x += gap) {
					for (let y = gap / 2; y < finalCanvas.height; y += gap) {
						ctx.beginPath();
						ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}

			ctx.drawImage(img, 0, 0);
		}

		return finalCanvas.toDataURL(
			imageFormat === "jpeg" ? "image/jpeg" : "image/png",
		);
	};

	const handleExportPdf = async () => {
		setIsProcessing(true);
		const wasEditing = !isReadOnly;
		if (wasEditing) toggleReadOnly();

		try {
			await new Promise((r) => setTimeout(r, 200));

			// Capture high resolution image (3x scale) with complete bounds
			const dataUrl = await captureCanvas(includeBackgroundPdf, 3);

			const img = new Image();
			img.src = dataUrl;
			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
			});

			const [pdfPageWidthMM, pdfPageHeightMM] =
				PAPER_DIMENSIONS_MM[paperSize][orientation];

			// Initialize PDF
			const pdf = new jsPDF({
				orientation: orientation,
				unit: "mm",
				format: paperSize,
			});

			// Standard high resolution pixel dimension per page tile
			const tilePxWidth = 1600;
			const tilePxHeight = Math.round(
				tilePxWidth * (pdfPageHeightMM / pdfPageWidthMM),
			);

			const totalGridWidthPx = gridCols * tilePxWidth;
			const totalGridHeightPx = gridRows * tilePxHeight;

			const gridRatio = totalGridWidthPx / totalGridHeightPx;
			const imgRatio = img.width / img.height;

			// Fit image into the grid canvas preserving exact aspect ratio
			let drawW = totalGridWidthPx;
			let drawH = totalGridHeightPx;
			let offsetX = 0;
			let offsetY = 0;

			if (imgRatio > gridRatio) {
				drawW = totalGridWidthPx;
				drawH = totalGridWidthPx / imgRatio;
				offsetY = (totalGridHeightPx - drawH) / 2;
			} else {
				drawH = totalGridHeightPx;
				drawW = totalGridHeightPx * imgRatio;
				offsetX = (totalGridWidthPx - drawW) / 2;
			}

			// Render composite canvas
			const fullCanvas = document.createElement("canvas");
			fullCanvas.width = totalGridWidthPx;
			fullCanvas.height = totalGridHeightPx;
			const fullCtx = fullCanvas.getContext("2d");

			if (fullCtx) {
				const isDark = resolvedTheme === "dark";
				fullCtx.fillStyle = isDark ? "#09090b" : "#f9fafb";
				fullCtx.fillRect(0, 0, totalGridWidthPx, totalGridHeightPx);

				fullCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

				// Slice page tiles
				for (let r = 0; r < gridRows; r++) {
					for (let c = 0; c < gridCols; c++) {
						if (r > 0 || c > 0) {
							pdf.addPage(paperSize, orientation);
						}

						const pageCanvas = document.createElement("canvas");
						pageCanvas.width = tilePxWidth;
						pageCanvas.height = tilePxHeight;
						const pageCtx = pageCanvas.getContext("2d");

						if (pageCtx) {
							pageCtx.drawImage(
								fullCanvas,
								c * tilePxWidth,
								r * tilePxHeight,
								tilePxWidth,
								tilePxHeight,
								0,
								0,
								tilePxWidth,
								tilePxHeight,
							);

							const pageDataUrl = pageCanvas.toDataURL("image/png");
							pdf.addImage(
								pageDataUrl,
								"PNG",
								0,
								0,
								pdfPageWidthMM,
								pdfPageHeightMM,
							);
						}
					}
				}
			}

			pdf.save(
				`${project?.name || "diagram"}-poster-${gridCols}x${gridRows}.pdf`,
			);
		} catch (err) {
			console.error("Failed to generate multi-page PDF print", err);
		} finally {
			if (wasEditing) toggleReadOnly();
			setIsProcessing(false);
		}
	};

	const handleExportImage = async () => {
		setIsProcessing(true);
		const wasEditing = !isReadOnly;
		if (wasEditing) toggleReadOnly();

		try {
			await new Promise((r) => setTimeout(r, 200));
			const dataUrl = await captureCanvas(includeBackgroundImg, imageScale);

			const a = document.createElement("a");
			a.setAttribute(
				"download",
				`${project?.name || "diagram"}-${imageScale}x.${imageFormat}`,
			);
			a.setAttribute("href", dataUrl);
			a.click();
		} catch (err) {
			console.error("Failed to export HD image", err);
		} finally {
			if (wasEditing) toggleReadOnly();
			setIsProcessing(false);
		}
	};

	const [pageW, pageH] = PAPER_DIMENSIONS_MM[paperSize][orientation];

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
			<div className="bg-popover border border-border text-popover-foreground rounded-2xl p-6 w-[520px] shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b border-border pb-3">
					<div className="flex items-center gap-2">
						<Printer className="w-5 h-5 text-primary" />
						<h2 className="text-base font-bold text-foreground">
							Advanced Print & Image Export
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex bg-muted p-1 rounded-lg gap-1">
					<button
						type="button"
						onClick={() => setActiveTab("pdf")}
						className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
							activeTab === "pdf"
								? "bg-background text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<FileText className="w-3.5 h-3.5" /> Multi-Page PDF Poster
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("image")}
						className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
							activeTab === "image"
								? "bg-background text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<ImageIcon className="w-3.5 h-3.5" /> High-Res Image Export
					</button>
				</div>

				{/* PDF Print Tab Content */}
				{activeTab === "pdf" && (
					<div className="flex flex-col gap-4">
						<div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
							<Grid className="w-4 h-4 text-primary flex-none" />
							<span>
								Splits large diagrams across an <b>N &times; M page grid</b>{" "}
								while preserving aspect ratio and HD sharpness.
							</span>
						</div>

						{/* PDF Layout Visual Preview */}
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
								<span>Page Grid Layout Preview</span>
								<span>
									{gridCols * gridRows} Page{gridCols * gridRows > 1 ? "s" : ""}{" "}
									({paperSize.toUpperCase()} {orientation}, {pageW} &times;{" "}
									{pageH} mm)
								</span>
							</div>

							<div className="bg-muted/60 border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
								<div
									className="grid gap-1 p-2 bg-background/80 rounded-lg border border-border shadow-inner max-w-full"
									style={{
										gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
										gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
										aspectRatio: `${gridCols * pageW} / ${gridRows * pageH}`,
										maxHeight: "130px",
									}}
								>
									{Array.from({ length: gridCols * gridRows }).map(
										(_, pageIdx) => (
											<div
												key={`page-grid-${pageIdx + 1}`}
												className="border border-dashed border-primary/40 bg-primary/5 rounded flex items-center justify-center text-[10px] font-mono text-primary/80 font-bold p-2 min-w-[32px] min-h-[24px]"
											>
												P{pageIdx + 1}
											</div>
										),
									)}
								</div>
								<span className="text-[10px] text-muted-foreground mt-2 font-mono">
									Proportional aspect ratio preserved across all pages
								</span>
							</div>
						</div>

						{/* Grid Rows & Columns */}
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Horizontal Pages (Columns)
								</span>
								<Select
									value={String(gridCols)}
									onChange={(val) => setGridCols(Number(val))}
									options={[1, 2, 3, 4, 5, 6].map((n) => ({
										label: `${n} Page${n > 1 ? "s" : ""}`,
										value: String(n),
									}))}
								/>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Vertical Pages (Rows)
								</span>
								<Select
									value={String(gridRows)}
									onChange={(val) => setGridRows(Number(val))}
									options={[1, 2, 3, 4, 5, 6].map((n) => ({
										label: `${n} Page${n > 1 ? "s" : ""}`,
										value: String(n),
									}))}
								/>
							</div>
						</div>

						{/* Paper Format & Orientation */}
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Paper Size
								</span>
								<Select
									value={paperSize}
									onChange={(val) =>
										setPaperSize(val as "a4" | "letter" | "a3")
									}
									options={[
										{ label: "A4", value: "a4" },
										{ label: "Letter", value: "letter" },
										{ label: "A3", value: "a3" },
									]}
								/>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Orientation
								</span>
								<Select
									value={orientation}
									onChange={(val) =>
										setOrientation(val as "portrait" | "landscape")
									}
									options={[
										{ label: "Landscape", value: "landscape" },
										{ label: "Portrait", value: "portrait" },
									]}
								/>
							</div>
						</div>

						{/* Background Toggle */}
						<label
							htmlFor="include-bg-pdf"
							className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl border border-border/50 cursor-pointer"
						>
							<span className="text-xs font-medium text-foreground">
								Include Blackboard Dot Grid Background
							</span>
							<Checkbox
								id="include-bg-pdf"
								checked={includeBackgroundPdf}
								onChange={(e) => setIncludeBackgroundPdf(e.target.checked)}
							/>
						</label>

						{/* Print PDF Button */}
						<Button
							onClick={handleExportPdf}
							disabled={isProcessing}
							className="w-full mt-1"
						>
							{isProcessing ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Printer className="w-4 h-4 mr-2" />
							)}
							Generate {gridCols} &times; {gridRows} Page PDF Poster
						</Button>
					</div>
				)}

				{/* High-Res Image Tab Content */}
				{activeTab === "image" && (
					<div className="flex flex-col gap-4">
						<div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
							<Sliders className="w-4 h-4 text-primary flex-none" />
							<span>
								Export ultra high-definition PNG or JPEG images up to{" "}
								<b>5x resolution</b> for large prints or documentation.
							</span>
						</div>

						{/* Scale & Format */}
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Resolution Scale Multiplier
								</span>
								<Select
									value={String(imageScale)}
									onChange={(val) => setImageScale(Number(val))}
									options={[
										{ label: "1x Standard", value: "1" },
										{ label: "2x High Res", value: "2" },
										{ label: "3x Ultra HD", value: "3" },
										{ label: "4x Poster HD", value: "4" },
										{ label: "5x Extreme HD", value: "5" },
									]}
								/>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Format
								</span>
								<Select
									value={imageFormat}
									onChange={(val) => setImageFormat(val as "png" | "jpeg")}
									options={[
										{ label: "PNG (Lossless)", value: "png" },
										{ label: "JPEG (Compressed)", value: "jpeg" },
									]}
								/>
							</div>
						</div>

						{/* Background Toggle */}
						<label
							htmlFor="include-bg-img"
							className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl border border-border/50 cursor-pointer"
						>
							<span className="text-xs font-medium text-foreground">
								Include Blackboard Dot Grid Background
							</span>
							<Checkbox
								id="include-bg-img"
								checked={includeBackgroundImg}
								onChange={(e) => setIncludeBackgroundImg(e.target.checked)}
							/>
						</label>

						{/* Export Image Button */}
						<Button
							onClick={handleExportImage}
							disabled={isProcessing}
							className="w-full mt-1"
						>
							{isProcessing ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Download className="w-4 h-4 mr-2" />
							)}
							Export {imageScale}x {imageFormat.toUpperCase()} Image
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
