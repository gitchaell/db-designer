import { ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

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
}

export function Select({
	options,
	value,
	onChange,
	className,
	placeholder,
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className={clsx("relative", className)} ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={clsx(
					"select w-full flex items-center justify-between gap-2",
					className?.includes("select-sm") &&
						"!h-6 !px-1 !text-xs !py-0.5 !border-transparent !bg-transparent hover:!bg-muted focus:!bg-muted focus:!ring-1 focus:!ring-ring",
					!selectedOption && "text-muted-foreground",
				)}
			>
				<span className="truncate">
					{selectedOption ? selectedOption.label : placeholder || "Select..."}
				</span>
				<ChevronDown className="w-4 h-4 opacity-50 flex-none" />
			</button>

			{isOpen && (
				<div className="absolute top-full mt-1 left-0 w-full min-w-[max-content] bg-popover border border-border rounded-md shadow-lg z-[9999] max-h-60 overflow-auto custom-scrollbar">
					<div className="p-1 flex flex-col gap-0.5">
						{options.map((option) => (
							<button
								type="button"
								key={option.value}
								onClick={() => {
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
				</div>
			)}
		</div>
	);
}
