import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DB Designer - Database Schema Designer",
	description:
		"A powerful, web-based tool for designing database schemas with an intuitive, drag-and-drop interface. Create, edit, and export your database designs easily.",
	keywords: [
		"database",
		"schema",
		"designer",
		"ERD",
		"entity relationship diagram",
		"SQL",
		"web application",
	],
	authors: [{ name: "Michaell Alavedra", url: "https://michaellalavedra.com" }],
	openGraph: {
		title: "DB Designer - Database Schema Designer",
		description:
			"A powerful, web-based tool for designing database schemas with an intuitive, drag-and-drop interface.",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground transition-colors duration-300`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<div className="noise-overlay" />
					{children}
					<SchemaMarkup />
				</ThemeProvider>
			</body>
		</html>
	);
}
