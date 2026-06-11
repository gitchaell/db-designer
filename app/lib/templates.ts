import { v4 as uuidv4 } from "uuid";
import type { AppEdge, AppNode } from "../types";

export type TemplateDef = {
	id: string;
	name: string;
	description: string;
	create: () => { nodes: AppNode[]; edges: AppEdge[] };
};

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
		{
			id: uuidv4(),
			source: rolesId,
			target: usersId,
			sourceHandle: `sr-${rolesIdCol}`,
			targetHandle: `tl-${usersRoleIdCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: workspacesId,
			sourceHandle: `sr-${usersIdCol}`,
			targetHandle: `tl-${workspacesOwnerIdCol}`,
		},
		{
			id: uuidv4(),
			source: workspacesId,
			target: companiesId,
			sourceHandle: `sr-${workspacesIdCol}`,
			targetHandle: `tl-${companiesWorkspaceIdCol}`,
		},
		{
			id: uuidv4(),
			source: companiesId,
			target: departmentsId,
			sourceHandle: `sr-${companiesIdCol}`,
			targetHandle: `tl-${departmentsCompanyIdCol}`,
		},
		{
			id: uuidv4(),
			source: workspacesId,
			target: subscriptionsId,
			sourceHandle: `sr-${workspacesIdCol}`,
			targetHandle: `tl-${subscriptionsWorkspaceIdCol}`,
		},
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

export const createEcommerceTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const usersId = uuidv4();
	const productsId = uuidv4();
	const categoriesId = uuidv4();
	const ordersId = uuidv4();
	const order_itemsId = uuidv4();
	const reviewsId = uuidv4();
	const users_idCol = uuidv4();
	const users_emailCol = uuidv4();
	const users_passwordCol = uuidv4();
	const products_idCol = uuidv4();
	const products_nameCol = uuidv4();
	const products_priceCol = uuidv4();
	const products_stockCol = uuidv4();
	const products_category_idCol = uuidv4();
	const categories_idCol = uuidv4();
	const categories_nameCol = uuidv4();
	const orders_idCol = uuidv4();
	const orders_user_idCol = uuidv4();
	const orders_totalCol = uuidv4();
	const orders_statusCol = uuidv4();
	const order_items_idCol = uuidv4();
	const order_items_order_idCol = uuidv4();
	const order_items_product_idCol = uuidv4();
	const order_items_quantityCol = uuidv4();
	const order_items_priceCol = uuidv4();
	const reviews_idCol = uuidv4();
	const reviews_user_idCol = uuidv4();
	const reviews_product_idCol = uuidv4();
	const reviews_ratingCol = uuidv4();
	const reviews_commentCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{
						id: users_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: users_emailCol,
						name: "email",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: users_passwordCol,
						name: "password",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: productsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "products",
				columns: [
					{
						id: products_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: products_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: products_priceCol,
						name: "price",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: products_stockCol,
						name: "stock",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: products_category_idCol,
						name: "category_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: categoriesId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "categories",
				columns: [
					{
						id: categories_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: categories_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: ordersId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "orders",
				columns: [
					{
						id: orders_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: orders_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: orders_totalCol,
						name: "total",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: orders_statusCol,
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: order_itemsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "order_items",
				columns: [
					{
						id: order_items_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: order_items_order_idCol,
						name: "order_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: order_items_product_idCol,
						name: "product_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: order_items_quantityCol,
						name: "quantity",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: order_items_priceCol,
						name: "price",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: reviewsId,
			type: "table",
			position: { x: 900, y: 500 },
			data: {
				label: "reviews",
				columns: [
					{
						id: reviews_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: reviews_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: reviews_product_idCol,
						name: "product_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: reviews_ratingCol,
						name: "rating",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: reviews_commentCol,
						name: "comment",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: categoriesId,
			target: productsId,
			sourceHandle: `sr-${categories_idCol}`,
			targetHandle: `tl-${products_category_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: ordersId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${orders_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: ordersId,
			target: order_itemsId,
			sourceHandle: `sr-${orders_idCol}`,
			targetHandle: `tl-${order_items_order_idCol}`,
		},
		{
			id: uuidv4(),
			source: productsId,
			target: order_itemsId,
			sourceHandle: `sr-${products_idCol}`,
			targetHandle: `tl-${order_items_product_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: reviewsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${reviews_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: productsId,
			target: reviewsId,
			sourceHandle: `sr-${products_idCol}`,
			targetHandle: `tl-${reviews_product_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createBlogTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const usersId = uuidv4();
	const postsId = uuidv4();
	const commentsId = uuidv4();
	const tagsId = uuidv4();
	const post_tagsId = uuidv4();
	const users_idCol = uuidv4();
	const users_usernameCol = uuidv4();
	const users_emailCol = uuidv4();
	const posts_idCol = uuidv4();
	const posts_author_idCol = uuidv4();
	const posts_titleCol = uuidv4();
	const posts_contentCol = uuidv4();
	const posts_published_atCol = uuidv4();
	const comments_idCol = uuidv4();
	const comments_post_idCol = uuidv4();
	const comments_user_idCol = uuidv4();
	const comments_contentCol = uuidv4();
	const tags_idCol = uuidv4();
	const tags_nameCol = uuidv4();
	const post_tags_idCol = uuidv4();
	const post_tags_post_idCol = uuidv4();
	const post_tags_tag_idCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{
						id: users_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: users_usernameCol,
						name: "username",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: users_emailCol,
						name: "email",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: postsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "posts",
				columns: [
					{
						id: posts_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: posts_author_idCol,
						name: "author_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: posts_titleCol,
						name: "title",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: posts_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
					{
						id: posts_published_atCol,
						name: "published_at",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: commentsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "comments",
				columns: [
					{
						id: comments_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: comments_post_idCol,
						name: "post_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: comments_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: comments_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: tagsId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "tags",
				columns: [
					{
						id: tags_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: tags_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: post_tagsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "post_tags",
				columns: [
					{
						id: post_tags_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: post_tags_post_idCol,
						name: "post_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: post_tags_tag_idCol,
						name: "tag_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: usersId,
			target: postsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${posts_author_idCol}`,
		},
		{
			id: uuidv4(),
			source: postsId,
			target: commentsId,
			sourceHandle: `sr-${posts_idCol}`,
			targetHandle: `tl-${comments_post_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: commentsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${comments_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: postsId,
			target: post_tagsId,
			sourceHandle: `sr-${posts_idCol}`,
			targetHandle: `tl-${post_tags_post_idCol}`,
		},
		{
			id: uuidv4(),
			source: tagsId,
			target: post_tagsId,
			sourceHandle: `sr-${tags_idCol}`,
			targetHandle: `tl-${post_tags_tag_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createSocialTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const usersId = uuidv4();
	const postsId = uuidv4();
	const commentsId = uuidv4();
	const likesId = uuidv4();
	const followsId = uuidv4();
	const messagesId = uuidv4();
	const users_idCol = uuidv4();
	const users_usernameCol = uuidv4();
	const users_bioCol = uuidv4();
	const posts_idCol = uuidv4();
	const posts_user_idCol = uuidv4();
	const posts_contentCol = uuidv4();
	const comments_idCol = uuidv4();
	const comments_post_idCol = uuidv4();
	const comments_user_idCol = uuidv4();
	const comments_contentCol = uuidv4();
	const likes_idCol = uuidv4();
	const likes_post_idCol = uuidv4();
	const likes_user_idCol = uuidv4();
	const follows_idCol = uuidv4();
	const follows_follower_idCol = uuidv4();
	const follows_following_idCol = uuidv4();
	const messages_idCol = uuidv4();
	const messages_sender_idCol = uuidv4();
	const messages_receiver_idCol = uuidv4();
	const messages_contentCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{
						id: users_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: users_usernameCol,
						name: "username",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: users_bioCol,
						name: "bio",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: postsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "posts",
				columns: [
					{
						id: posts_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: posts_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: posts_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: commentsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "comments",
				columns: [
					{
						id: comments_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: comments_post_idCol,
						name: "post_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: comments_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: comments_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: likesId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "likes",
				columns: [
					{
						id: likes_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: likes_post_idCol,
						name: "post_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: likes_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: followsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "follows",
				columns: [
					{
						id: follows_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: follows_follower_idCol,
						name: "follower_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: follows_following_idCol,
						name: "following_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: messagesId,
			type: "table",
			position: { x: 900, y: 500 },
			data: {
				label: "messages",
				columns: [
					{
						id: messages_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: messages_sender_idCol,
						name: "sender_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: messages_receiver_idCol,
						name: "receiver_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: messages_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: usersId,
			target: postsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${posts_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: postsId,
			target: commentsId,
			sourceHandle: `sr-${posts_idCol}`,
			targetHandle: `tl-${comments_post_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: commentsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${comments_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: postsId,
			target: likesId,
			sourceHandle: `sr-${posts_idCol}`,
			targetHandle: `tl-${likes_post_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: likesId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${likes_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: followsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${follows_follower_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: followsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${follows_following_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: messagesId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${messages_sender_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: messagesId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${messages_receiver_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createPmTemplate = (): { nodes: AppNode[]; edges: AppEdge[] } => {
	const usersId = uuidv4();
	const projectsId = uuidv4();
	const tasksId = uuidv4();
	const commentsId = uuidv4();
	const labelsId = uuidv4();
	const task_labelsId = uuidv4();
	const users_idCol = uuidv4();
	const users_nameCol = uuidv4();
	const users_emailCol = uuidv4();
	const projects_idCol = uuidv4();
	const projects_nameCol = uuidv4();
	const projects_owner_idCol = uuidv4();
	const tasks_idCol = uuidv4();
	const tasks_project_idCol = uuidv4();
	const tasks_assignee_idCol = uuidv4();
	const tasks_titleCol = uuidv4();
	const tasks_statusCol = uuidv4();
	const comments_idCol = uuidv4();
	const comments_task_idCol = uuidv4();
	const comments_user_idCol = uuidv4();
	const comments_contentCol = uuidv4();
	const labels_idCol = uuidv4();
	const labels_nameCol = uuidv4();
	const labels_colorCol = uuidv4();
	const task_labels_idCol = uuidv4();
	const task_labels_task_idCol = uuidv4();
	const task_labels_label_idCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{
						id: users_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: users_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: users_emailCol,
						name: "email",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: projectsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "projects",
				columns: [
					{
						id: projects_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: projects_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: projects_owner_idCol,
						name: "owner_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: tasksId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "tasks",
				columns: [
					{
						id: tasks_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: tasks_project_idCol,
						name: "project_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: tasks_assignee_idCol,
						name: "assignee_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: tasks_titleCol,
						name: "title",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: tasks_statusCol,
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: commentsId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "comments",
				columns: [
					{
						id: comments_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: comments_task_idCol,
						name: "task_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: comments_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: comments_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: labelsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "labels",
				columns: [
					{
						id: labels_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: labels_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: labels_colorCol,
						name: "color",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: task_labelsId,
			type: "table",
			position: { x: 900, y: 500 },
			data: {
				label: "task_labels",
				columns: [
					{
						id: task_labels_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: task_labels_task_idCol,
						name: "task_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: task_labels_label_idCol,
						name: "label_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: usersId,
			target: projectsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${projects_owner_idCol}`,
		},
		{
			id: uuidv4(),
			source: projectsId,
			target: tasksId,
			sourceHandle: `sr-${projects_idCol}`,
			targetHandle: `tl-${tasks_project_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: tasksId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${tasks_assignee_idCol}`,
		},
		{
			id: uuidv4(),
			source: tasksId,
			target: commentsId,
			sourceHandle: `sr-${tasks_idCol}`,
			targetHandle: `tl-${comments_task_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: commentsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${comments_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: tasksId,
			target: task_labelsId,
			sourceHandle: `sr-${tasks_idCol}`,
			targetHandle: `tl-${task_labels_task_idCol}`,
		},
		{
			id: uuidv4(),
			source: labelsId,
			target: task_labelsId,
			sourceHandle: `sr-${labels_idCol}`,
			targetHandle: `tl-${task_labels_label_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createInventoryTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const productsId = uuidv4();
	const suppliersId = uuidv4();
	const warehousesId = uuidv4();
	const inventoryId = uuidv4();
	const movementsId = uuidv4();
	const products_idCol = uuidv4();
	const products_skuCol = uuidv4();
	const products_nameCol = uuidv4();
	const products_supplier_idCol = uuidv4();
	const suppliers_idCol = uuidv4();
	const suppliers_nameCol = uuidv4();
	const suppliers_contactCol = uuidv4();
	const warehouses_idCol = uuidv4();
	const warehouses_nameCol = uuidv4();
	const warehouses_locationCol = uuidv4();
	const inventory_idCol = uuidv4();
	const inventory_product_idCol = uuidv4();
	const inventory_warehouse_idCol = uuidv4();
	const inventory_quantityCol = uuidv4();
	const movements_idCol = uuidv4();
	const movements_product_idCol = uuidv4();
	const movements_from_warehouse_idCol = uuidv4();
	const movements_to_warehouse_idCol = uuidv4();
	const movements_quantityCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: productsId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "products",
				columns: [
					{
						id: products_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: products_skuCol,
						name: "sku",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: products_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: products_supplier_idCol,
						name: "supplier_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: suppliersId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "suppliers",
				columns: [
					{
						id: suppliers_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: suppliers_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: suppliers_contactCol,
						name: "contact",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: warehousesId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "warehouses",
				columns: [
					{
						id: warehouses_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: warehouses_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: warehouses_locationCol,
						name: "location",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: inventoryId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "inventory",
				columns: [
					{
						id: inventory_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: inventory_product_idCol,
						name: "product_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: inventory_warehouse_idCol,
						name: "warehouse_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: inventory_quantityCol,
						name: "quantity",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: movementsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "movements",
				columns: [
					{
						id: movements_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: movements_product_idCol,
						name: "product_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: movements_from_warehouse_idCol,
						name: "from_warehouse_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: movements_to_warehouse_idCol,
						name: "to_warehouse_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: movements_quantityCol,
						name: "quantity",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: suppliersId,
			target: productsId,
			sourceHandle: `sr-${suppliers_idCol}`,
			targetHandle: `tl-${products_supplier_idCol}`,
		},
		{
			id: uuidv4(),
			source: productsId,
			target: inventoryId,
			sourceHandle: `sr-${products_idCol}`,
			targetHandle: `tl-${inventory_product_idCol}`,
		},
		{
			id: uuidv4(),
			source: warehousesId,
			target: inventoryId,
			sourceHandle: `sr-${warehouses_idCol}`,
			targetHandle: `tl-${inventory_warehouse_idCol}`,
		},
		{
			id: uuidv4(),
			source: productsId,
			target: movementsId,
			sourceHandle: `sr-${products_idCol}`,
			targetHandle: `tl-${movements_product_idCol}`,
		},
		{
			id: uuidv4(),
			source: warehousesId,
			target: movementsId,
			sourceHandle: `sr-${warehouses_idCol}`,
			targetHandle: `tl-${movements_from_warehouse_idCol}`,
		},
		{
			id: uuidv4(),
			source: warehousesId,
			target: movementsId,
			sourceHandle: `sr-${warehouses_idCol}`,
			targetHandle: `tl-${movements_to_warehouse_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createClinicTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const patientsId = uuidv4();
	const doctorsId = uuidv4();
	const appointmentsId = uuidv4();
	const medical_recordsId = uuidv4();
	const prescriptionsId = uuidv4();
	const patients_idCol = uuidv4();
	const patients_nameCol = uuidv4();
	const patients_dobCol = uuidv4();
	const doctors_idCol = uuidv4();
	const doctors_nameCol = uuidv4();
	const doctors_specialtyCol = uuidv4();
	const appointments_idCol = uuidv4();
	const appointments_patient_idCol = uuidv4();
	const appointments_doctor_idCol = uuidv4();
	const appointments_dateCol = uuidv4();
	const appointments_statusCol = uuidv4();
	const medical_records_idCol = uuidv4();
	const medical_records_patient_idCol = uuidv4();
	const medical_records_doctor_idCol = uuidv4();
	const medical_records_notesCol = uuidv4();
	const prescriptions_idCol = uuidv4();
	const prescriptions_record_idCol = uuidv4();
	const prescriptions_medicationCol = uuidv4();
	const prescriptions_dosageCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: patientsId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "patients",
				columns: [
					{
						id: patients_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: patients_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: patients_dobCol,
						name: "dob",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: doctorsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "doctors",
				columns: [
					{
						id: doctors_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: doctors_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: doctors_specialtyCol,
						name: "specialty",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: appointmentsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "appointments",
				columns: [
					{
						id: appointments_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: appointments_patient_idCol,
						name: "patient_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: appointments_doctor_idCol,
						name: "doctor_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: appointments_dateCol,
						name: "date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
					{
						id: appointments_statusCol,
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: medical_recordsId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "medical_records",
				columns: [
					{
						id: medical_records_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: medical_records_patient_idCol,
						name: "patient_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: medical_records_doctor_idCol,
						name: "doctor_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: medical_records_notesCol,
						name: "notes",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: prescriptionsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "prescriptions",
				columns: [
					{
						id: prescriptions_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: prescriptions_record_idCol,
						name: "record_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: prescriptions_medicationCol,
						name: "medication",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: prescriptions_dosageCol,
						name: "dosage",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: patientsId,
			target: appointmentsId,
			sourceHandle: `sr-${patients_idCol}`,
			targetHandle: `tl-${appointments_patient_idCol}`,
		},
		{
			id: uuidv4(),
			source: doctorsId,
			target: appointmentsId,
			sourceHandle: `sr-${doctors_idCol}`,
			targetHandle: `tl-${appointments_doctor_idCol}`,
		},
		{
			id: uuidv4(),
			source: patientsId,
			target: medical_recordsId,
			sourceHandle: `sr-${patients_idCol}`,
			targetHandle: `tl-${medical_records_patient_idCol}`,
		},
		{
			id: uuidv4(),
			source: doctorsId,
			target: medical_recordsId,
			sourceHandle: `sr-${doctors_idCol}`,
			targetHandle: `tl-${medical_records_doctor_idCol}`,
		},
		{
			id: uuidv4(),
			source: medical_recordsId,
			target: prescriptionsId,
			sourceHandle: `sr-${medical_records_idCol}`,
			targetHandle: `tl-${prescriptions_record_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createLmsTemplate = (): { nodes: AppNode[]; edges: AppEdge[] } => {
	const usersId = uuidv4();
	const coursesId = uuidv4();
	const enrollmentsId = uuidv4();
	const lessonsId = uuidv4();
	const quizzesId = uuidv4();
	const users_idCol = uuidv4();
	const users_nameCol = uuidv4();
	const users_roleCol = uuidv4();
	const courses_idCol = uuidv4();
	const courses_titleCol = uuidv4();
	const courses_instructor_idCol = uuidv4();
	const enrollments_idCol = uuidv4();
	const enrollments_student_idCol = uuidv4();
	const enrollments_course_idCol = uuidv4();
	const enrollments_progressCol = uuidv4();
	const lessons_idCol = uuidv4();
	const lessons_course_idCol = uuidv4();
	const lessons_titleCol = uuidv4();
	const lessons_contentCol = uuidv4();
	const quizzes_idCol = uuidv4();
	const quizzes_lesson_idCol = uuidv4();
	const quizzes_titleCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{
						id: users_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: users_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: users_roleCol,
						name: "role",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: coursesId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "courses",
				columns: [
					{
						id: courses_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: courses_titleCol,
						name: "title",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: courses_instructor_idCol,
						name: "instructor_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
				],
			},
		},
		{
			id: enrollmentsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "enrollments",
				columns: [
					{
						id: enrollments_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: enrollments_student_idCol,
						name: "student_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: enrollments_course_idCol,
						name: "course_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: enrollments_progressCol,
						name: "progress",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: lessonsId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "lessons",
				columns: [
					{
						id: lessons_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: lessons_course_idCol,
						name: "course_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: lessons_titleCol,
						name: "title",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: lessons_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: quizzesId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "quizzes",
				columns: [
					{
						id: quizzes_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: quizzes_lesson_idCol,
						name: "lesson_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: quizzes_titleCol,
						name: "title",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: usersId,
			target: coursesId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${courses_instructor_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: enrollmentsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${enrollments_student_idCol}`,
		},
		{
			id: uuidv4(),
			source: coursesId,
			target: enrollmentsId,
			sourceHandle: `sr-${courses_idCol}`,
			targetHandle: `tl-${enrollments_course_idCol}`,
		},
		{
			id: uuidv4(),
			source: coursesId,
			target: lessonsId,
			sourceHandle: `sr-${courses_idCol}`,
			targetHandle: `tl-${lessons_course_idCol}`,
		},
		{
			id: uuidv4(),
			source: lessonsId,
			target: quizzesId,
			sourceHandle: `sr-${lessons_idCol}`,
			targetHandle: `tl-${quizzes_lesson_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createRealestateTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const agentsId = uuidv4();
	const propertiesId = uuidv4();
	const clientsId = uuidv4();
	const showingsId = uuidv4();
	const transactionsId = uuidv4();
	const agents_idCol = uuidv4();
	const agents_nameCol = uuidv4();
	const agents_phoneCol = uuidv4();
	const properties_idCol = uuidv4();
	const properties_addressCol = uuidv4();
	const properties_priceCol = uuidv4();
	const properties_agent_idCol = uuidv4();
	const properties_statusCol = uuidv4();
	const clients_idCol = uuidv4();
	const clients_nameCol = uuidv4();
	const clients_budgetCol = uuidv4();
	const showings_idCol = uuidv4();
	const showings_property_idCol = uuidv4();
	const showings_client_idCol = uuidv4();
	const showings_dateCol = uuidv4();
	const transactions_idCol = uuidv4();
	const transactions_property_idCol = uuidv4();
	const transactions_client_idCol = uuidv4();
	const transactions_agent_idCol = uuidv4();
	const transactions_amountCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: agentsId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "agents",
				columns: [
					{
						id: agents_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: agents_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: agents_phoneCol,
						name: "phone",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: propertiesId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "properties",
				columns: [
					{
						id: properties_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: properties_addressCol,
						name: "address",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: properties_priceCol,
						name: "price",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: properties_agent_idCol,
						name: "agent_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: properties_statusCol,
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: clientsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "clients",
				columns: [
					{
						id: clients_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: clients_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: clients_budgetCol,
						name: "budget",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: showingsId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "showings",
				columns: [
					{
						id: showings_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: showings_property_idCol,
						name: "property_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: showings_client_idCol,
						name: "client_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: showings_dateCol,
						name: "date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: transactionsId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "transactions",
				columns: [
					{
						id: transactions_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: transactions_property_idCol,
						name: "property_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: transactions_client_idCol,
						name: "client_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: transactions_agent_idCol,
						name: "agent_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: transactions_amountCol,
						name: "amount",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: agentsId,
			target: propertiesId,
			sourceHandle: `sr-${agents_idCol}`,
			targetHandle: `tl-${properties_agent_idCol}`,
		},
		{
			id: uuidv4(),
			source: propertiesId,
			target: showingsId,
			sourceHandle: `sr-${properties_idCol}`,
			targetHandle: `tl-${showings_property_idCol}`,
		},
		{
			id: uuidv4(),
			source: clientsId,
			target: showingsId,
			sourceHandle: `sr-${clients_idCol}`,
			targetHandle: `tl-${showings_client_idCol}`,
		},
		{
			id: uuidv4(),
			source: propertiesId,
			target: transactionsId,
			sourceHandle: `sr-${properties_idCol}`,
			targetHandle: `tl-${transactions_property_idCol}`,
		},
		{
			id: uuidv4(),
			source: clientsId,
			target: transactionsId,
			sourceHandle: `sr-${clients_idCol}`,
			targetHandle: `tl-${transactions_client_idCol}`,
		},
		{
			id: uuidv4(),
			source: agentsId,
			target: transactionsId,
			sourceHandle: `sr-${agents_idCol}`,
			targetHandle: `tl-${transactions_agent_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createCrmTemplate = (): { nodes: AppNode[]; edges: AppEdge[] } => {
	const companiesId = uuidv4();
	const contactsId = uuidv4();
	const dealsId = uuidv4();
	const activitiesId = uuidv4();
	const notesId = uuidv4();
	const companies_idCol = uuidv4();
	const companies_nameCol = uuidv4();
	const companies_industryCol = uuidv4();
	const contacts_idCol = uuidv4();
	const contacts_company_idCol = uuidv4();
	const contacts_nameCol = uuidv4();
	const contacts_emailCol = uuidv4();
	const deals_idCol = uuidv4();
	const deals_company_idCol = uuidv4();
	const deals_valueCol = uuidv4();
	const deals_stageCol = uuidv4();
	const activities_idCol = uuidv4();
	const activities_contact_idCol = uuidv4();
	const activities_typeCol = uuidv4();
	const activities_dateCol = uuidv4();
	const notes_idCol = uuidv4();
	const notes_deal_idCol = uuidv4();
	const notes_contentCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: companiesId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "companies",
				columns: [
					{
						id: companies_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: companies_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: companies_industryCol,
						name: "industry",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: contactsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "contacts",
				columns: [
					{
						id: contacts_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: contacts_company_idCol,
						name: "company_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: contacts_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: contacts_emailCol,
						name: "email",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: dealsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "deals",
				columns: [
					{
						id: deals_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: deals_company_idCol,
						name: "company_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: deals_valueCol,
						name: "value",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: deals_stageCol,
						name: "stage",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: activitiesId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "activities",
				columns: [
					{
						id: activities_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: activities_contact_idCol,
						name: "contact_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: activities_typeCol,
						name: "type",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: activities_dateCol,
						name: "date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: notesId,
			type: "table",
			position: { x: 500, y: 500 },
			data: {
				label: "notes",
				columns: [
					{
						id: notes_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: notes_deal_idCol,
						name: "deal_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: notes_contentCol,
						name: "content",
						type: "text",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: companiesId,
			target: contactsId,
			sourceHandle: `sr-${companies_idCol}`,
			targetHandle: `tl-${contacts_company_idCol}`,
		},
		{
			id: uuidv4(),
			source: companiesId,
			target: dealsId,
			sourceHandle: `sr-${companies_idCol}`,
			targetHandle: `tl-${deals_company_idCol}`,
		},
		{
			id: uuidv4(),
			source: contactsId,
			target: activitiesId,
			sourceHandle: `sr-${contacts_idCol}`,
			targetHandle: `tl-${activities_contact_idCol}`,
		},
		{
			id: uuidv4(),
			source: dealsId,
			target: notesId,
			sourceHandle: `sr-${deals_idCol}`,
			targetHandle: `tl-${notes_deal_idCol}`,
		},
	];
	return { nodes, edges };
};
export const createBookingTemplate = (): {
	nodes: AppNode[];
	edges: AppEdge[];
} => {
	const usersId = uuidv4();
	const hotelsId = uuidv4();
	const roomsId = uuidv4();
	const bookingsId = uuidv4();
	const paymentsId = uuidv4();
	const users_idCol = uuidv4();
	const users_nameCol = uuidv4();
	const users_emailCol = uuidv4();
	const hotels_idCol = uuidv4();
	const hotels_nameCol = uuidv4();
	const hotels_locationCol = uuidv4();
	const rooms_idCol = uuidv4();
	const rooms_hotel_idCol = uuidv4();
	const rooms_numberCol = uuidv4();
	const rooms_price_per_nightCol = uuidv4();
	const bookings_idCol = uuidv4();
	const bookings_user_idCol = uuidv4();
	const bookings_room_idCol = uuidv4();
	const bookings_start_dateCol = uuidv4();
	const bookings_end_dateCol = uuidv4();
	const payments_idCol = uuidv4();
	const payments_booking_idCol = uuidv4();
	const payments_amountCol = uuidv4();
	const payments_statusCol = uuidv4();
	const nodes: AppNode[] = [
		{
			id: usersId,
			type: "table",
			position: { x: 100, y: 100 },
			data: {
				label: "users",
				columns: [
					{
						id: users_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: users_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: users_emailCol,
						name: "email",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: hotelsId,
			type: "table",
			position: { x: 500, y: 100 },
			data: {
				label: "hotels",
				columns: [
					{
						id: hotels_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: hotels_nameCol,
						name: "name",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: hotels_locationCol,
						name: "location",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: roomsId,
			type: "table",
			position: { x: 900, y: 100 },
			data: {
				label: "rooms",
				columns: [
					{
						id: rooms_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: rooms_hotel_idCol,
						name: "hotel_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: rooms_numberCol,
						name: "number",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
					{
						id: rooms_price_per_nightCol,
						name: "price_per_night",
						type: "int",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
		{
			id: bookingsId,
			type: "table",
			position: { x: 100, y: 500 },
			data: {
				label: "bookings",
				columns: [
					{
						id: bookings_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: bookings_user_idCol,
						name: "user_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: bookings_room_idCol,
						name: "room_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: bookings_start_dateCol,
						name: "start_date",
						type: "timestamp",
						isPk: false,
						isFk: false,
					},
					{
						id: bookings_end_dateCol,
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
			position: { x: 500, y: 500 },
			data: {
				label: "payments",
				columns: [
					{
						id: payments_idCol,
						name: "id",
						type: "uuid",
						isPk: true,
						isFk: false,
					},
					{
						id: payments_booking_idCol,
						name: "booking_id",
						type: "uuid",
						isPk: false,
						isFk: true,
					},
					{
						id: payments_amountCol,
						name: "amount",
						type: "int",
						isPk: false,
						isFk: false,
					},
					{
						id: payments_statusCol,
						name: "status",
						type: "varchar",
						isPk: false,
						isFk: false,
					},
				],
			},
		},
	];
	const edges: AppEdge[] = [
		{
			id: uuidv4(),
			source: hotelsId,
			target: roomsId,
			sourceHandle: `sr-${hotels_idCol}`,
			targetHandle: `tl-${rooms_hotel_idCol}`,
		},
		{
			id: uuidv4(),
			source: usersId,
			target: bookingsId,
			sourceHandle: `sr-${users_idCol}`,
			targetHandle: `tl-${bookings_user_idCol}`,
		},
		{
			id: uuidv4(),
			source: roomsId,
			target: bookingsId,
			sourceHandle: `sr-${rooms_idCol}`,
			targetHandle: `tl-${bookings_room_idCol}`,
		},
		{
			id: uuidv4(),
			source: bookingsId,
			target: paymentsId,
			sourceHandle: `sr-${bookings_idCol}`,
			targetHandle: `tl-${payments_booking_idCol}`,
		},
	];
	return { nodes, edges };
};
export const templates: TemplateDef[] = [
	{
		id: "saas",
		name: "SaaS Starter Kit",
		description: "Multi-tenant architecture with subscriptions and RBAC",
		create: createSaaSTemplate,
	},
	{
		id: "ecommerce",
		name: "E-Commerce",
		description: "Standard online store with products, orders, and reviews.",
		create: createEcommerceTemplate,
	},
	{
		id: "blog",
		name: "Blog / CMS",
		description: "Content management system with posts, comments, and tags.",
		create: createBlogTemplate,
	},
	{
		id: "social",
		name: "Social Network",
		description:
			"Social media platform with follows, posts, likes, and messages.",
		create: createSocialTemplate,
	},
	{
		id: "pm",
		name: "Project Management",
		description: "Task and project tracking with labels and comments.",
		create: createPmTemplate,
	},
	{
		id: "inventory",
		name: "Inventory Management",
		description: "Track products, suppliers, warehouses, and stock movements.",
		create: createInventoryTemplate,
	},
	{
		id: "clinic",
		name: "Healthcare Clinic",
		description: "Manage patients, doctors, appointments, and prescriptions.",
		create: createClinicTemplate,
	},
	{
		id: "lms",
		name: "Education / LMS",
		description:
			"Learning management system with courses, enrollments, and lessons.",
		create: createLmsTemplate,
	},
	{
		id: "realestate",
		name: "Real Estate",
		description: "Property listings, agents, clients, and showings.",
		create: createRealestateTemplate,
	},
	{
		id: "crm",
		name: "CRM",
		description:
			"Customer relationship management with companies, contacts, and deals.",
		create: createCrmTemplate,
	},
	{
		id: "booking",
		name: "Booking System",
		description:
			"Travel and accommodation booking with hotels, rooms, and payments.",
		create: createBookingTemplate,
	},
];
