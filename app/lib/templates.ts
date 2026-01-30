import { v4 as uuidv4 } from "uuid";
import type { AppEdge, AppNode } from "../types";

export const createSaaSTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const usersId = uuidv4();
	const rolesId = uuidv4();
	const workspacesId = uuidv4();
	const companiesId = uuidv4();
	const departmentsId = uuidv4();
	const subscriptionsId = uuidv4();
	const paymentsId = uuidv4();

	// Column IDs
	const usersRoleIdCol = uuidv4();
	const rolesIdCol = uuidv4();

	const workspacesOwnerIdCol = uuidv4();
	const usersIdCol = uuidv4();

	const companiesWorkspaceIdCol = uuidv4();
	const workspacesIdCol = uuidv4();

	const departmentsCompanyIdCol = uuidv4();
	const companiesIdCol = uuidv4();

	const subscriptionsWorkspaceIdCol = uuidv4();

	const paymentsSubscriptionIdCol = uuidv4();
	const subscriptionsIdCol = uuidv4();

	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{ id: usersIdCol, name: "id", type: "uuid", isPk: true, isFk: false },
					{
						id: uuidv4(),
						name: "email",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "password_hash",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "full_name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: usersRoleIdCol,
						name: "role_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: uuidv4(),
						name: "created_at",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: rolesId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "roles",
				columns: [
					{ id: rolesIdCol, name: "id", type: "uuid", isPk: true, isFk: false },
					{
						id: uuidv4(),
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "description",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: workspacesId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "workspaces",
				columns: [
					{
						id: workspacesIdCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "slug",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: workspacesOwnerIdCol,
						name: "owner_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: uuidv4(),
						name: "created_at",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: companiesId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "companies",
				columns: [
					{
						id: companiesIdCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "address",
						type: "text",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "tax_id",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: companiesWorkspaceIdCol,
						name: "workspace_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: departmentsId,
			type: "table",
			position: { x: 900, y: 500 },
			data: {
				label: "departments",
				columns: [
					{ id: uuidv4(), name: "id", type: "uuid", isPk: true, isFk: false },
					{
						id: uuidv4(),
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: departmentsCompanyIdCol,
						name: "company_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: subscriptionsId,
			type: "table",
			position: { x: 100, y: 900 },
			data: {
				label: "subscriptions",
				columns: [
					{
						id: subscriptionsIdCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: subscriptionsWorkspaceIdCol,
						name: "workspace_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: uuidv4(),
						name: "plan",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "start_date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "end_date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: paymentsId,
			type: "table",
			position: { x: 500, y: 900 },
			data: {
				label: "payments",
				columns: [
					{ id: uuidv4(), name: "id", type: "uuid", isPk: true, isFk: false },
					{
						id: paymentsSubscriptionIdCol,
						name: "subscription_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: uuidv4(),
						name: "amount",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "currency",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: uuidv4(),
						name: "date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];

	const edges: AppEdge[] = [
		// User -> Role (Left to Right)
		{
			id: uuidv4(),
			source: rolesId,
			target: usersId,
			sourceHandle: `sr-${rolesIdCol}`,
			targetHandle: `tl-${usersRoleIdCol}`,
		},
		// Workspace -> Owner (User) (Bottom to Top -> Right to Left)
		// Assuming layout, let's default to Right -> Left for consistency, smart logic will fix on load
		{
			id: uuidv4(),
			source: usersId,
			target: workspacesId,
			sourceHandle: `sr-${usersIdCol}`,
			targetHandle: `tl-${workspacesOwnerIdCol}`,
		},
		// Company -> Workspace
		{
			id: uuidv4(),
			source: workspacesId,
			target: companiesId,
			sourceHandle: `sr-${workspacesIdCol}`,
			targetHandle: `tl-${companiesWorkspaceIdCol}`,
		},
		// Department -> Company
		{
			id: uuidv4(),
			source: companiesId,
			target: departmentsId,
			sourceHandle: `sr-${companiesIdCol}`,
			targetHandle: `tl-${departmentsCompanyIdCol}`,
		},
		// Subscription -> Workspace
		{
			id: uuidv4(),
			source: workspacesId,
			target: subscriptionsId,
			sourceHandle: `sr-${workspacesIdCol}`,
			targetHandle: `tl-${subscriptionsWorkspaceIdCol}`,
		},
		// Payment -> Subscription
		{
			id: uuidv4(),
			source: subscriptionsId,
			target: paymentsId,
			sourceHandle: `sr-${subscriptionsIdCol}`,
			targetHandle: `tl-${paymentsSubscriptionIdCol}`,
		},
	];

	return { nodes, edges };
};
