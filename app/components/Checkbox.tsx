import { clsx } from "clsx";
import { Check } from "lucide-react";

interface CheckboxProps {
	id?: string;
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	className?: string;
}

export function Checkbox({
	id,
	checked,
	onChange,
	disabled = false,
	className,
}: CheckboxProps) {
	return (
		<div className={clsx("relative flex items-center", className)}>
			<input
				type="checkbox"
				id={id}
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				className="peer sr-only"
			/>
			<div
				className={clsx(
					"h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-all duration-200 cursor-pointer",
					"peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
					disabled && "cursor-not-allowed opacity-50",
					checked ? "bg-primary text-primary-foreground" : "bg-transparent",
				)}
			>
				{checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
			</div>
		</div>
	);
}
