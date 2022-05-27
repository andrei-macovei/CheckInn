CREATE TABLE IF NOT EXISTS bookings(
    id_booking BIGSERIAL PRIMARY KEY,
    id_user BIGSERIAL NOT NULL,
    id_property BIGSERIAL NOT NULL,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    guests INT NOT NULL,
    total_price FLOAT NOT NULL,
    confirmed BOOLEAN,

    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE,
    CONSTRAINT fk_user
    FOREIGN KEY(id_user) REFERENCES users(id_user) ON DELETE CASCADE
)