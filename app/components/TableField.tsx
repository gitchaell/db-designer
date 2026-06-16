import { clsx } from "clsx";
import { Select } from "./Select";

interface TableFieldProps {
	value: string;
	isReadOnly: boolean;
	onChange?: (value: string) => void;
	type?: "text" | "select";
	options?: { label: string; value: string }[];
	className?: string;
	readOnlyClassName?: string;
	placeholder?: string;
}

export function TableField({
	value,
	isReadOnly,
	onChange,
	type = "text",
	options,
	className,
	readOnlyClassName,
	placeholder,
}: TableFieldProps) {
	if (isReadOnly) {
		return (
			<span className={clsx("truncate", className, readOnlyClassName)}>
				{value}
			</span>
		);
	}

	if (type === "select" && options) {
		return (
			<Select
				value={value}
				onChange={(val) => onChange?.(val)}
				className={className}
				options={options}
			/>
		);
	}

	return (
		<input
			type="text"
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			className={clsx("bg-transparent focus:outline-none", className)}
			placeholder={placeholder}
		/>
	);
}
