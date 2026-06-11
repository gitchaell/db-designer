import type { NextConfig } from "next";

// @ts-expect-error next-pwa type issue
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
});

const config: NextConfig = {
	turbopack: {},
};

export default withPWA(config);
