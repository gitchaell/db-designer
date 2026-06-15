import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
	size?: "default" | "sm" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "primary",
			size = "default",
			type = "button",
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				type={type}
				className={twMerge(
					"btn",
					{
						primary: "btn-primary",
						secondary: "btn-secondary",
						outline: "btn-outline",
						ghost: "btn-ghost",
						destructive: "btn-destructive",
					}[variant],
					{
						default: "",
						sm: "btn-sm",
						icon: "h-8 w-8 px-0 flex items-center justify-center",
					}[size],
					className,
				)}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";
