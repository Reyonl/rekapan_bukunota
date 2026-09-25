-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: warung_lupi
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Minuman','2026-09-22 14:37:27','2026-09-22 14:37:27'),(2,'Makanan','2026-09-22 14:37:27','2026-09-22 14:37:27'),(3,'Jajanan','2026-09-22 14:37:27','2026-09-22 14:37:27'),(4,'Rokok','2026-09-22 14:37:27','2026-09-22 14:37:27'),(5,'Lainnya','2026-09-22 14:37:27','2026-09-22 14:37:27');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (2,'Pak Udin',NULL,NULL,1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(6,'Tegar',NULL,NULL,1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(7,'Wawan',NULL,NULL,1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(8,'Doni',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(9,'Kris',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(10,'Bang Lee',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(11,'Pak Ade',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(12,'Uni Chanta',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(13,'Bin Bin',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(14,'Rama',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(15,'Sandi',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(16,'Untung',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(17,'Somay',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(18,'Bakhir',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(19,'Riski',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(20,'Prem',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(21,'Ibu Tempe',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(22,'Taryo',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(23,'Frozen',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(24,'Utar',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(25,'Edi Ayam',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(26,'Aris',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(27,'Aidil',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(28,'Opung',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(29,'Ali Daging',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(30,'Fauzi',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(31,'Mama Sasa',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(32,'Marco',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(33,'Deni Cue',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(34,'Galang',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(35,'Andres',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(36,'Uni Rinda',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(37,'Agus',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(38,'Irfan',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(39,'Ade',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(40,'Daun',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51'),(41,'Roji',NULL,NULL,1,'2026-09-22 16:51:51','2026-09-22 16:51:51');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_09_22_213418_create_categories_table',2),(5,'2026_09_22_213419_create_customers_table',2),(6,'2026_09_22_213420_create_products_table',2),(7,'2026_09_22_213421_create_transactions_table',2),(8,'2026_09_22_213422_create_transaction_items_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `default_price` decimal(12,0) NOT NULL DEFAULT '0',
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Kopi',5000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(2,1,'Es Kopi',7000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(3,1,'Teh',4000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(4,1,'Teh Tubruk',5000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(5,1,'Es Teh',5000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(6,1,'Aqua K',5000,'botol',1,'2026-09-22 14:37:27','2026-09-22 20:36:14'),(7,1,'Aqua Galon',20000,'galon',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(8,1,'Susu',6000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(9,1,'Jeruk',6000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(10,1,'Es Jeruk',7000,'gelas',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(11,2,'Makan',10000,'porsi',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(12,2,'Nasi',4000,'porsi',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(13,2,'Telur',3000,'butir',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(14,2,'Mie',8000,'porsi',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(15,2,'Mie Rebus',10000,'porsi',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(16,2,'Mie Goreng',10000,'porsi',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(17,3,'Donat',2000,'pcs',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(18,3,'Ketan',3000,'pcs',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(19,3,'Nagasari',2000,'pcs',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(20,3,'Sosis Solo',2000,'pcs',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(21,3,'Gorengan',2000,'pcs',1,'2026-09-22 14:37:27','2026-09-22 17:01:07'),(22,4,'Rokok',25000,'bungkus',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(23,4,'Rokok Batang',2000,'batang',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(24,5,'Item Lainnya',0,'pcs',1,'2026-09-22 14:37:27','2026-09-22 14:37:27'),(25,4,'gudang garam filter',29000,'pcs',1,'2026-09-22 20:37:01','2026-09-22 20:37:01'),(26,4,'esse double',47000,'pcs',1,'2026-09-22 20:37:24','2026-09-22 20:37:24'),(27,4,'mie goreng double + telor',17000,'pcs',1,'2026-09-22 20:38:06','2026-09-22 20:38:06'),(28,4,'camel unggu',28000,'pcs',1,'2026-09-22 20:38:27','2026-09-22 20:38:27'),(29,4,'camel kuning',34000,'pcs',1,'2026-09-22 20:38:52','2026-09-22 20:38:52');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_items`
--

DROP TABLE IF EXISTS `transaction_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(8,0) NOT NULL DEFAULT '1',
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `unit_price` decimal(12,0) NOT NULL DEFAULT '0',
  `subtotal` decimal(12,0) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_items_transaction_id_foreign` (`transaction_id`),
  KEY `transaction_items_product_id_foreign` (`product_id`),
  CONSTRAINT `transaction_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transaction_items_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
INSERT INTO `transaction_items` VALUES (4,3,2,'Es Kopi',NULL,3,'gelas',6000,18000,'2026-09-22 16:55:42','2026-09-22 16:55:42'),(5,3,1,'Kopi',NULL,4,'gelas',5000,20000,'2026-09-22 16:55:53','2026-09-22 16:55:53'),(7,6,10,'Es Jeruk',NULL,3,'gelas',4000,12000,'2026-09-22 17:10:39','2026-09-22 17:10:39'),(8,6,21,'Gorengan',NULL,6,'pcs',2000,10000,'2026-09-22 17:10:48','2026-09-22 17:10:48'),(9,6,1,'Kopi',NULL,4,'gelas',5000,20000,'2026-09-22 17:11:00','2026-09-22 17:11:00'),(10,6,2,'Es Kopi',NULL,3,'gelas',7000,21000,'2026-09-22 17:11:09','2026-09-22 17:11:09'),(11,7,11,'Makan','jul',1,'porsi',22,22,'2026-09-22 17:43:04','2026-09-22 17:43:04');
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `transaction_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_date` date NOT NULL,
  `total_amount` decimal(12,0) NOT NULL DEFAULT '0',
  `status` enum('draft','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_transaction_number_unique` (`transaction_number`),
  KEY `transactions_customer_id_foreign` (`customer_id`),
  CONSTRAINT `transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (2,27,'INV-20260923-001','2026-09-23',0,'draft',NULL,'2026-09-22 16:53:33','2026-09-22 16:53:33'),(3,27,'INV-20260923-002','2026-09-23',38000,'draft',NULL,'2026-09-22 16:55:17','2026-09-22 16:55:53'),(6,27,'INV-20260923-003','2026-09-23',63000,'completed',NULL,'2026-09-22 17:10:10','2026-09-22 17:11:24'),(7,10,'INV-20260923-004','2026-09-23',22,'completed',NULL,'2026-09-22 17:42:23','2026-09-22 17:43:14');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-24 13:34:07
