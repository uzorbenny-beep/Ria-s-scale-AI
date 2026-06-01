-- =========================================================================
-- Agency Growth AI: phpMyAdmin MySQL / MariaDB Database Schema
-- Compatible with phpMyAdmin 4.x / 5.x and MySQL 5.7+ / MariaDB 10.3+
-- Author: Ria'S Scale AI Platform
-- Current Target Time: 2026-06-01
-- =========================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database Name: `agency_growth_ai`
--
-- Note: Create the database in phpMyAdmin first before importing if necessary:
-- CREATE DATABASE IF NOT EXISTS `agency_growth_ai` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `agency_growth_ai`;
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL COMMENT 'Unique identifier mapping to system authentication profile (UUID format)',
  `email` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `industry` varchar(100) NOT NULL DEFAULT 'Marketing Agency' COMMENT 'Dynamic operating vertical (e.g. Marketing, Web Design, Recruiters)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `plan_id` varchar(50) NOT NULL DEFAULT 'starter' COMMENT 'Tier: starter (3,000 coin), professional (10,000 coin), growth (30,000 coin), enterprise (custom coins)',
  `status` varchar(50) NOT NULL DEFAULT 'none' COMMENT 'Status: active, canceled, trailing, past_due, none',
  `price_id` varchar(255) DEFAULT NULL,
  `coins` int(11) NOT NULL DEFAULT '10000' COMMENT 'Current available credits (System locks workspace once reaching 0)',
  `maxCoins` int(11) NOT NULL DEFAULT '10000' COMMENT 'Total max balance threshold matching selected subscription plan',
  `current_period_end` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sub_stripe_id` (`stripe_subscription_id`),
  KEY `fk_subscriptions_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE IF NOT EXISTS `leads` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `company` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL COMMENT 'Vertical niche category',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'New Lead' COMMENT 'Status: New Lead, Contacted, Qualified, Proposal Sent, Won, Lost',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_leads_users` (`user_id`),
  KEY `idx_leads_status` (`user_id`,`status`),
  KEY `idx_leads_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `outreach_campaigns`
--

CREATE TABLE IF NOT EXISTS `outreach_campaigns` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `type` varchar(50) NOT NULL COMMENT 'Type: email, linkedin, script, followup',
  `specialized_industry` varchar(100) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `generated_text` xmediumtext NOT NULL,
  `recipient_name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_outreach_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `generated_content`
--

CREATE TABLE IF NOT EXISTS `generated_content` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL COMMENT 'Type: linkedin_post, x_thread, blog, newsletter, marketing_email',
  `specialized_industry` varchar(100) NOT NULL,
  `prompt` text NOT NULL,
  `output_text` xmediumtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_content_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE IF NOT EXISTS `proposals` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `company_name` varchar(150) NOT NULL,
  `service_title` varchar(255) NOT NULL,
  `scope_of_work` text DEFAULT NULL,
  `contract_terms` text DEFAULT NULL,
  `estimated_cost` varchar(100) DEFAULT NULL,
  `generated_text` xmediumtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_proposals_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crm_records`
--

CREATE TABLE IF NOT EXISTS `crm_records` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `lead_id` varchar(36) NOT NULL,
  `previous_stage` varchar(100) DEFAULT NULL,
  `new_stage` varchar(100) NOT NULL,
  `deal_value` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_crm_users` (`user_id`),
  KEY `fk_crm_leads` (`lead_id`),
  KEY `idx_crm_history_map` (`lead_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `analytics`
--

CREATE TABLE IF NOT EXISTS `analytics` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `leads_count` int(11) DEFAULT '0',
  `outreach_sent_count` int(11) DEFAULT '0',
  `proposals_count` int(11) DEFAULT '0',
  `conversion_rate` double DEFAULT '0',
  `active_mrr` decimal(12,2) DEFAULT '0.00',
  `snapshot_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_analytics_user_date` (`user_id`,`snapshot_date`),
  KEY `fk_analytics_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE IF NOT EXISTS `settings` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `theme` varchar(50) NOT NULL DEFAULT 'dark',
  `primary_color` varchar(50) NOT NULL DEFAULT 'indigo',
  `gemini_model` varchar(100) NOT NULL DEFAULT 'gemini-3.5-flash',
  `notifications_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settings_user_unique` (`user_id`),
  KEY `fk_settings_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- FOREIGN KEY Constraints (Cascaded deletion maps)
--

ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `outreach_campaigns`
  ADD CONSTRAINT `fk_outreach_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `generated_content`
  ADD CONSTRAINT `fk_content_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `proposals`
  ADD CONSTRAINT `fk_proposals_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `crm_records`
  ADD CONSTRAINT `fk_crm_leads` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_crm_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `analytics`
  ADD CONSTRAINT `fk_analytics_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `settings`
  ADD CONSTRAINT `fk_settings_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


-- --------------------------------------------------------

--
-- Seed Data Simulation for Local Development Sandboxes
--

INSERT INTO `users` (`id`, `email`, `name`, `company`, `industry`) VALUES
('user_vanguard', 'uzorbenny51@gmail.com', 'Benny Vanguard', 'Vanguard Consulting', 'Software Agency')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `subscriptions` (`id`, `user_id`, `stripe_subscription_id`, `plan_id`, `status`, `price_id`, `coins`, `maxCoins`, `current_period_end`) VALUES
('sub_vanguard', 'user_vanguard', 'sub_stripe_mock_77372', 'professional', 'active', 'price_prof_49', 10000, 10000, '2026-07-01 00:00:00')
ON DUPLICATE KEY UPDATE `coins` = VALUES(`coins`);

INSERT INTO `settings` (`id`, `user_id`, `theme`, `primary_color`, `gemini_model`, `notifications_enabled`) VALUES
('set_vanguard', 'user_vanguard', 'dark', 'indigo', 'gemini-3.5-flash', 1)
ON DUPLICATE KEY UPDATE `gemini_model` = VALUES(`gemini_model`);

-- Insert standard mock leads (e.g. Health, Tech, SaaS clients aligned under Vanguard Consulting)
INSERT INTO `leads` (`id`, `user_id`, `name`, `company`, `industry`, `email`, `phone`, `status`, `notes`) VALUES
('lead_1', 'user_vanguard', 'Sarah Connor', 'Cyberdyne Systems', 'Tech', 'sarah@cyberdyne.io', '321-456-7890', 'Qualified', 'Looking for custom AI outbound orchestration layers.'),
('lead_2', 'user_vanguard', 'Marcus Aurelius', 'Meditation Spa', 'Health', 'marcus@stoicism.com', '555-123-4567', 'New Lead', 'Expressed deep interest in social copywriting generation pipeline.')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
