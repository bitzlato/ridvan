
INSERT INTO public.migrations (
    version
) VALUES (
    '002'
);

ALTER TABLE nodes ADD COLUMN is_enabled BOOLEAN NOT NULL DEFAULT TRUE;
