ALTER TABLE nodes ADD COLUMN is_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE addresses ADD CONSTRAINT addresses__address__network_key UNIQUE (address, network_key);
