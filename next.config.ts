import type { NextConfig } from "next";

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	disable: process.env.NODE_ENV === "development",
});

const config: NextConfig = {};

export default withPWA(config);
