import Script from "next/script";

export function SchemaMarkup() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "DB Designer",
		applicationCategory: "DeveloperApplication",
		operatingSystem: "Any",
		description:
			"A powerful, web-based tool for designing database schemas with an intuitive, drag-and-drop interface.",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		author: {
			"@type": "Person",
			name: "Michaell Alavedra",
			url: "https://michaellalavedra.com",
		},
	};

	return (
		<Script
			id="schema-markup"
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Need to inject schema.org JSON-LD
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
