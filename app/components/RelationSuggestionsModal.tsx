"use client";

import { Check, Link, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
	findMissingRelations,
	type SuggestedRelation,
} from "@/app/lib/relation-suggestions";
import { useStore } from "@/app/store/useStore";
import { Button } from "./Button";
import { FloatingWindow } from "./FloatingWindow";

interface RelationSuggestionsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function RelationSuggestionsModal({
	isOpen,
	onClose,
}: RelationSuggestionsModalProps) {
	const { nodes, edges, onConnect } = useStore();
	const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

	const suggestions = useMemo(() => {
		if (!isOpen) return [];
		return findMissingRelations(nodes, edges);
	}, [nodes, edges, isOpen]);

	const handleConnect = (sug: SuggestedRelation) => {
		onConnect({
			source: sug.sourceNodeId,
			target: sug.targetNodeId,
			sourceHandle: `sr-${sug.sourceColId}`,
			targetHandle: `tl-${sug.targetColId}`,
		});
		setConnectedIds((prev) => new Set(prev).add(sug.id));
	};

	const handleConnectAll = () => {
		for (const sug of suggestions) {
			if (!connectedIds.has(sug.id)) {
				handleConnect(sug);
			}
		}
	};

	const activeSuggestions = suggestions.filter((s) => !connectedIds.has(s.id));

	return (
		<FloatingWindow
			isOpen={isOpen}
			onClose={onClose}
			title="Smart Relation Suggestions"
			subtitle="Intelligent analysis of missing primary key and foreign key relationships"
			icon={<Sparkles className="w-5 h-5 text-amber-500" />}
			defaultPosition={{ x: 160, y: 80 }}
			className="w-[640px]"
		>
			{/* Header Actions */}
			{activeSuggestions.length > 0 && (
				<div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/60">
					<span className="text-xs font-semibold text-muted-foreground">
						Found <b>{activeSuggestions.length}</b> potential missing relation
						{activeSuggestions.length > 1 ? "s" : ""}
					</span>
					<Button size="sm" onClick={handleConnectAll}>
						<Wand2 className="w-3.5 h-3.5 mr-1.5" /> Connect All Suggestions
					</Button>
				</div>
			)}

			{/* List of Suggestions */}
			<div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5 max-h-[55vh] pr-1">
				{activeSuggestions.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-8 text-center gap-3 bg-muted/20 rounded-xl border border-dashed border-border">
						<Check className="w-8 h-8 text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full" />
						<div className="flex flex-col gap-1">
							<h3 className="text-sm font-bold text-foreground">
								No Missing Relationships Detected!
							</h3>
							<p className="text-xs text-muted-foreground">
								All explicit foreign key relationships and matching column
								references are already connected.
							</p>
						</div>
					</div>
				) : (
					activeSuggestions.map((sug) => (
						<div
							key={sug.id}
							className="p-3 bg-background border border-border rounded-xl flex items-center justify-between gap-3 hover:border-primary/50 transition-colors shadow-2xs"
						>
							<div className="flex flex-col gap-1 min-w-0 flex-1">
								<div className="flex items-center gap-2 text-xs font-bold font-mono text-foreground flex-wrap">
									<span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
										{sug.sourceNodeLabel}.{sug.sourceColName}
									</span>
									<Link className="w-3.5 h-3.5 text-muted-foreground flex-none" />
									<span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">
										{sug.targetNodeLabel}.{sug.targetColName}
									</span>
								</div>
								<p className="text-[11px] text-muted-foreground leading-snug">
									{sug.reason}
								</p>
							</div>

							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleConnect(sug)}
								className="flex-none text-xs h-8"
							>
								<Link className="w-3.5 h-3.5 mr-1.5 text-primary" /> Connect
							</Button>
						</div>
					))
				)}
			</div>
		</FloatingWindow>
	);
}
