-- Groups System Schema
-- Enables users to organize companies and URLs into named groups
-- Page groups take precedence over company groups

-- Groups table - stores named groups like "Competitors", "Pricing Pages", etc.
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company group assignments - assign entire companies to groups
CREATE TABLE IF NOT EXISTS company_groups (
    company_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (company_id, group_id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- URL group assignments - assign specific URLs to groups (takes precedence)
CREATE TABLE IF NOT EXISTS url_groups (
    url_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (url_id, group_id),
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_groups_company_id ON company_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_company_groups_group_id ON company_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_url_groups_url_id ON url_groups(url_id);
CREATE INDEX IF NOT EXISTS idx_url_groups_group_id ON url_groups(group_id);

-- Insert some default groups to get started
INSERT OR IGNORE INTO groups (name, description, color) VALUES 
    ('Direct Competitors', 'Companies that directly compete with us', '#dc2626'),
    ('Indirect Competitors', 'Companies in adjacent markets', '#ea580c'),
    ('Partners', 'Current and potential partners', '#16a34a'),
    ('Tech Stack', 'Technology and platform companies', '#2563eb'),
    ('Pricing Pages', 'Pricing and subscription pages', '#7c3aed'),
    ('Product Updates', 'Product announcement and feature pages', '#0891b2'),
    ('General Monitoring', 'Uncategorized monitoring targets', '#6b7280');
