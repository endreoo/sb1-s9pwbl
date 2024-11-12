export const schema = `
  -- Previous tables remain...

  -- Digitize revenue tracking
  CREATE TABLE IF NOT EXISTS digitize_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS digitize_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS digitize_client_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    custom_fee DECIMAL(10,2),
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES digitize_clients(id),
    FOREIGN KEY (product_id) REFERENCES digitize_products(id)
  );

  CREATE TABLE IF NOT EXISTS digitize_revenue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT CHECK(status IN ('PENDING', 'PAID', 'OVERDUE')) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES digitize_clients(id)
  );

  CREATE TABLE IF NOT EXISTS digitize_revenue_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    revenue_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (revenue_id) REFERENCES digitize_revenue(id),
    FOREIGN KEY (product_id) REFERENCES digitize_products(id)
  );
`;