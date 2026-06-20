import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { ThemeProvider } from "./components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
	themeColor: "#000000",
};

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
	icons: {
		icon: "/favicon.svg",
		apple: "apple-icon-png",
	},
	authors: [{ name: "Michaell Alavedra", url: "https://michaellalavedra.com" }],
	openGraph: {
		title: "DB Designer - Database Schema Designer",
		description:
			"A powerful, web-based tool for designing database schemas with an intuitive, drag-and-drop interface.",
		type: "website",
		images: [
			{
				url: "https://db.michaellalavedra.com/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "DB Designer - Database Schema Designer",
			},
		],
		url: "https://db.michaellalavedra.com",
	},
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "DB Designer",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					async
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6658566277779286"
					crossOrigin="anonymous"
				/>
			</head>
			<body
				className={`${GeistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
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
