import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export default function SettingsPopover({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	const [position, setPosition] = useState({ top: 0, left: 0 });

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setPosition({
				top: rect.bottom + 8,
				left: rect.right - 256, // popover width is approx 256px, aligning right
			});
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Don't close if clicking inside the portal dropdown of the Select component
			if ((event.target as Element).closest(".select-portal-dropdown")) {
				return;
			}

			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			<Button
				ref={buttonRef}
				variant="secondary"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				title="Settings"
			>
				<Settings className="w-4 h-4 mr-1.5" />
				Settings
			</Button>

			{isOpen &&
				createPortal(
					<div
						ref={popoverRef}
						className="fixed z-[9999] w-64 bg-popover text-popover-foreground rounded-md border border-border shadow-md p-2 flex flex-col gap-2 animate-in fade-in zoom-in duration-200"
						style={{ top: position.top, left: position.left }}
					>
						<h3 className="text-sm font-semibold border-b border-border pb-2">
							Configuration
						</h3>
						{children}
					</div>,
					document.body,
				)}
		</>
	);
}
