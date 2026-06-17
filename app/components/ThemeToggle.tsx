"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "./Button";

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-8 h-8" />; // placeholder
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={(e) => {
				e.stopPropagation();
				setTheme(theme === "dark" ? "light" : "dark")
			}}
			title="Toggle theme"
			className={className}
		>
			{theme === "dark" ? (
				<Sun className="w-4 h-4 transition-all" />
			) : (
				<Moon className="w-4 h-4 transition-all" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
