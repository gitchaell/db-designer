"use client";

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
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useStore } from "@/app/store/useStore";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { FloatingWindow } from "./FloatingWindow";
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
	const [progress, setProgress] = useState(0);
	const [progressStep, setProgressStep] = useState("");

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

	const updateProgress = async (pct: number, stepMsg: string) => {
		setProgress(pct);
		setProgressStep(stepMsg);
		await new Promise((r) => setTimeout(r, 20));
	};

	const captureCanvas = async (
		includeBg: boolean,
		scaleMultiplier = 3,
		format: "png" | "jpeg" = "png",
	) => {
		await updateProgress(15, "Calculating diagram bounding box...");
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

		await updateProgress(
			30,
			`Capturing high-res nodes (${scaleMultiplier}x)...`,
		);
		const exportFn = format === "jpeg" ? toJpeg : toPng;

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

		await updateProgress(50, "Rendering composite canvas...");
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
				const gap = 20 * scaleMultiplier;
				const dotRadius = 1.5 * scaleMultiplier;
				const tileCanvas = document.createElement("canvas");
				tileCanvas.width = gap;
				tileCanvas.height = gap;
				const tileCtx = tileCanvas.getContext("2d");
				if (tileCtx) {
					tileCtx.fillStyle = isDark ? "#27272a" : "#e4e4e7";
					tileCtx.beginPath();
					tileCtx.arc(gap / 2, gap / 2, dotRadius, 0, Math.PI * 2);
					tileCtx.fill();
					const pattern = ctx.createPattern(tileCanvas, "repeat");
					if (pattern) {
						ctx.fillStyle = pattern;
						ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
					}
				}
			}

			ctx.drawImage(img, 0, 0);
		}

		await updateProgress(70, "Encoding high-res image data...");
		return finalCanvas.toDataURL(
			format === "jpeg" ? "image/jpeg" : "image/png",
		);
	};

	const handleExportPdf = async () => {
		setIsProcessing(true);
		const wasEditing = !isReadOnly;
		if (wasEditing) toggleReadOnly();

		try {
			await updateProgress(5, "Preparing print layout...");
			const dataUrl = await captureCanvas(includeBackgroundPdf, 3, "png");

			await updateProgress(75, "Constructing PDF document grid...");
			const img = new Image();
			img.src = dataUrl;
			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
			});

			const [pdfPageWidthMM, pdfPageHeightMM] =
				PAPER_DIMENSIONS_MM[paperSize][orientation];

			const pdf = new jsPDF({
				orientation: orientation,
				unit: "mm",
				format: paperSize,
			});

			const tilePxWidth = 1400;
			const tilePxHeight = Math.round(
				tilePxWidth * (pdfPageHeightMM / pdfPageWidthMM),
			);

			const totalGridWidthPx = gridCols * tilePxWidth;
			const totalGridHeightPx = gridRows * tilePxHeight;

			const gridRatio = totalGridWidthPx / totalGridHeightPx;
			const imgRatio = img.width / img.height;

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

			const fullCanvas = document.createElement("canvas");
			fullCanvas.width = totalGridWidthPx;
			fullCanvas.height = totalGridHeightPx;
			const fullCtx = fullCanvas.getContext("2d");

			if (fullCtx) {
				const isDark = resolvedTheme === "dark";
				fullCtx.fillStyle = isDark ? "#09090b" : "#f9fafb";
				fullCtx.fillRect(0, 0, totalGridWidthPx, totalGridHeightPx);
				fullCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

				const totalPages = gridRows * gridCols;
				let currentPage = 0;

				for (let r = 0; r < gridRows; r++) {
					for (let c = 0; c < gridCols; c++) {
						currentPage++;
						await updateProgress(
							80 + Math.round((currentPage / totalPages) * 15),
							`Rendering page tile ${currentPage} of ${totalPages}...`,
						);

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

			await updateProgress(98, "Downloading PDF file...");
			pdf.save(
				`${project?.name || "diagram"}-poster-${gridCols}x${gridRows}.pdf`,
			);
			await updateProgress(100, "Done!");
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
			await updateProgress(5, "Preparing image capture...");
			const dataUrl = await captureCanvas(
				includeBackgroundImg,
				imageScale,
				imageFormat,
			);

			await updateProgress(95, "Downloading high-resolution image...");
			const a = document.createElement("a");
			a.setAttribute(
				"download",
				`${project?.name || "diagram"}-${imageScale}x.${imageFormat}`,
			);
			a.setAttribute("href", dataUrl);
			a.click();
			await updateProgress(100, "Export complete!");
		} catch (err) {
			console.error("Failed to export HD image", err);
		} finally {
			if (wasEditing) toggleReadOnly();
			setIsProcessing(false);
		}
	};

	const [pageW, pageH] = PAPER_DIMENSIONS_MM[paperSize][orientation];

	return (
		<FloatingWindow
			isOpen={isOpen}
			onClose={onClose}
			title="Advanced Print & HD Export"
			subtitle="Export ultra high-definition PNG/JPEG images or multi-page poster PDFs"
			icon={<Printer className="w-5 h-5 text-primary" />}
			defaultPosition={{ x: 180, y: 70 }}
			className="w-[560px]"
		>
			{/* Tabs */}
			<div className="flex bg-muted/60 p-1 rounded-lg gap-1">
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
				<div className="flex flex-col gap-3.5">
					<div className="bg-muted/30 p-2.5 rounded-xl border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
						<Grid className="w-4 h-4 text-primary flex-none" />
						<span>
							Splits large diagrams across an <b>N &times; M page grid</b> while
							preserving aspect ratio and HD sharpness.
						</span>
					</div>

					{/* Grid Layout Preview */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
							<span>Page Grid Layout Preview</span>
							<span>
								{gridCols * gridRows} Page{gridCols * gridRows > 1 ? "s" : ""} (
								{paperSize.toUpperCase()} {orientation}, {pageW} &times; {pageH}{" "}
								mm)
							</span>
						</div>

						<div className="bg-muted/40 border border-border rounded-xl p-3 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
							<div
								className="grid gap-1 p-2 bg-background/80 rounded-lg border border-border shadow-inner max-w-full"
								style={{
									gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
									gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
									aspectRatio: `${gridCols * pageW} / ${gridRows * pageH}`,
									maxHeight: "110px",
								}}
							>
								{Array.from({ length: gridCols * gridRows }).map(
									(_, pageIdx) => (
										<div
											key={`page-grid-${pageIdx + 1}`}
											className="border border-dashed border-primary/40 bg-primary/5 rounded flex items-center justify-center text-[10px] font-mono text-primary/80 font-bold p-1 min-w-[28px] min-h-[20px]"
										>
											P{pageIdx + 1}
										</div>
									),
								)}
							</div>
						</div>
					</div>

					{/* Grid Controls */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-muted-foreground">
								Horizontal Pages (Cols)
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
								onChange={(val) => setPaperSize(val as "a4" | "letter" | "a3")}
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
						className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border/80 cursor-pointer"
					>
						<span className="text-xs font-medium text-foreground">
							Include Dot Grid Background
						</span>
						<Checkbox
							id="include-bg-pdf"
							checked={includeBackgroundPdf}
							onChange={(e) => setIncludeBackgroundPdf(e.target.checked)}
						/>
					</label>

					{/* Progress Bar Display */}
					{isProcessing && (
						<div className="flex flex-col gap-1.5 p-2.5 bg-muted/50 rounded-xl border border-border">
							<div className="flex items-center justify-between text-xs font-semibold text-foreground">
								<span className="flex items-center gap-1.5">
									<Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
									{progressStep}
								</span>
								<span className="font-mono">{progress}%</span>
							</div>
							<div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
								<div
									className="h-full bg-primary transition-all duration-150 ease-out"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}

					<Button
						onClick={handleExportPdf}
						disabled={isProcessing}
						className="w-full mt-1 h-9"
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
				<div className="flex flex-col gap-3.5">
					<div className="bg-muted/30 p-2.5 rounded-xl border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
						<Sliders className="w-4 h-4 text-primary flex-none" />
						<span>
							Export ultra high-definition PNG or JPEG images up to{" "}
							<b>5x resolution</b>.
						</span>
					</div>

					{/* Scale & Format */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-muted-foreground">
								Resolution Scale
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
						className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border/80 cursor-pointer"
					>
						<span className="text-xs font-medium text-foreground">
							Include Dot Grid Background
						</span>
						<Checkbox
							id="include-bg-img"
							checked={includeBackgroundImg}
							onChange={(e) => setIncludeBackgroundImg(e.target.checked)}
						/>
					</label>

					{/* Progress Bar Display */}
					{isProcessing && (
						<div className="flex flex-col gap-1.5 p-2.5 bg-muted/50 rounded-xl border border-border">
							<div className="flex items-center justify-between text-xs font-semibold text-foreground">
								<span className="flex items-center gap-1.5">
									<Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
									{progressStep}
								</span>
								<span className="font-mono">{progress}%</span>
							</div>
							<div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
								<div
									className="h-full bg-primary transition-all duration-150 ease-out"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}

					<Button
						onClick={handleExportImage}
						disabled={isProcessing}
						className="w-full mt-1 h-9"
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
		</FloatingWindow>
	);
}
