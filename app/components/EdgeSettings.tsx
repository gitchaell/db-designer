import { useStore } from "@/app/store/useStore";
import { Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Select } from "./Select";
import type { EdgeSettings as EdgeSettingsType } from "../types";

export default function EdgeSettings() {
	const { edgeSettings, updateEdgeSettings } = useStore();
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`btn btn-secondary w-9 px-0 ${isOpen ? "bg-accent text-accent-foreground" : ""}`}
				title="Edge Settings"
			>
				<Settings2 className="w-4 h-4" />
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-xl p-3 z-50">
					<h3 className="text-sm font-semibold mb-3 text-popover-foreground">
						Edge Style
					</h3>

					<div className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="edge-type"
								className="text-xs text-muted-foreground font-medium"
							>
								Type
							</label>
							<Select
								value={edgeSettings.type}
								onChange={(val) =>
									updateEdgeSettings({ type: val as EdgeSettingsType["type"] })
								}
								className="w-full"
								options={[
									{ label: "Smooth Step", value: "smoothstep" },
									{ label: "Step", value: "step" },
									{ label: "Straight", value: "straight" },
									{ label: "Bezier (Curve)", value: "bezier" },
								]}
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="edge-marker"
								className="text-xs text-muted-foreground font-medium"
							>
								Connection End
							</label>
							<Select
								value={edgeSettings.markerEnd || "none"}
								onChange={(val) =>
									updateEdgeSettings({
										markerEnd: val as EdgeSettingsType["markerEnd"],
									})
								}
								className="w-full"
								options={[
									{ label: "None", value: "none" },
									{ label: "Arrow", value: "arrow" },
								]}
							/>
						</div>

						<div className="flex items-center justify-between">
							<label
								className="text-xs text-muted-foreground font-medium cursor-pointer"
								htmlFor="relation-markers-toggle"
							>
								Show Relation Markers
							</label>
							<input
								id="relation-markers-toggle"
								type="checkbox"
								checked={edgeSettings.showRelationMarkers || false}
								onChange={(e) =>
									updateEdgeSettings({ showRelationMarkers: e.target.checked })
								}
								className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-ring"
							/>
						</div>
						<div className="flex items-center justify-between">
							<label
								className="text-xs text-muted-foreground font-medium cursor-pointer"
								htmlFor="animated-toggle"
							>
								Animated
							</label>
							<input
								id="animated-toggle"
								type="checkbox"
								checked={edgeSettings.animated}
								onChange={(e) =>
									updateEdgeSettings({ animated: e.target.checked })
								}
								className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-ring"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
