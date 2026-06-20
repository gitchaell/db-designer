import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, FileCode2 } from "lucide-react";
import { Prisma, TypeScript, Database } from "@react-symbols/icons";

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
				left: rect.left - 180, // Position to the left of the SettingsPopover
			});
		}
	}, [isOpen]);

	// In the parent `SettingsPopover`, we are already tracking pointer down.
	// To prevent immediate closing from parent pointer down, we need to stop propagation on the dropdown.
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
				className="w-full flex items-center justify-between h-8 px-2 text-sm font-medium text-foreground hover:bg-muted transition-colors rounded-sm cursor-pointer"
			>
				<div className="flex items-center">
					<FileCode2 className="w-4 h-4 mr-2 text-muted-foreground" />
					Export Code
				</div>
				<ChevronRight className="w-4 h-4 opacity-50" />
			</button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						ref={dropdownRef}
						className="export-portal-dropdown fixed z-[10000] w-44 bg-popover text-popover-foreground rounded-md border border-border shadow-md p-1 flex flex-col gap-0.5 animate-in fade-in zoom-in duration-200"
						style={{ top: position.top, left: position.left }}
						onPointerDown={(e) => e.stopPropagation()} // Keep popover open
					>
						<button
							type="button"
							className="flex items-center w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								onExport("sql");
								setIsOpen(false);
							}}
						>
							<Database className="w-4 h-4 mr-2 flex-none" />
							SQL Preview
						</button>
						<button
							type="button"
							className="flex items-center w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors cursor-pointer"
							onClick={() => {
								onExport("ts");
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
								onExport("prisma");
								setIsOpen(false);
							}}
						>
							<Prisma className="w-4 h-4 mr-2 flex-none text-foreground" />
							Prisma
						</button>
					</div>,
					document.body,
				)}
		</>
	);
}
