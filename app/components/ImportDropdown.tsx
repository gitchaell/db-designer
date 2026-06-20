import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Import } from "lucide-react";
import { Prisma, TypeScript, Database } from "@react-symbols/icons";
import { Button } from "./Button";
import TsImportModal from "./TsImportModal";
import PrismaImportModal from "./PrismaImportModal";
import SqlImportModal from "./SqlImportModal";

export default function ImportDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const [importType, setImportType] = useState<"sql" | "ts" | "prisma" | null>(
		null,
	);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setPosition({
				top: rect.bottom + 8,
				left: rect.left,
				width: Math.max(rect.width, 160),
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
			<Button
				ref={buttonRef}
				variant="secondary"
				onClick={() => setIsOpen(!isOpen)}
			>
				<Import className="w-4 h-4 mr-2" />
				Import
				<ChevronDown className="w-4 h-4 ml-2 opacity-50" />
			</Button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						ref={dropdownRef}
						className="fixed z-[9999] bg-popover text-popover-foreground rounded-md border border-border shadow-md p-1 flex flex-col gap-0.5 animate-in fade-in zoom-in duration-200"
						style={{
							top: position.top,
							left: position.left,
							minWidth: position.width,
						}}
					>
						<button
							type="button"
							className="flex items-center w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								setImportType("sql");
								setIsOpen(false);
							}}
						>
							<Database className="w-4 h-4 mr-2 flex-none" />
							SQL
						</button>
						<button
							type="button"
							className="flex items-center w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								setImportType("ts");
								setIsOpen(false);
							}}
						>
							<TypeScript className="w-4 h-4 mr-2 flex-none" />
							TypeScript
						</button>
						<button
							type="button"
							className="flex items-center w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								setImportType("prisma");
								setIsOpen(false);
							}}
						>
							<Prisma className="w-4 h-4 mr-2 flex-none text-foreground" />
							Prisma
						</button>
					</div>,
					document.body,
				)}

			<SqlImportModal
				isOpen={importType === "sql"}
				onClose={() => setImportType(null)}
			/>
			<TsImportModal
				isOpen={importType === "ts"}
				onClose={() => setImportType(null)}
			/>
			<PrismaImportModal
				isOpen={importType === "prisma"}
				onClose={() => setImportType(null)}
			/>
		</>
	);
}
