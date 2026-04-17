export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '11.2.0 (c820efb)';
	};
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					extensions?: Json;
					operationName?: string;
					query?: string;
					variables?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			action: {
				Row: {
					action_cost: string | null;
					auto_heighten: boolean;
					base_level: number | null;
					description: string;
					id: number;
					name: string;
					rolls: Json;
					sheet_record_id: number | null;
					tags: Json;
					type: string | null;
					user_id: string;
				};
				Insert: {
					action_cost?: string | null;
					auto_heighten?: boolean;
					base_level?: number | null;
					description?: string;
					id?: number;
					name: string;
					rolls?: Json;
					sheet_record_id?: number | null;
					tags?: Json;
					type?: string | null;
					user_id: string;
				};
				Update: {
					action_cost?: string | null;
					auto_heighten?: boolean;
					base_level?: number | null;
					description?: string;
					id?: number;
					name?: string;
					rolls?: Json;
					sheet_record_id?: number | null;
					tags?: Json;
					type?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'action_sheet_record_id_fkey';
						columns: ['sheet_record_id'];
						isOneToOne: false;
						referencedRelation: 'sheet_record';
						referencedColumns: ['id'];
					},
				];
			};
			channel_default_character: {
				Row: {
					channel_id: string;
					character_id: number;
					user_id: string;
				};
				Insert: {
					channel_id: string;
					character_id: number;
					user_id: string;
				};
				Update: {
					channel_id?: string;
					character_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'channel_default_character_character_id_character_id_fk';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'character';
						referencedColumns: ['id'];
					},
				];
			};
			character: {
				Row: {
					char_id: number;
					created_at: string;
					game_id: number | null;
					id: number;
					import_source: string;
					is_active_character: boolean;
					last_updated_at: string;
					name: string;
					sheet_record_id: number;
					user_id: string;
				};
				Insert: {
					char_id: number;
					created_at?: string;
					game_id?: number | null;
					id?: number;
					import_source: string;
					is_active_character?: boolean;
					last_updated_at?: string;
					name: string;
					sheet_record_id: number;
					user_id: string;
				};
				Update: {
					char_id?: number;
					created_at?: string;
					game_id?: number | null;
					id?: number;
					import_source?: string;
					is_active_character?: boolean;
					last_updated_at?: string;
					name?: string;
					sheet_record_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'character_game_id_fkey';
						columns: ['game_id'];
						isOneToOne: false;
						referencedRelation: 'game';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'character_sheet_record_id_fkey';
						columns: ['sheet_record_id'];
						isOneToOne: false;
						referencedRelation: 'sheet_record';
						referencedColumns: ['id'];
					},
				];
			};
			game: {
				Row: {
					created_at: string;
					gm_user_id: string;
					guild_id: string;
					id: number;
					is_active: boolean;
					last_updated_at: string;
					name: string;
				};
				Insert: {
					created_at?: string;
					gm_user_id: string;
					guild_id: string;
					id?: number;
					is_active?: boolean;
					last_updated_at?: string;
					name: string;
				};
				Update: {
					created_at?: string;
					gm_user_id?: string;
					guild_id?: string;
					id?: number;
					is_active?: boolean;
					last_updated_at?: string;
					name?: string;
				};
				Relationships: [];
			};
			guild_default_character: {
				Row: {
					character_id: number;
					guild_id: string;
					user_id: string;
				};
				Insert: {
					character_id: number;
					guild_id: string;
					user_id: string;
				};
				Update: {
					character_id?: number;
					guild_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'guild_default_character_character_id_character_id_fk';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'character';
						referencedColumns: ['id'];
					},
				];
			};
			initiative: {
				Row: {
					channel_id: string;
					created_at: string;
					current_round: number;
					current_turn_group_id: number | null;
					gm_user_id: string;
					id: number;
					last_updated_at: string;
				};
				Insert: {
					channel_id: string;
					created_at?: string;
					current_round?: number;
					current_turn_group_id?: number | null;
					gm_user_id: string;
					id?: number;
					last_updated_at?: string;
				};
				Update: {
					channel_id?: string;
					created_at?: string;
					current_round?: number;
					current_turn_group_id?: number | null;
					gm_user_id?: string;
					id?: number;
					last_updated_at?: string;
				};
				Relationships: [];
			};
			initiative_actor: {
				Row: {
					character_id: number | null;
					created_at: string;
					game_id: number | null;
					hide_stats: boolean;
					id: number;
					initiative_actor_group_id: number;
					initiative_id: number;
					last_updated_at: string;
					minion_id: number | null;
					name: string;
					note: string;
					reference_npc_name: string | null;
					sheet_record_id: number;
					user_id: string;
				};
				Insert: {
					character_id?: number | null;
					created_at?: string;
					game_id?: number | null;
					hide_stats?: boolean;
					id?: number;
					initiative_actor_group_id: number;
					initiative_id: number;
					last_updated_at?: string;
					minion_id?: number | null;
					name: string;
					note?: string;
					reference_npc_name?: string | null;
					sheet_record_id: number;
					user_id: string;
				};
				Update: {
					character_id?: number | null;
					created_at?: string;
					game_id?: number | null;
					hide_stats?: boolean;
					id?: number;
					initiative_actor_group_id?: number;
					initiative_id?: number;
					last_updated_at?: string;
					minion_id?: number | null;
					name?: string;
					note?: string;
					reference_npc_name?: string | null;
					sheet_record_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'initiative_actor_character_id_character_id_fk';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'character';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'initiative_actor_game_id_fkey';
						columns: ['game_id'];
						isOneToOne: false;
						referencedRelation: 'game';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'initiative_actor_initiative_actor_group_id_initiative_actor_gro';
						columns: ['initiative_actor_group_id'];
						isOneToOne: false;
						referencedRelation: 'initiative_actor_group';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'initiative_actor_initiative_id_initiative_id_fk';
						columns: ['initiative_id'];
						isOneToOne: false;
						referencedRelation: 'initiative';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'initiative_actor_minion_id_fkey';
						columns: ['minion_id'];
						isOneToOne: false;
						referencedRelation: 'minion';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'initiative_actor_sheet_record_id_fkey';
						columns: ['sheet_record_id'];
						isOneToOne: false;
						referencedRelation: 'sheet_record';
						referencedColumns: ['id'];
					},
				];
			};
			initiative_actor_group: {
				Row: {
					created_at: string;
					id: number;
					initiative_id: number;
					initiative_result: number;
					last_updated_at: string;
					name: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					initiative_id: number;
					initiative_result: number;
					last_updated_at?: string;
					name: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					initiative_id?: number;
					initiative_result?: number;
					last_updated_at?: string;
					name?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'initiative_actor_group_initiative_id_initiative_id_fk';
						columns: ['initiative_id'];
						isOneToOne: false;
						referencedRelation: 'initiative';
						referencedColumns: ['id'];
					},
				];
			};
			knex_migrations: {
				Row: {
					batch: number | null;
					id: number;
					migration_time: string | null;
					name: string | null;
				};
				Insert: {
					batch?: number | null;
					id?: number;
					migration_time?: string | null;
					name?: string | null;
				};
				Update: {
					batch?: number | null;
					id?: number;
					migration_time?: string | null;
					name?: string | null;
				};
				Relationships: [];
			};
			knex_migrations_lock: {
				Row: {
					index: number;
					is_locked: number | null;
				};
				Insert: {
					index?: number;
					is_locked?: number | null;
				};
				Update: {
					index?: number;
					is_locked?: number | null;
				};
				Relationships: [];
			};
			kysely_migration: {
				Row: {
					name: string;
					timestamp: string;
				};
				Insert: {
					name: string;
					timestamp: string;
				};
				Update: {
					name?: string;
					timestamp?: string;
				};
				Relationships: [];
			};
			kysely_migration_lock: {
				Row: {
					id: string;
					is_locked: number;
				};
				Insert: {
					id: string;
					is_locked?: number;
				};
				Update: {
					id?: string;
					is_locked?: number;
				};
				Relationships: [];
			};
			minion: {
				Row: {
					auto_join_initiative: boolean;
					character_id: number | null;
					id: number;
					name: string;
					sheet_record_id: number;
					user_id: string;
				};
				Insert: {
					auto_join_initiative?: boolean;
					character_id?: number | null;
					id?: number;
					name: string;
					sheet_record_id: number;
					user_id: string;
				};
				Update: {
					auto_join_initiative?: boolean;
					character_id?: number | null;
					id?: number;
					name?: string;
					sheet_record_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'minion_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'character';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'minion_sheet_record_id_fkey';
						columns: ['sheet_record_id'];
						isOneToOne: false;
						referencedRelation: 'sheet_record';
						referencedColumns: ['id'];
					},
				];
			};
			modifier: {
				Row: {
					description: string | null;
					id: number;
					is_active: boolean;
					name: string;
					note: string | null;
					roll_adjustment: string | null;
					roll_target_tags: string | null;
					severity: number | null;
					sheet_adjustments: Json;
					sheet_record_id: number | null;
					type: string;
					user_id: string;
				};
				Insert: {
					description?: string | null;
					id?: number;
					is_active?: boolean;
					name: string;
					note?: string | null;
					roll_adjustment?: string | null;
					roll_target_tags?: string | null;
					severity?: number | null;
					sheet_adjustments?: Json;
					sheet_record_id?: number | null;
					type: string;
					user_id: string;
				};
				Update: {
					description?: string | null;
					id?: number;
					is_active?: boolean;
					name?: string;
					note?: string | null;
					roll_adjustment?: string | null;
					roll_target_tags?: string | null;
					severity?: number | null;
					sheet_adjustments?: Json;
					sheet_record_id?: number | null;
					type?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'modifier_sheet_record_id_fkey';
						columns: ['sheet_record_id'];
						isOneToOne: false;
						referencedRelation: 'sheet_record';
						referencedColumns: ['id'];
					},
				];
			};
			nethys_bestiary: {
				Row: {
					category: string;
					data: Json;
					elastic_id: string;
					elastic_index: number;
					exclude_from_search: boolean;
					id: number;
					level: number | null;
					name: string;
					nethys_id: string;
					search: string;
					tags: Json;
				};
				Insert: {
					category: string;
					data: Json;
					elastic_id: string;
					elastic_index: number;
					exclude_from_search: boolean;
					id?: number;
					level?: number | null;
					name: string;
					nethys_id: string;
					search: string;
					tags: Json;
				};
				Update: {
					category?: string;
					data?: Json;
					elastic_id?: string;
					elastic_index?: number;
					exclude_from_search?: boolean;
					id?: number;
					level?: number | null;
					name?: string;
					nethys_id?: string;
					search?: string;
					tags?: Json;
				};
				Relationships: [];
			};
			nethys_compendium: {
				Row: {
					category: string;
					data: Json;
					elastic_id: string;
					elastic_index: number;
					exclude_from_search: boolean;
					id: number;
					level: number | null;
					name: string;
					nethys_id: string;
					search: string;
					tags: Json;
				};
				Insert: {
					category: string;
					data: Json;
					elastic_id: string;
					elastic_index: number;
					exclude_from_search: boolean;
					id?: number;
					level?: number | null;
					name: string;
					nethys_id: string;
					search: string;
					tags: Json;
				};
				Update: {
					category?: string;
					data?: Json;
					elastic_id?: string;
					elastic_index?: number;
					exclude_from_search?: boolean;
					id?: number;
					level?: number | null;
					name?: string;
					nethys_id?: string;
					search?: string;
					tags?: Json;
				};
				Relationships: [];
			};
			roll_macro: {
				Row: {
					id: number;
					macro: string;
					name: string;
					sheet_record_id: number | null;
					user_id: string;
				};
				Insert: {
					id?: number;
					macro: string;
					name: string;
					sheet_record_id?: number | null;
					user_id: string;
				};
				Update: {
					id?: number;
					macro?: string;
					name?: string;
					sheet_record_id?: number | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'roll_macro_sheet_record_id_fkey';
						columns: ['sheet_record_id'];
						isOneToOne: false;
						referencedRelation: 'sheet_record';
						referencedColumns: ['id'];
					},
				];
			};
			sheet_record: {
				Row: {
					conditions: Json;
					id: number;
					sheet: Json;
					tracker_channel_id: string | null;
					tracker_guild_id: string | null;
					tracker_message_id: string | null;
					tracker_mode: string | null;
				};
				Insert: {
					conditions?: Json;
					id?: number;
					sheet: Json;
					tracker_channel_id?: string | null;
					tracker_guild_id?: string | null;
					tracker_message_id?: string | null;
					tracker_mode?: string | null;
				};
				Update: {
					conditions?: Json;
					id?: number;
					sheet?: Json;
					tracker_channel_id?: string | null;
					tracker_guild_id?: string | null;
					tracker_message_id?: string | null;
					tracker_mode?: string | null;
				};
				Relationships: [];
			};
			user_settings: {
				Row: {
					default_compendium: string;
					game_system: string;
					init_stats_notification: string;
					inline_rolls_display: string;
					roll_compact_mode: string;
					user_id: string;
				};
				Insert: {
					default_compendium?: string;
					game_system?: string;
					init_stats_notification?: string;
					inline_rolls_display?: string;
					roll_compact_mode?: string;
					user_id: string;
				};
				Update: {
					default_compendium?: string;
					game_system?: string;
					init_stats_notification?: string;
					inline_rolls_display?: string;
					roll_compact_mode?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			wg_auth_token: {
				Row: {
					access_rights: string;
					access_token: string;
					char_id: number;
					expires_at: string;
					id: number;
					token_type: string;
				};
				Insert: {
					access_rights: string;
					access_token: string;
					char_id: number;
					expires_at: string;
					id?: number;
					token_type: string;
				};
				Update: {
					access_rights?: string;
					access_token?: string;
					char_id?: number;
					expires_at?: string;
					id?: number;
					token_type?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	storage: {
		Tables: {
			buckets: {
				Row: {
					allowed_mime_types: string[] | null;
					avif_autodetection: boolean | null;
					created_at: string | null;
					file_size_limit: number | null;
					id: string;
					name: string;
					owner: string | null;
					owner_id: string | null;
					public: boolean | null;
					type: Database['storage']['Enums']['buckettype'];
					updated_at: string | null;
				};
				Insert: {
					allowed_mime_types?: string[] | null;
					avif_autodetection?: boolean | null;
					created_at?: string | null;
					file_size_limit?: number | null;
					id: string;
					name: string;
					owner?: string | null;
					owner_id?: string | null;
					public?: boolean | null;
					type?: Database['storage']['Enums']['buckettype'];
					updated_at?: string | null;
				};
				Update: {
					allowed_mime_types?: string[] | null;
					avif_autodetection?: boolean | null;
					created_at?: string | null;
					file_size_limit?: number | null;
					id?: string;
					name?: string;
					owner?: string | null;
					owner_id?: string | null;
					public?: boolean | null;
					type?: Database['storage']['Enums']['buckettype'];
					updated_at?: string | null;
				};
				Relationships: [];
			};
			buckets_analytics: {
				Row: {
					created_at: string;
					deleted_at: string | null;
					format: string;
					id: string;
					name: string;
					type: Database['storage']['Enums']['buckettype'];
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					deleted_at?: string | null;
					format?: string;
					id?: string;
					name: string;
					type?: Database['storage']['Enums']['buckettype'];
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					deleted_at?: string | null;
					format?: string;
					id?: string;
					name?: string;
					type?: Database['storage']['Enums']['buckettype'];
					updated_at?: string;
				};
				Relationships: [];
			};
			buckets_vectors: {
				Row: {
					created_at: string;
					id: string;
					type: Database['storage']['Enums']['buckettype'];
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					id: string;
					type?: Database['storage']['Enums']['buckettype'];
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					type?: Database['storage']['Enums']['buckettype'];
					updated_at?: string;
				};
				Relationships: [];
			};
			migrations: {
				Row: {
					executed_at: string | null;
					hash: string;
					id: number;
					name: string;
				};
				Insert: {
					executed_at?: string | null;
					hash: string;
					id: number;
					name: string;
				};
				Update: {
					executed_at?: string | null;
					hash?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			objects: {
				Row: {
					bucket_id: string | null;
					created_at: string | null;
					id: string;
					last_accessed_at: string | null;
					metadata: Json | null;
					name: string | null;
					owner: string | null;
					owner_id: string | null;
					path_tokens: string[] | null;
					updated_at: string | null;
					user_metadata: Json | null;
					version: string | null;
				};
				Insert: {
					bucket_id?: string | null;
					created_at?: string | null;
					id?: string;
					last_accessed_at?: string | null;
					metadata?: Json | null;
					name?: string | null;
					owner?: string | null;
					owner_id?: string | null;
					path_tokens?: string[] | null;
					updated_at?: string | null;
					user_metadata?: Json | null;
					version?: string | null;
				};
				Update: {
					bucket_id?: string | null;
					created_at?: string | null;
					id?: string;
					last_accessed_at?: string | null;
					metadata?: Json | null;
					name?: string | null;
					owner?: string | null;
					owner_id?: string | null;
					path_tokens?: string[] | null;
					updated_at?: string | null;
					user_metadata?: Json | null;
					version?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'objects_bucketId_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets';
						referencedColumns: ['id'];
					},
				];
			};
			s3_multipart_uploads: {
				Row: {
					bucket_id: string;
					created_at: string;
					id: string;
					in_progress_size: number;
					key: string;
					owner_id: string | null;
					upload_signature: string;
					user_metadata: Json | null;
					version: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					id: string;
					in_progress_size?: number;
					key: string;
					owner_id?: string | null;
					upload_signature: string;
					user_metadata?: Json | null;
					version: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					id?: string;
					in_progress_size?: number;
					key?: string;
					owner_id?: string | null;
					upload_signature?: string;
					user_metadata?: Json | null;
					version?: string;
				};
				Relationships: [
					{
						foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets';
						referencedColumns: ['id'];
					},
				];
			};
			s3_multipart_uploads_parts: {
				Row: {
					bucket_id: string;
					created_at: string;
					etag: string;
					id: string;
					key: string;
					owner_id: string | null;
					part_number: number;
					size: number;
					upload_id: string;
					version: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					etag: string;
					id?: string;
					key: string;
					owner_id?: string | null;
					part_number: number;
					size?: number;
					upload_id: string;
					version: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					etag?: string;
					id?: string;
					key?: string;
					owner_id?: string | null;
					part_number?: number;
					size?: number;
					upload_id?: string;
					version?: string;
				};
				Relationships: [
					{
						foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
						columns: ['upload_id'];
						isOneToOne: false;
						referencedRelation: 's3_multipart_uploads';
						referencedColumns: ['id'];
					},
				];
			};
			vector_indexes: {
				Row: {
					bucket_id: string;
					created_at: string;
					data_type: string;
					dimension: number;
					distance_metric: string;
					id: string;
					metadata_configuration: Json | null;
					name: string;
					updated_at: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					data_type: string;
					dimension: number;
					distance_metric: string;
					id?: string;
					metadata_configuration?: Json | null;
					name: string;
					updated_at?: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					data_type?: string;
					dimension?: number;
					distance_metric?: string;
					id?: string;
					metadata_configuration?: Json | null;
					name?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'vector_indexes_bucket_id_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets_vectors';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			can_insert_object: {
				Args: { bucketid: string; metadata: Json; name: string; owner: string };
				Returns: undefined;
			};
			extension: { Args: { name: string }; Returns: string };
			filename: { Args: { name: string }; Returns: string };
			foldername: { Args: { name: string }; Returns: string[] };
			get_common_prefix: {
				Args: { p_delimiter: string; p_key: string; p_prefix: string };
				Returns: string;
			};
			get_size_by_bucket: {
				Args: never;
				Returns: {
					bucket_id: string;
					size: number;
				}[];
			};
			list_multipart_uploads_with_delimiter: {
				Args: {
					bucket_id: string;
					delimiter_param: string;
					max_keys?: number;
					next_key_token?: string;
					next_upload_token?: string;
					prefix_param: string;
				};
				Returns: {
					created_at: string;
					id: string;
					key: string;
				}[];
			};
			list_objects_with_delimiter: {
				Args: {
					_bucket_id: string;
					delimiter_param: string;
					max_keys?: number;
					next_token?: string;
					prefix_param: string;
					sort_order?: string;
					start_after?: string;
				};
				Returns: {
					created_at: string;
					id: string;
					last_accessed_at: string;
					metadata: Json;
					name: string;
					updated_at: string;
				}[];
			};
			operation: { Args: never; Returns: string };
			search: {
				Args: {
					bucketname: string;
					levels?: number;
					limits?: number;
					offsets?: number;
					prefix: string;
					search?: string;
					sortcolumn?: string;
					sortorder?: string;
				};
				Returns: {
					created_at: string;
					id: string;
					last_accessed_at: string;
					metadata: Json;
					name: string;
					updated_at: string;
				}[];
			};
			search_by_timestamp: {
				Args: {
					p_bucket_id: string;
					p_level: number;
					p_limit: number;
					p_prefix: string;
					p_sort_column: string;
					p_sort_column_after: string;
					p_sort_order: string;
					p_start_after: string;
				};
				Returns: {
					created_at: string;
					id: string;
					key: string;
					last_accessed_at: string;
					metadata: Json;
					name: string;
					updated_at: string;
				}[];
			};
			search_v2: {
				Args: {
					bucket_name: string;
					levels?: number;
					limits?: number;
					prefix: string;
					sort_column?: string;
					sort_column_after?: string;
					sort_order?: string;
					start_after?: string;
				};
				Returns: {
					created_at: string;
					id: string;
					key: string;
					last_accessed_at: string;
					metadata: Json;
					name: string;
					updated_at: string;
				}[];
			};
		};
		Enums: {
			buckettype: 'STANDARD' | 'ANALYTICS' | 'VECTOR';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
				DefaultSchema['Views'])
		? (DefaultSchema['Tables'] &
				DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {},
	},
	storage: {
		Enums: {
			buckettype: ['STANDARD', 'ANALYTICS', 'VECTOR'],
		},
	},
} as const;
