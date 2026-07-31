-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2026 at 04:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dmw_processing`
--

-- --------------------------------------------------------

--
-- Table structure for table `counters`
--

CREATE TABLE `counters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `counter_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `current_ticket_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `counters`
--

INSERT INTO `counters` (`id`, `counter_name`, `user_id`, `is_active`, `current_ticket_id`, `created_at`, `updated_at`) VALUES
(1, 'Counter 1', 2, 1, 451, '2026-05-20 17:24:40', '2026-06-10 01:15:37'),
(2, 'Counter 2', 3, 1, 452, '2026-05-20 17:24:40', '2026-06-10 01:15:57'),
(3, 'Counter 3', 4, 1, 453, '2026-05-20 17:24:41', '2026-06-10 01:22:54'),
(4, 'Counter 4', 5, 1, 454, '2026-05-20 17:24:41', '2026-06-10 01:23:26'),
(5, 'Counter 5', 6, 1, 460, '2026-05-20 17:24:42', '2026-06-10 01:24:56');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2024_01_01_000000_create_users_table', 1),
(2, '2024_01_02_000000_create_counters_table', 1),
(3, '2024_01_03_000000_create_tickets_table', 1),
(4, '2024_01_04_000000_create_personal_access_tokens_table', 2),
(5, '2024_01_05_000000_add_session_to_tickets', 3),
(6, '2024_01_06_000000_update_tickets_unique_constraint', 3),
(7, '2024_01_07_000000_add_indexes_to_tickets', 4),
(8, '2026_06_08_135246_add_skipped_status_to_tickets_table', 5),
(9, '2026_06_09_090720_add_cancelled_status_to_tickets_table', 6),
(10, '2026_06_09_094205_create_system_logs_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(80) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(4, 'App\\Models\\User', 3, 'auth_token', 'fe3b5ae50dd6f28fcaaa5b561244b116429ed2329e3d177ed030ef201157b2f5', '[\"*\"]', '2026-05-21 23:58:51', NULL, '2026-05-21 21:15:18', '2026-05-21 23:58:51'),
(9, 'App\\Models\\User', 2, 'auth_token', '9be3c68e25e4b80c3cfaea3197dd93bd7b49cd6506682f39e5cb1f1b09f3578b', '[\"*\"]', '2026-05-25 17:48:09', NULL, '2026-05-24 22:35:48', '2026-05-25 17:48:09'),
(14, 'App\\Models\\User', 6, 'auth_token', '1cfaec73b2ad1121a555685e34d09c0499e6d11dc7e443c830c53b80d35db6a1', '[\"*\"]', '2026-05-31 18:58:00', NULL, '2026-05-25 17:51:36', '2026-05-31 18:58:00'),
(15, 'App\\Models\\User', 2, 'auth_token', '3b1c6e9abae5df5aec934c20c7afa2bbbe8add07f41c903b7b65955bb3c2c09d', '[\"*\"]', '2026-05-31 19:47:23', NULL, '2026-05-31 18:02:40', '2026-05-31 19:47:23'),
(19, 'App\\Models\\User', 6, 'auth_token', 'a757f56c1b1125f07b46beb6352439d7db3a8cfd7b14ec9b46441ab0e425e0ed', '[\"*\"]', '2026-06-02 17:40:50', NULL, '2026-05-31 19:00:15', '2026-06-02 17:40:50'),
(20, 'App\\Models\\User', 2, 'auth_token', '1488693e17394c17db8a084195e03cfe93a2c0c957f48cfe5e9f4e4f4709e166', '[\"*\"]', '2026-05-31 20:37:09', NULL, '2026-05-31 19:48:08', '2026-05-31 20:37:09'),
(21, 'App\\Models\\User', 2, 'auth_token', '39e0602db6188e3fb1919aae65a13023bd8e9144fa03e3ca1719544687aa0755', '[\"*\"]', '2026-06-02 17:18:25', NULL, '2026-06-02 16:49:24', '2026-06-02 17:18:25'),
(22, 'App\\Models\\User', 2, 'auth_token', '4d2e7e8ea5efac79578eac349fe3eb23684014bc071efd6f0deb4938da91e605', '[\"*\"]', '2026-06-02 21:29:21', NULL, '2026-06-02 17:19:00', '2026-06-02 21:29:21'),
(23, 'App\\Models\\User', 3, 'auth_token', '0d765bc3d95a4769661946d8c40518ca79fbc3692d0cd4d94cc5a885394ba794', '[\"*\"]', '2026-06-02 21:32:39', NULL, '2026-06-02 17:36:43', '2026-06-02 21:32:39'),
(24, 'App\\Models\\User', 2, 'auth_token', '21e228d136c3e782a0cc64d21dc345c357777586b2cacbdb4761f8e51f854c79', '[\"*\"]', '2026-06-02 21:29:47', NULL, '2026-06-02 21:02:34', '2026-06-02 21:29:47'),
(27, 'App\\Models\\User', 4, 'auth_token', 'ab89ecfc561c4d8fb8207d20d04b4ea78b416d5326e15449e5c5b07c9503b9c2', '[\"*\"]', '2026-06-02 22:26:50', NULL, '2026-06-02 21:55:20', '2026-06-02 22:26:50'),
(28, 'App\\Models\\User', 2, 'auth_token', 'b87890ae684385062806e31f72e5ac0fac48479626bbc232475a10f32b85a0e6', '[\"*\"]', '2026-06-08 05:21:25', NULL, '2026-06-08 05:20:33', '2026-06-08 05:21:25'),
(30, 'App\\Models\\User', 2, 'auth_token', 'd668925ae613bdbcc96001e143ee61af920b2a76726ecab32ccc44de8dd29eee', '[\"*\"]', '2026-06-08 07:09:09', NULL, '2026-06-08 05:26:14', '2026-06-08 07:09:09'),
(31, 'App\\Models\\User', 1, 'auth_token', '6f4e65ee2227d18a48a5355710adf2239840f76fb76af74e11f9774faf83b5dd', '[\"*\"]', NULL, NULL, '2026-06-08 07:52:30', '2026-06-08 07:52:30'),
(32, 'App\\Models\\User', 1, 'auth_token', '1e472e1c753384b2a66f58a44a11a24a6d1e7e4fec4e35033bbc1e668fba2a92', '[\"*\"]', NULL, NULL, '2026-06-08 07:54:41', '2026-06-08 07:54:41'),
(33, 'App\\Models\\User', 1, 'auth_token', '9304db8302b5ce0d2986e0d40c64ddb8073283e9c26d9a245f5cf019e1015bac', '[\"*\"]', '2026-06-08 07:58:30', NULL, '2026-06-08 07:56:18', '2026-06-08 07:58:30'),
(34, 'App\\Models\\User', 2, 'auth_token', '810b26c53535288a18fc408e2b3199525d9ed857b973a3553f67ab6165ee5a94', '[\"*\"]', NULL, NULL, '2026-06-08 07:58:30', '2026-06-08 07:58:30'),
(35, 'App\\Models\\User', 1, 'auth_token', '69f4cead2e793a6b0889ab9b3cccedd1d317ece21fc75546acdc7433b681a4e3', '[\"*\"]', '2026-06-08 08:54:31', NULL, '2026-06-08 08:12:43', '2026-06-08 08:54:31'),
(37, 'App\\Models\\User', 2, 'auth_token', 'c1e99db6825a7002b510712c5ee2855e9c261101702352c454b15e780a5d24a2', '[\"*\"]', '2026-06-09 01:48:11', NULL, '2026-06-09 01:33:25', '2026-06-09 01:48:11'),
(38, 'App\\Models\\User', 1, 'auth_token', 'a3b95bee1062d8956b9a617bc2f717f0a8a984dc9f43e784e7e6903615d0821b', '[\"*\"]', '2026-06-09 05:24:13', NULL, '2026-06-09 01:39:49', '2026-06-09 05:24:13'),
(39, 'App\\Models\\User', 3, 'auth_token', '6df0813f0171cc1f20f84d6152c6567131c22f6a6e9af61640c56a48afad00e0', '[\"*\"]', '2026-06-09 02:30:54', NULL, '2026-06-09 01:48:39', '2026-06-09 02:30:54'),
(40, 'App\\Models\\User', 2, 'auth_token', '2097e54af2d459264eb59e2502aba215084758b163ea55310b44b0d5112326c4', '[\"*\"]', '2026-06-10 01:15:37', NULL, '2026-06-10 01:03:14', '2026-06-10 01:15:37'),
(45, 'App\\Models\\User', 1, 'auth_token', 'b27c3750bd525c063f7f97adfe4eae52fd2cf65bd9452c7398562e174597d03a', '[\"*\"]', '2026-06-10 02:48:27', NULL, '2026-06-10 01:41:48', '2026-06-10 02:48:27');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `user_id`, `action`, `details`, `created_at`, `updated_at`) VALUES
(1, 2, 'completed', 'Counter 1 completed the transaction for priority number 03', '2026-06-09 01:48:11', '2026-06-09 01:48:11'),
(2, 3, 'catered', 'Counter 2 catered priority number 04', '2026-06-09 01:52:17', '2026-06-09 01:52:17'),
(3, 3, 'skipped', 'Counter N/A skipped priority number 04', '2026-06-09 01:52:31', '2026-06-09 01:52:31'),
(4, 3, 'skipped', 'Counter N/A skipped priority number 04', '2026-06-09 01:59:31', '2026-06-09 01:59:31'),
(5, 3, 'catered_again', 'Counter 2 catered skipped priority number 04 again', '2026-06-09 01:59:39', '2026-06-09 01:59:39'),
(6, 3, 'skipped', 'Counter N/A skipped priority number 04', '2026-06-09 02:00:08', '2026-06-09 02:00:08'),
(7, 3, 'cancelled', 'Counter N/A cancelled priority number 04', '2026-06-09 02:00:17', '2026-06-09 02:00:17'),
(8, 3, 'catered', 'Counter 2 catered priority number 05', '2026-06-09 02:30:54', '2026-06-09 02:30:54'),
(9, 2, 'catered_again', 'Counter 1 catered skipped priority number 01 again', '2026-06-10 01:15:37', '2026-06-10 01:15:37'),
(10, 3, 'catered_again', 'Counter 2 catered skipped priority number 02 again', '2026-06-10 01:15:57', '2026-06-10 01:15:57'),
(11, 4, 'catered_again', 'Counter 3 catered skipped priority number 03 again', '2026-06-10 01:22:54', '2026-06-10 01:22:54'),
(12, 5, 'catered_again', 'Counter 4 catered skipped priority number 04 again', '2026-06-10 01:23:26', '2026-06-10 01:23:26'),
(13, 6, 'catered_again', 'Counter 5 catered skipped priority number 05 again', '2026-06-10 01:23:57', '2026-06-10 01:23:57'),
(14, 6, 'skipped', 'Counter 5 skipped priority number 05', '2026-06-10 01:24:02', '2026-06-10 01:24:02'),
(15, 6, 'catered_again', 'Counter 5 catered skipped priority number 06 again', '2026-06-10 01:24:08', '2026-06-10 01:24:08'),
(16, 6, 'skipped', 'Counter 5 skipped priority number 06', '2026-06-10 01:24:14', '2026-06-10 01:24:14'),
(17, 6, 'catered_again', 'Counter 5 catered skipped priority number 07 again', '2026-06-10 01:24:19', '2026-06-10 01:24:19'),
(18, 6, 'skipped', 'Counter 5 skipped priority number 07', '2026-06-10 01:24:24', '2026-06-10 01:24:24'),
(19, 6, 'catered_again', 'Counter 5 catered skipped priority number 08 again', '2026-06-10 01:24:34', '2026-06-10 01:24:34'),
(20, 6, 'skipped', 'Counter 5 skipped priority number 08', '2026-06-10 01:24:40', '2026-06-10 01:24:40'),
(21, 6, 'catered_again', 'Counter 5 catered skipped priority number 09 again', '2026-06-10 01:24:44', '2026-06-10 01:24:44'),
(22, 6, 'skipped', 'Counter 5 skipped priority number 09', '2026-06-10 01:24:50', '2026-06-10 01:24:50'),
(23, 6, 'catered_again', 'Counter 5 catered skipped priority number 10 again', '2026-06-10 01:24:56', '2026-06-10 01:24:56');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `priority_number` varchar(255) NOT NULL,
  `session_date` date NOT NULL DEFAULT '2026-05-25',
  `session_type` enum('morning','afternoon') NOT NULL DEFAULT 'morning',
  `counter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('waiting','serving','completed','skipped','cancelled') NOT NULL DEFAULT 'waiting',
  `called_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `priority_number`, `session_date`, `session_type`, `counter_id`, `status`, `called_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(151, '01', '2026-06-03', 'morning', 1, 'completed', '2026-06-02 17:22:25', '2026-06-02 17:33:57', '2026-06-02 16:19:00', '2026-06-02 17:33:57'),
(152, '02', '2026-06-03', 'morning', 1, 'completed', '2026-06-02 17:22:41', '2026-06-02 21:02:55', '2026-06-02 16:19:00', '2026-06-02 21:02:55'),
(153, '03', '2026-06-03', 'morning', 1, 'completed', '2026-06-02 21:03:06', '2026-06-02 21:32:54', '2026-06-02 16:19:00', '2026-06-02 21:32:54'),
(154, '04', '2026-06-03', 'morning', 1, 'completed', '2026-06-02 21:38:30', '2026-06-02 21:47:44', '2026-06-02 16:19:00', '2026-06-02 21:47:44'),
(155, '05', '2026-06-03', 'morning', 1, 'completed', '2026-06-02 21:48:56', '2026-06-02 21:50:26', '2026-06-02 16:19:00', '2026-06-02 21:50:26'),
(156, '06', '2026-06-03', 'morning', 1, 'serving', '2026-06-02 21:54:22', NULL, '2026-06-02 16:19:00', '2026-06-02 21:54:22'),
(157, '07', '2026-06-03', 'morning', 2, 'serving', '2026-06-02 21:54:58', NULL, '2026-06-02 16:19:00', '2026-06-02 21:54:58'),
(158, '08', '2026-06-03', 'morning', 3, 'completed', '2026-06-02 21:55:34', '2026-06-02 21:56:07', '2026-06-02 16:19:00', '2026-06-02 21:56:07'),
(159, '09', '2026-06-03', 'morning', 3, 'serving', '2026-06-02 21:56:11', NULL, '2026-06-02 16:19:00', '2026-06-02 21:56:11'),
(160, '10', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(161, '11', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(162, '12', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(163, '13', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(164, '14', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(165, '15', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(166, '16', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(167, '17', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(168, '18', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(169, '19', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(170, '20', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(171, '21', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(172, '22', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(173, '23', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(174, '24', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(175, '25', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(176, '26', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(177, '27', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(178, '28', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(179, '29', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(180, '30', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(181, '31', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(182, '32', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(183, '33', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(184, '34', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(185, '35', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(186, '36', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(187, '37', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(188, '38', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(189, '39', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(190, '40', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(191, '41', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(192, '42', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(193, '43', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(194, '44', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(195, '45', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(196, '46', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(197, '47', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(198, '48', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(199, '49', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(200, '50', '2026-06-03', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-02 16:19:00', '2026-06-02 16:19:00'),
(201, '01', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(202, '02', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(203, '03', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(204, '04', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(205, '05', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(206, '06', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(207, '07', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(208, '08', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(209, '09', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(210, '10', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(211, '11', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(212, '12', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(213, '13', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(214, '14', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(215, '15', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(216, '16', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(217, '17', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(218, '18', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(219, '19', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(220, '20', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(221, '21', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(222, '22', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(223, '23', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(224, '24', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(225, '25', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(226, '26', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(227, '27', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(228, '28', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(229, '29', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(230, '30', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(231, '31', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(232, '32', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(233, '33', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(234, '34', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(235, '35', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(236, '36', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(237, '37', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(238, '38', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(239, '39', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(240, '40', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(241, '41', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(242, '42', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(243, '43', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(244, '44', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(245, '45', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(246, '46', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(247, '47', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(248, '48', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(249, '49', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(250, '50', '2026-06-03', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-03 11:59:29', '2026-06-03 11:59:29'),
(251, '01', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(252, '02', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(253, '03', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(254, '04', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(255, '05', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(256, '06', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(257, '07', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(258, '08', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(259, '09', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(260, '10', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(261, '11', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(262, '12', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(263, '13', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(264, '14', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(265, '15', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(266, '16', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(267, '17', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(268, '18', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(269, '19', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(270, '20', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(271, '21', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(272, '22', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(273, '23', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(274, '24', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(275, '25', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(276, '26', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(277, '27', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(278, '28', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(279, '29', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(280, '30', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(281, '31', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(282, '32', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(283, '33', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(284, '34', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(285, '35', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(286, '36', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(287, '37', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(288, '38', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(289, '39', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(290, '40', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(291, '41', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(292, '42', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(293, '43', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(294, '44', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(295, '45', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(296, '46', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(297, '47', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(298, '48', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(299, '49', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(300, '50', '2026-06-08', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-08 03:48:09', '2026-06-08 03:48:09'),
(301, '01', '2026-06-08', 'afternoon', 1, 'completed', '2026-06-08 05:20:47', '2026-06-08 05:21:04', '2026-06-08 04:00:00', '2026-06-08 05:21:04'),
(302, '02', '2026-06-08', 'afternoon', 1, 'completed', '2026-06-08 05:21:25', '2026-06-08 05:26:26', '2026-06-08 04:00:00', '2026-06-08 05:26:26'),
(303, '03', '2026-06-08', 'afternoon', 1, 'completed', '2026-06-08 05:26:34', '2026-06-08 05:27:24', '2026-06-08 04:00:00', '2026-06-08 05:27:24'),
(304, '04', '2026-06-08', 'afternoon', NULL, 'skipped', '2026-06-08 05:27:35', NULL, '2026-06-08 04:00:00', '2026-06-08 05:54:57'),
(305, '05', '2026-06-08', 'afternoon', NULL, 'skipped', '2026-06-08 06:08:12', NULL, '2026-06-08 04:00:00', '2026-06-08 06:08:17'),
(306, '06', '2026-06-08', 'afternoon', NULL, 'skipped', '2026-06-08 06:08:21', NULL, '2026-06-08 04:00:00', '2026-06-08 06:08:36'),
(307, '07', '2026-06-08', 'afternoon', 1, 'serving', '2026-06-08 07:09:09', NULL, '2026-06-08 04:00:00', '2026-06-08 07:09:09'),
(308, '08', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(309, '09', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(310, '10', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(311, '11', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(312, '12', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(313, '13', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(314, '14', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(315, '15', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(316, '16', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(317, '17', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(318, '18', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(319, '19', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(320, '20', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(321, '21', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(322, '22', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(323, '23', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(324, '24', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(325, '25', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(326, '26', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(327, '27', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(328, '28', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(329, '29', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(330, '30', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(331, '31', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(332, '32', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(333, '33', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(334, '34', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(335, '35', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(336, '36', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(337, '37', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(338, '38', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(339, '39', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(340, '40', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(341, '41', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(342, '42', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(343, '43', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(344, '44', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(345, '45', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(346, '46', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(347, '47', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(348, '48', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(349, '49', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(350, '50', '2026-06-08', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-08 04:00:00', '2026-06-08 04:00:00'),
(351, '01', '2026-06-09', 'morning', NULL, 'skipped', '2026-06-09 01:09:21', NULL, '2026-06-09 00:43:56', '2026-06-09 01:09:28'),
(352, '02', '2026-06-09', 'morning', 1, 'completed', '2026-06-09 01:20:10', '2026-06-09 01:32:00', '2026-06-09 00:43:56', '2026-06-09 01:32:00'),
(353, '03', '2026-06-09', 'morning', 1, 'completed', '2026-06-09 01:35:12', '2026-06-09 01:48:11', '2026-06-09 00:43:56', '2026-06-09 01:48:11'),
(354, '04', '2026-06-09', 'morning', NULL, 'cancelled', '2026-06-09 01:59:39', NULL, '2026-06-09 00:43:56', '2026-06-09 02:00:17'),
(355, '05', '2026-06-09', 'morning', 2, 'serving', '2026-06-09 02:30:54', NULL, '2026-06-09 00:43:56', '2026-06-09 02:30:54'),
(356, '06', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(357, '07', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(358, '08', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(359, '09', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(360, '10', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(361, '11', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(362, '12', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(363, '13', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(364, '14', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(365, '15', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(366, '16', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(367, '17', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(368, '18', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(369, '19', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(370, '20', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(371, '21', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(372, '22', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(373, '23', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(374, '24', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(375, '25', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(376, '26', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(377, '27', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(378, '28', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(379, '29', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(380, '30', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(381, '31', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(382, '32', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(383, '33', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(384, '34', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(385, '35', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(386, '36', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(387, '37', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(388, '38', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(389, '39', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(390, '40', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(391, '41', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(392, '42', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(393, '43', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(394, '44', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(395, '45', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(396, '46', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(397, '47', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(398, '48', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(399, '49', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(400, '50', '2026-06-09', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-09 00:43:56', '2026-06-09 00:43:56'),
(401, '01', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(402, '02', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(403, '03', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(404, '04', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(405, '05', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(406, '06', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(407, '07', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(408, '08', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(409, '09', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(410, '10', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(411, '11', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(412, '12', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(413, '13', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(414, '14', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(415, '15', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(416, '16', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(417, '17', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(418, '18', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(419, '19', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(420, '20', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(421, '21', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(422, '22', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(423, '23', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(424, '24', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(425, '25', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(426, '26', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(427, '27', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(428, '28', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(429, '29', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(430, '30', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(431, '31', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(432, '32', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(433, '33', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(434, '34', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(435, '35', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(436, '36', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(437, '37', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(438, '38', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(439, '39', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(440, '40', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(441, '41', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(442, '42', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(443, '43', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(444, '44', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(445, '45', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(446, '46', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(447, '47', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(448, '48', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(449, '49', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(450, '50', '2026-06-09', 'afternoon', NULL, 'waiting', NULL, NULL, '2026-06-09 05:24:12', '2026-06-09 05:24:12'),
(451, '01', '2026-06-10', 'morning', 1, 'serving', '2026-06-10 01:15:37', NULL, '2026-06-10 00:57:16', '2026-06-10 01:15:37'),
(452, '02', '2026-06-10', 'morning', 2, 'serving', '2026-06-10 01:15:57', NULL, '2026-06-10 00:57:16', '2026-06-10 01:15:57'),
(453, '03', '2026-06-10', 'morning', 3, 'serving', '2026-06-10 01:22:54', NULL, '2026-06-10 00:57:16', '2026-06-10 01:22:54'),
(454, '04', '2026-06-10', 'morning', 4, 'serving', '2026-06-10 01:23:26', NULL, '2026-06-10 00:57:16', '2026-06-10 01:23:26'),
(455, '05', '2026-06-10', 'morning', NULL, 'skipped', '2026-06-10 01:23:57', NULL, '2026-06-10 00:57:16', '2026-06-10 01:24:02'),
(456, '06', '2026-06-10', 'morning', NULL, 'skipped', '2026-06-10 01:24:08', NULL, '2026-06-10 00:57:16', '2026-06-10 01:24:14'),
(457, '07', '2026-06-10', 'morning', NULL, 'skipped', '2026-06-10 01:24:19', NULL, '2026-06-10 00:57:16', '2026-06-10 01:24:24'),
(458, '08', '2026-06-10', 'morning', NULL, 'skipped', '2026-06-10 01:24:34', NULL, '2026-06-10 00:57:16', '2026-06-10 01:24:40'),
(459, '09', '2026-06-10', 'morning', NULL, 'skipped', '2026-06-10 01:24:44', NULL, '2026-06-10 00:57:16', '2026-06-10 01:24:50'),
(460, '10', '2026-06-10', 'morning', 5, 'serving', '2026-06-10 01:24:56', NULL, '2026-06-10 00:57:16', '2026-06-10 01:24:56'),
(461, '11', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(462, '12', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(463, '13', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(464, '14', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(465, '15', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(466, '16', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(467, '17', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(468, '18', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(469, '19', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(470, '20', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(471, '21', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(472, '22', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(473, '23', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(474, '24', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(475, '25', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(476, '26', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(477, '27', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(478, '28', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(479, '29', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(480, '30', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(481, '31', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(482, '32', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(483, '33', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(484, '34', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(485, '35', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(486, '36', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(487, '37', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(488, '38', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(489, '39', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(490, '40', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(491, '41', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(492, '42', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(493, '43', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(494, '44', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(495, '45', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(496, '46', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(497, '47', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(498, '48', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(499, '49', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16'),
(500, '50', '2026-06-10', 'morning', NULL, 'waiting', NULL, NULL, '2026-06-10 00:57:16', '2026-06-10 00:57:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','counter') NOT NULL DEFAULT 'counter',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Administrator', 'admin@dmw.com', '$2y$12$hhTZgJKlDGJKlFZQslic7ORJeSa2nczve3VKGuGpgz0hZoNvTJV0K', 'superadmin', '2026-05-20 17:24:39', '2026-05-20 17:24:39', NULL),
(2, 'Counter 1 User', 'counter1@dmw.com', '$2y$12$QFU5uFgVwwZdUaRZJTXcR.XgogzjDWBsOSsmG4uL2wHo3I6V0khES', 'counter', '2026-05-20 17:24:40', '2026-05-20 17:24:40', NULL),
(3, 'Counter 2 User', 'counter2@dmw.com', '$2y$12$ywGUosD1ZzQqqdynbStoIeHuo9ZhecBd6OFrFuZHln.EkasHS0lWa', 'counter', '2026-05-20 17:24:40', '2026-05-20 17:24:40', NULL),
(4, 'Counter 3 User', 'counter3@dmw.com', '$2y$12$LALYN0M.TgQKTQkkgB400OGVKtZNqugX4yZuJh7BJjYAA3vAAUrLy', 'counter', '2026-05-20 17:24:41', '2026-05-20 17:24:41', NULL),
(5, 'Counter 4 User', 'counter4@dmw.com', '$2y$12$4s3wfHB/uQP..lwlKv7aie4pZTVxemBoCZNndHsnTITL1FdaaxKb2', 'counter', '2026-05-20 17:24:41', '2026-05-20 17:24:41', NULL),
(6, 'Counter 5 User', 'counter5@dmw.com', '$2y$12$KVw0MRpCyUXfv5JFvoOkoeHhMKlmXfYzFvfl6RrgBHVeIvFo29tqa', 'counter', '2026-05-20 17:24:42', '2026-05-20 17:24:42', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `counters`
--
ALTER TABLE `counters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `counters_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `system_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tickets_session_date_session_type_priority_number_unique` (`session_date`,`session_type`,`priority_number`),
  ADD KEY `tickets_counter_id_foreign` (`counter_id`),
  ADD KEY `tickets_status_index` (`status`),
  ADD KEY `tickets_session_date_session_type_status_index` (`session_date`,`session_type`,`status`),
  ADD KEY `tickets_session_date_index` (`session_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `counters`
--
ALTER TABLE `counters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=501;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `counters`
--
ALTER TABLE `counters`
  ADD CONSTRAINT `counters_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_counter_id_foreign` FOREIGN KEY (`counter_id`) REFERENCES `counters` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
