-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 13, 2025 at 09:30 AM
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
-- Database: `cerahati`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookmark`
--

CREATE TABLE `bookmark` (
  `id` int(255) NOT NULL,
  `user_id` int(255) NOT NULL,
  `rumah_yatim_id` int(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookmark`
--

INSERT INTO `bookmark` (`id`, `user_id`, `rumah_yatim_id`, `created_at`) VALUES
(2001, 1002, 1910121401, '2025-03-17 09:44:22'),
(2002, 1001, 1821011401, '2025-03-17 09:40:29');

-- --------------------------------------------------------

--
-- Table structure for table `donation`
--

CREATE TABLE `donation` (
  `id` int(255) NOT NULL,
  `user_id` int(255) NOT NULL,
  `rumah_yatim_id` int(255) NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donation`
--

INSERT INTO `donation` (`id`, `user_id`, `rumah_yatim_id`, `amount`, `payment_method`, `status`, `transaction_id`, `created_at`) VALUES
(3001, 1001, 1910121401, 50000, 'QRIS', 'Pending', '31001', '2025-03-17 10:00:17'),
(3002, 1002, 1821011401, 100000, 'Mobile Banking', 'Completed', '31002', '2025-03-17 10:01:44'),
(3003, 1002, 2010121402, 500000, 'Mobile Banking', 'Completed', '31003', '2025-03-17 10:02:33');

-- --------------------------------------------------------

--
-- Table structure for table `rumah_yatim`
--

CREATE TABLE `rumah_yatim` (
  `id` int(255) NOT NULL,
  `nama_panti` varchar(255) NOT NULL,
  `nama_kota` varchar(255) NOT NULL,
  `nama_pengurus` varchar(255) NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `deskripsi` varchar(255) NOT NULL,
  `jumlah_anak` int(255) NOT NULL,
  `kapasitas` int(255) NOT NULL,
  `kontak` varchar(255) NOT NULL,
  `latitude` decimal(25,20) NOT NULL,
  `longtitude` decimal(25,20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rumah_yatim`
--

INSERT INTO `rumah_yatim` (`id`, `nama_panti`, `nama_kota`, `nama_pengurus`, `alamat`, `foto`, `deskripsi`, `jumlah_anak`, `kapasitas`, `kontak`, `latitude`, `longtitude`) VALUES
(1821011401, 'Panti Yatim Cinta Harapan', 'Bandung, Jawa Barat', 'Hj. Romlah Salamah', 'Jl. Margacinta No 4 RT 01 RW 09, Cibereum, Buah Batu, Bandung, Jawa Barat', 'cintakasih.jpg', 'Panti ini didirikan pada tahun 2017 dan didaftarkan ke cerahati pada tahun 2018', 122, 150, '088144578961', -6.95572354577447700000, 107.65381357900928000000),
(1910121401, 'Rumah Yatim Harapan Kasih', 'Jakarta Timur', 'H. Rosyid Badru', 'Jl. Merdeka No 17 RT 06 RW 02, Layur, Rawamangun, Jakarta Timur, DKI Jakarta', 'harapankasih.jpg', 'Panti ini didirikan pada tahun 2017 dan didaftarkan ke cerahati pada tahun 2019', 39, 100, '0812145678104', -6.19364600201988000000, 106.90451305016089000000),
(2010121402, 'Rumah Yatim Amanat Kasih', 'Jakarta Timur', 'Vincent Rosaldi', 'Jl. Sodonk Raya No 8 RT 04 RW 07, Layur, Rawamangun, Jakarta Timur, DKI Jakarta', 'amanatkasih.jpg', 'Panti ini didirikan pada tahun 2019 dan didaftarkan ke cerahati pada tahun 2020', 51, 80, '081212365897', -6.20480637822680950000, 106.89635983666993000000);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1001, 'andiKeren', 'Andi', 'andi123@gmail.com', 'andiKeren', '2025-03-16 05:00:36', '2025-03-16 05:45:16'),
(1002, 'andiKeren1', 'Andi1', 'andi1234@gmail.com', 'andiKeren', '2025-03-16 05:48:30', '2025-03-16 06:05:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookmark`
--
ALTER TABLE `bookmark`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rumahyatimid` (`rumah_yatim_id`),
  ADD KEY `userid` (`user_id`);

--
-- Indexes for table `donation`
--
ALTER TABLE `donation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usersid` (`user_id`),
  ADD KEY `rumahyatimid2` (`rumah_yatim_id`);

--
-- Indexes for table `rumah_yatim`
--
ALTER TABLE `rumah_yatim`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookmark`
--
ALTER TABLE `bookmark`
  ADD CONSTRAINT `rumahyatimid` FOREIGN KEY (`rumah_yatim_id`) REFERENCES `rumah_yatim` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `donation`
--
ALTER TABLE `donation`
  ADD CONSTRAINT `rumahyatimid2` FOREIGN KEY (`rumah_yatim_id`) REFERENCES `rumah_yatim` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usersid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
