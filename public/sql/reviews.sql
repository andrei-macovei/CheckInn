CREATE TABLE IF NOT EXISTS reviews(
    id_review BIGSERIAL PRIMARY KEY,
    id_property BIGINT,
    id_user BIGINT,
    clean_score NUMERIC(3,2) NOT NULL,
    location_score NUMERIC(3,2) NOT NULL,
    comfort_score NUMERIC(3,2) NOT NULL,
    value_score NUMERIC(3,2) NOT NULL,
    total_score NUMERIC(3,2) NOT NULL,
    review_text TEXT,

    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE,
    CONSTRAINT fk_user
    FOREIGN KEY(id_user) REFERENCES users(id_user) ON DELETE SET NULL
)