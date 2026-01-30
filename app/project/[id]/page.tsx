import Editor from "@/app/components/Editor";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<main className="h-screen w-screen bg-zinc-950 overflow-hidden">
			<Editor projectId={id} />
		</main>
	);
}
