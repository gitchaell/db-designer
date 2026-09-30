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
	style?: React.CSSProperties;
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
	style,
}: TableFieldProps) {
	if (isReadOnly) {
		return (
			<span style={style} className={clsx("truncate", className, readOnlyClassName)}>
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
			onKeyDown={(e) => {
				if (e.key === "Enter" && type === "text") {
					e.currentTarget.dispatchEvent(
						new CustomEvent("field-enter", {
							bubbles: true,
							detail: { sourceInput: e.currentTarget },
						}),
					);
				}
			}}
			style={style}
			className={clsx("bg-transparent focus:outline-none", className)}
			placeholder={placeholder}
		/>
	);
}
