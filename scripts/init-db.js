import mysql from 'mysql2/promise';
import 'dotenv/config';

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'korcha_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'korcha_db',
    multipleStatements: true
  });

  console.log('Connected to MySQL. Setting up tables...');

  const schema = `
    CREATE TABLE IF NOT EXISTS system_settings (
      setting_key VARCHAR(50) PRIMARY KEY,
      setting_value VARCHAR(255) NOT NULL,
      description VARCHAR(255) NULL
    );

    INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('usd_to_etb_rate', '125.00', 'Exchange rate USD to ETB'),
    ('air_freight_per_kg_etb', '1600.00', 'Guangzhou to Bole air cargo per kg'),
    ('service_margin_percent', '10', 'Platform commission margin'),
    ('default_customs_percent', '25', 'Estimated customs duty')
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(30) UNIQUE NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      pickup_location VARCHAR(150) NULL,
      source_url TEXT NOT NULL,
      product_title VARCHAR(255) NOT NULL,
      product_image TEXT NULL,
      selected_size VARCHAR(50) NULL,
      selected_color VARCHAR(50) NULL,
      usd_price DECIMAL(10,2) NOT NULL,
      total_etb INT NOT NULL,
      pricing_breakdown JSON NULL,
      status VARCHAR(50) DEFAULT 'pending_payment',
      tracking_number VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'telebirr',
      amount_etb INT NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      gateway_response JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await connection.query(schema);
  console.log('Database initialized successfully!');
  await connection.end();
}

init().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});