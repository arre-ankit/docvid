-- Dodo Payments: customer id on users + subscription mirror table
ALTER TABLE `users` ADD `dodo_customer_id` text;

CREATE TABLE `subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `customer_id` text NOT NULL,
  `product_id` text NOT NULL,
  `status` text NOT NULL,
  `cancel_at_period_end` integer DEFAULT false NOT NULL,
  `current_period_end` integer,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `subscriptions_userId_idx` ON `subscriptions` (`user_id`);
CREATE INDEX `subscriptions_customerId_idx` ON `subscriptions` (`customer_id`);
