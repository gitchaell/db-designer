import { clsx } from "clsx";
import { useState } from "react";
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
	autoFocus?: boolean;
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
	autoFocus = false,
}: TableFieldProps) {
	const [isEditing, setIsEditing] = useState(autoFocus);

	if (isReadOnly) {
		return (
			<span
				style={style}
				className={clsx("truncate", className, readOnlyClassName)}
			>
				{value}
			</span>
		);
	}

	if (!isEditing) {
		return (
			<span
				tabIndex={0}
				data-tablefield="true"
				onClick={() => setIsEditing(true)}
				onFocus={() => setIsEditing(true)}
				style={style}
				className={clsx(
					"cursor-pointer truncate focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 min-h-[24px] flex items-center",
					className,
					readOnlyClassName,
				)}
			>
				{value || placeholder}
			</span>
		);
	}

	if (type === "select" && options) {
		return (
			<div onBlur={() => setIsEditing(false)} className="inline-block">
				<Select
					value={value}
					onChange={(val) => {
						onChange?.(val);
						setIsEditing(false);
					}}
					className={className}
					options={options}
				/>
			</div>
		);
	}

	return (
		<input
			type="text"
			autoFocus
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			onBlur={() => setIsEditing(false)}
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
