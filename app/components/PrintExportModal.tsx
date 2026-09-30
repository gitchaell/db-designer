"use client";

import { useStore } from "@/app/store/useStore";
import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
	Check,
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

export default function PrintExportModal({
	isOpen,
	onClose,
}: PrintExportModalProps) {
	const { project, isReadOnly, toggleReadOnly } = useStore();
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

	const captureCanvas = async (includeBg: boolean, scaleMultiplier = 2) => {
		const viewport = document.querySelector(
			".react-flow__viewport",
		) as HTMLElement;
		if (!viewport) throw new Error("Viewport element not found");

		const bgColor = includeBg
			? resolvedTheme === "dark"
				? "#09090b"
				: "#f9fafb"
			: "transparent";

		const exportFn = imageFormat === "jpeg" ? toJpeg : toPng;
		const dataUrl = await exportFn(viewport, {
			backgroundColor: bgColor,
			pixelRatio: scaleMultiplier,
			style: {
				// preserve background dots if includeBg is true
			},
		});

		return dataUrl;
	};

	const handleExportPdf = async () => {
		setIsProcessing(true);
		const wasEditing = !isReadOnly;
		if (wasEditing) toggleReadOnly();

		try {
			// Wait for read-only toggle to render cleanly
			await new Promise((r) => setTimeout(r, 200));

			const dataUrl = await captureCanvas(includeBackgroundPdf, 2);

			const img = new Image();
			img.src = dataUrl;
			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
			});

			const imgWidth = img.width;
			const imgHeight = img.height;

			// Initialize PDF
			const pdf = new jsPDF({
				orientation: orientation,
				unit: "mm",
				format: paperSize,
			});

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			const tileWidth = Math.floor(imgWidth / gridCols);
			const tileHeight = Math.floor(imgHeight / gridRows);

			for (let r = 0; r < gridRows; r++) {
				for (let c = 0; c < gridCols; c++) {
					if (r > 0 || c > 0) {
						pdf.addPage(paperSize, orientation);
					}

					// Create temp canvas for tiling slice
					const canvas = document.createElement("canvas");
					canvas.width = tileWidth;
					canvas.height = tileHeight;
					const ctx = canvas.getContext("2d");

					if (ctx) {
						if (includeBackgroundPdf) {
							ctx.fillStyle = resolvedTheme === "dark" ? "#09090b" : "#f9fafb";
							ctx.fillRect(0, 0, tileWidth, tileHeight);
						}

						ctx.drawImage(
							img,
							c * tileWidth,
							r * tileHeight,
							tileWidth,
							tileHeight,
							0,
							0,
							tileWidth,
							tileHeight,
						);

						const tileDataUrl = canvas.toDataURL("image/png");
						pdf.addImage(tileDataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
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

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
			<div className="bg-popover border border-border text-popover-foreground rounded-2xl p-6 w-[480px] shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
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
						<FileText className="w-3.5 h-3.5" /> Multi-Page PDF Print
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
								Splits large diagrams across an <b>N &times; M page grid</b> for
								poster printing and seamless assembly.
							</span>
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
									options={[1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({
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
									options={[1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({
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
							Generate {gridCols} × {gridRows} Page PDF Poster
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
