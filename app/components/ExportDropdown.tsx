import { Database, Prisma, TypeScript } from "@react-symbols/icons";
import { ChevronRight, FileCode2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ExportDropdownProps {
	onExport: (type: "sql" | "ts" | "prisma") => void;
}

export default function ExportDropdown({ onExport }: ExportDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ top: 0, left: 0 });

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setPosition({
				top: rect.top,
				left: rect.left - 180, // Position to the left of the Settings window
			});
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (event: Event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("pointerdown", handleClickOutside, {
			capture: true,
		});
		return () =>
			document.removeEventListener("pointerdown", handleClickOutside, {
				capture: true,
			});
	}, []);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full text-left min-h-11 px-3 py-2 rounded-lg bg-background hover:bg-muted/50 border border-border/70 hover:border-border transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-xs"
			>
				<div className="flex items-center gap-2 text-xs font-medium text-foreground">
					<FileCode2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
					<span>Export Code</span>
				</div>
				<ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
			</button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						ref={dropdownRef}
						className="export-portal-dropdown fixed z-[10000] w-48 bg-popover text-popover-foreground rounded-lg border border-border shadow-lg p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in duration-150"
						style={{ top: position.top, left: position.left }}
						onPointerDown={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							className="flex items-center w-full text-left px-2.5 py-2 text-xs font-medium rounded-md hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								onExport("sql");
								setIsOpen(false);
							}}
						>
							<Database className="w-4 h-4 mr-2 flex-none" />
							SQL Schema
						</button>
						<button
							type="button"
							className="flex items-center w-full text-left px-2.5 py-2 text-xs font-medium rounded-md hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								onExport("ts");
								setIsOpen(false);
							}}
						>
							<TypeScript className="w-4 h-4 mr-2 flex-none" />
							TypeScript Types
						</button>
						<button
							type="button"
							className="flex items-center w-full text-left px-2.5 py-2 text-xs font-medium rounded-md hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								onExport("prisma");
								setIsOpen(false);
							}}
						>
							<Prisma className="w-4 h-4 mr-2 flex-none text-foreground" />
							Prisma Schema
						</button>
					</div>,
					document.body,
				)}
		</>
	);
}
