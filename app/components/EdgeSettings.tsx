import { useStore } from "@/app/store/useStore";
import { Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
							<select
								id="edge-type"
								value={edgeSettings.type}
								onChange={(e) =>
									updateEdgeSettings({
										type: e.target.value as EdgeSettingsType["type"],
									})
								}
								className="select w-full"
							>
								<option value="smoothstep">Smooth Step</option>
								<option value="step">Step</option>
								<option value="straight">Straight</option>
								<option value="bezier">Bezier (Curve)</option>
							</select>
						</div>

						<div className="space-y-2">
							<label htmlFor="edge-marker" className="text-xs text-muted-foreground font-medium">
								Connection End
							</label>
							<select
								id="edge-marker"
								value={edgeSettings.markerEnd || "none"}
								onChange={(e) =>
									updateEdgeSettings({
										markerEnd: e.target.value as EdgeSettingsType["markerEnd"],
									})
								}
								className="select w-full"
							>
								<option value="none">None</option>
								<option value="arrow">Arrow</option>
								<option value="one-to-many">1:N (One to Many)</option>
								<option value="many-to-many">N:M (Many to Many)</option>
								<option value="one-to-one">1:1 (One to One)</option>
							</select>
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
