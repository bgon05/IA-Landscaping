-- create_db.sql
-- Run this in MySQL to create the database and tables

CREATE DATABASE IF NOT EXISTS ia_landscaping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ia_landscaping;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  property_size VARCHAR(50),
  services_interested VARCHAR(255),
  address VARCHAR(255),
  phone VARCHAR(20),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
