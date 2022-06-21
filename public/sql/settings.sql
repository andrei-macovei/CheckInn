CREATE TABLE IF NOT EXISTS global_settings(
    id_settings BIGSERIAL PRIMARY KEY,
    background VARCHAR
);

CREATE TABLE IF NOT EXISTS destinations(
    id_destination BIGSERIAL PRIMARY KEY,
    id_settings BIGINT,
    picture VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,

    CONSTRAINT fk_settings
    FOREIGN KEY(id_settings) REFERENCES global_settings(id_settings) ON DELETE CASCADE
)