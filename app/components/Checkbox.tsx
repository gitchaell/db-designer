import type { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
	return (
		<input
			type="checkbox"
			className={twMerge("checkbox-custom", className)}
			{...props}
		/>
	);
}
