CREATE IF NOT EXISTS DATABASE dormdash;
 -- Backup existing database if needed
USE dormdash;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- users table already exists (id, full_name, email, password_hash, created_at)
ALTER TABLE users
  ADD COLUMN role ENUM('rider','driver') DEFAULT 'rider',
  ADD COLUMN phone VARCHAR(30),
  ADD COLUMN avatar_url VARCHAR(255),
  ADD COLUMN rating FLOAT DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  ADD COLUMN fcm_token VARCHAR(255); -- for push notifications
  ADD COLUMN is_verified BOOLEAN DEFAULT FALSE; -- email/phone verification
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS driver_profiles (
  user_id INT PRIMARY KEY,
  vehicle_make VARCHAR(100) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_plate VARCHAR(50) NOT NULL UNIQUE,
  seats INT DEFAULT 4 CHECK (seats > 0 AND seats <= 8),
  license_number VARCHAR(100) NOT NULL UNIQUE,
  driver_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rider_id INT NOT NULL,
  driver_id INT NOT NULL,
  pickup_lat DOUBLE NOT NULL,
  pickup_lng DOUBLE NOT NULL,
  dest_lat DOUBLE NOT NULL,
  dest_lng DOUBLE NOT NULL,
  fare DECIMAL(8,2),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- when ride actually starts
  completed_at TIMESTAMP NULL,                     -- filled in once the ride ends
  FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);