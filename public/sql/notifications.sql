CREATE TABLE IF NOT EXISTS notifications(
    id_notif BIGSERIAL PRIMARY KEY,
    id_user BIGSERIAL NOT NULL,
    type VARCHAR NOT NULL,
    text VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    viewed BOOLEAN DEFAULT false,

    CONSTRAINT fk_user
    FOREIGN KEY(id_user) REFERENCES users(id_user) ON DELETE CASCADE
)