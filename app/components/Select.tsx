import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

interface SelectOption {
	label: string;
	value: string;
}

interface SelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
	placeholder?: string;
	disabled?: boolean;
}

export function Select({
	options,
	value,
	onChange,
	className,
	placeholder,
	disabled = false,
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		const updateDropdownPosition = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setDropdownStyle({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
				});
			}
		};

		if (isOpen) {
			updateDropdownPosition();
			window.addEventListener("scroll", updateDropdownPosition, true);
			window.addEventListener("resize", updateDropdownPosition);
		} else {
			window.removeEventListener("scroll", updateDropdownPosition, true);
			window.removeEventListener("resize", updateDropdownPosition);
		}

		return () => {
			window.removeEventListener("scroll", updateDropdownPosition, true);
			window.removeEventListener("resize", updateDropdownPosition);
		};
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (event: Event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node) &&
				!(event.target as Element).closest?.(".select-portal-dropdown")
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
		<div className={clsx("relative", className)} ref={containerRef}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setIsOpen(!isOpen)}
				className={twMerge(
					clsx(
						"select w-full flex items-center justify-between gap-2",
						!selectedOption && "text-muted-foreground",
						disabled && "opacity-50 cursor-not-allowed",
					),
					className,
				)}
			>
				<span className="truncate">
					{selectedOption ? selectedOption.label : placeholder || "Select..."}
				</span>
				<ChevronDown className="w-4 h-4 opacity-50 flex-none" />
			</button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						className="fixed min-w-[max-content] bg-popover border border-border rounded-md shadow-lg z-[9999] max-h-60 overflow-auto custom-scrollbar select-portal-dropdown mt-1"
						style={dropdownStyle}
					>
						<div className="p-1 flex flex-col gap-0.5">
							{options.map((option) => (
								<button
									type="button"
									key={option.value}
									onPointerDown={(e) => {
										// Stop propagation so it doesn't immediately close via other handlers
										e.stopPropagation();
									}}
									onClick={(e) => {
										e.stopPropagation();
										onChange(option.value);
										setIsOpen(false);
									}}
									className={clsx(
										"flex items-center justify-between w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors cursor-pointer text-popover-foreground",
										option.value === value && "bg-muted font-medium",
									)}
								>
									<span className="truncate">{option.label}</span>
									{option.value === value && (
										<Check className="w-4 h-4 text-primary ml-2 flex-none" />
									)}
								</button>
							))}
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}
