-- Better Auth tables (email/password + geolocation sessions)
CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `email_verified` integer DEFAULT false NOT NULL,
  `image` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `token` text NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL,
  `timezone` text,
  `city` text,
  `country` text,
  `region` text,
  `region_code` text,
  `colo` text,
  `latitude` text,
  `longitude` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);
CREATE INDEX `sessions_userId_idx` ON `sessions` (`user_id`);

CREATE TABLE `accounts` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `refresh_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `accounts_userId_idx` ON `accounts` (`user_id`);

CREATE TABLE `verifications` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);

-- DocVid lesson ownership index
CREATE TABLE `lessons` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text,
  `status` text DEFAULT 'running' NOT NULL,
  `title` text,
  `claim_token` text NOT NULL,
  `customization_json` text,
  `created_at` text NOT NULL,
  `claimed_at` text,
  `expires_at` text NOT NULL
);
CREATE INDEX `lessons_user_id_idx` ON `lessons` (`user_id`, `created_at`);
CREATE INDEX `lessons_claim_token_idx` ON `lessons` (`claim_token`);
