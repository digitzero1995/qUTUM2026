-- Quantum app SQL schema (MySQL / MariaDB compatible)
-- Create the database (run as a user with CREATE DATABASE privileges or create it from CloudPanel UI)
-- Example: CREATE DATABASE quantum_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Switch to the database you created
-- USE quantum_db;

-- Followers (accounts)
CREATE TABLE IF NOT EXISTS followers (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(120) UNIQUE,
  password VARCHAR(255),
  telegram_id VARCHAR(120),
  initial_balance DECIMAL(20,2) NOT NULL DEFAULT 0,
  risk_profile ENUM('Conservative','Moderate','Aggressive') NOT NULL DEFAULT 'Moderate',
  lot_multiplier DECIMAL(10,4) NOT NULL DEFAULT 1,
  per_account_cap DECIMAL(20,2) NOT NULL DEFAULT 0,
  daily_loss_limit DECIMAL(20,2) NOT NULL DEFAULT 0,
  max_exposure_per_symbol DECIMAL(20,2) NOT NULL DEFAULT 0,
  current_pl DECIMAL(20,2) NOT NULL DEFAULT 0,
  status ENUM('Active','Paused','Disconnected') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trades
CREATE TABLE IF NOT EXISTS trades (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  timestamp VARCHAR(50) NOT NULL,
  account VARCHAR(50) NOT NULL,
  symbol VARCHAR(80) NOT NULL,
  type ENUM('Market','Limit','Stop') NOT NULL,
  side ENUM('Buy','Sell') NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(20,4) NOT NULL DEFAULT 0,
  status ENUM('Filled','Partial Fill','Cancelled','Pending') NOT NULL DEFAULT 'Pending',
  is_new TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_account (account),
  CONSTRAINT fk_trades_follower FOREIGN KEY (account) REFERENCES followers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs
CREATE TABLE IF NOT EXISTS logs (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  level ENUM('Info','Warning','Error','Intervention') NOT NULL DEFAULT 'Info',
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed followers (from src/lib/data.ts)
INSERT INTO followers (id, name, username, password, telegram_id, initial_balance, risk_profile, lot_multiplier, per_account_cap, daily_loss_limit, max_exposure_per_symbol, current_pl, status)
VALUES
('ZERODHA-001', 'Follower One', 'follower1', 'password1', '@followerone', 10000.00, 'Moderate', 1.0000, 100000.00, 5000.00, 25000.00, 1250.75, 'Active'),
('UPSTOX-002', 'Follower Two', 'follower2', 'password2', NULL, 25000.00, 'Aggressive', 2.0000, 250000.00, 20000.00, 75000.00, -850.00, 'Active'),
('ANGEL-003', 'Follower Three', 'follower3', 'password3', NULL, 5000.00, 'Conservative', 0.5000, 50000.00, 2500.00, 10000.00, 450.20, 'Paused')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), username = VALUES(username), password = VALUES(password), initial_balance = VALUES(initial_balance), current_pl = VALUES(current_pl), status = VALUES(status);

-- Seed trades (from src/lib/data.ts)
INSERT INTO trades (id, timestamp, account, symbol, type, side, quantity, price, status, is_new)
VALUES
('T001','10:30:05','Master','RELIANCE','Market','Buy',100,2850.50,'Filled',0),
('T002','10:32:15','Master','TCS','Limit','Sell',50,3900.00,'Pending',0),
('T003','10:35:40','Master','INFY','Market','Buy',200,1650.25,'Filled',0),
('T004','10:45:10','Master','HDFCBANK','Market','Sell',75,1550.80,'Filled',0),
('T101','11:01:15','ZERODHA-001','WIPRO','Market','Buy',50,480.10,'Filled',0),
('T102','11:05:20','UPSTOX-002','RELIANCE','Market','Sell',200,2855.00,'Filled',0)
ON DUPLICATE KEY UPDATE
  timestamp = VALUES(timestamp), account = VALUES(account), symbol = VALUES(symbol), price = VALUES(price), status = VALUES(status);

-- Seed logs (from src/lib/data.ts)
INSERT INTO logs (id, timestamp, level, message)
VALUES
('L001', '2024-07-30 10:30:05', 'Info', 'Master order placed: BUY 100 RELIANCE @ Market'),
('L002', '2024-07-30 10:30:06', 'Info', 'Mirrored order to FA-001: BUY 100 RELIANCE @ Market'),
('L003', '2024-07-30 10:30:06', 'Info', 'Mirrored order to FA-002: BUY 200 RELIANCE @ Market'),
('L004', '2024-07-30 10:30:07', 'Info', 'Mirrored order to FA-003: BUY 50 RELIANCE @ Market'),
('L005', '2024-07-30 11:15:20', 'Info', 'Master order placed: SELL 50 TCS @ Limit 3900.00'),
('L006', '2024-07-30 12:05:10', 'Warning', 'FA-002 approaching daily loss limit. Current loss: -18,540.00'),
('L007', '2024-07-30 12:10:00', 'Intervention', 'Trading paused for FA-002. Daily loss limit of 20,000 exceeded.')
ON DUPLICATE KEY UPDATE level = VALUES(level), message = VALUES(message), timestamp = VALUES(timestamp);

-- Helpful quick queries
-- List followers: SELECT * FROM followers ORDER BY name;
-- Recent trades: SELECT * FROM trades ORDER BY created_at DESC LIMIT 100;
-- Recent logs: SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100;
