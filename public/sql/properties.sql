CREATE TABLE IF NOT EXISTS properties(
    id_property BIGSERIAL PRIMARY KEY,
    id_host BIGINT,
    title VARCHAR(100),
    property_type VARCHAR(20) NOT NULL,
    privacy VARCHAR(20) NOT NULL,
    guests INTEGER,
    bathrooms INTEGER,
    kitchen BOOLEAN,
    description TEXT,
    price NUMERIC(10,2),
    week_discount NUMERIC(2) DEFAULT 0,
    rating NUMERIC(3,2),
	checkin TIME,
    checkout TIME,
    for_kids BOOLEAN,
    smoking_allowed BOOLEAN,
    pets_allowed BOOLEAN,
    events_allowed BOOLEAN,
    CONSTRAINT fk_user
    FOREIGN KEY(id_host) REFERENCES users(id_user)
)

CREATE TABLE IF NOT EXISTS rooms(
    id_room BIGSERIAL PRIMARY KEY,
    id_property BIGINT,
    room_type VARCHAR(20),
    single_beds INT,
    double_beds INT,
    bunk_beds INT,
    other INT,
    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS bathroom_amenities(
    id_amenities BIGSERIAL PRIMARY KEY,
    id_property BIGINT UNIQUE,
    shower_gel BOOLEAN,
    shampoo BOOLEAN,
    bath_tub BOOLEAN,
    bathrobe BOOLEAN,
    washing_machine BOOLEAN,
    laundry_dryer BOOLEAN,
    bidet BOOLEAN,
    jacuzzi BOOLEAN,

    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS kitchen_amenities(
    id_amenities BIGSERIAL PRIMARY KEY,
    id_property BIGINT UNIQUE,
    kitchen BOOLEAN,
    fridge BOOLEAN,
    freezer BOOLEAN,
    cooker BOOLEAN,
    oven BOOLEAN,
    microwave BOOLEAN,
    cutlery BOOLEAN,
    cooking_essentials BOOLEAN,
    coffee BOOLEAN,
    kettle BOOLEAN,
    blender BOOLEAN,
    dishwasher BOOLEAN,

    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS general_amenities(
    id_amenities BIGSERIAL PRIMARY KEY,
    id_property BIGINT UNIQUE,
    essentials BOOLEAN,
    wifi BOOLEAN,
    tv BOOLEAN,
    iron BOOLEAN,
    heating BOOLEAN,
    air_conditioning BOOLEAN,
    desk BOOLEAN,
    free_parking BOOLEAN,
    paid_parking BOOLEAN,
    security_cameras BOOLEAN,
    safe BOOLEAN,
    smoke_detectors BOOLEAN,
    balcony BOOLEAN,
    outdoor_space BOOLEAN,

    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
)
-- DO NOT ADD TO DATABASE: just for reference --
CREATE TABLE IF NOT EXISTS amenities(
    id_amenities BIGSERIAL PRIMARY KEY,
    id_property BIGINT UNIQUE,
    bathrooms INT,
    -- BATHROOM --
    shower_gel BOOLEAN,
    shampoo BOOLEAN,
    bath_tub BOOLEAN,
    bathrobe BOOLEAN,
    washing_machine BOOLEAN,
    bidet BOOLEAN,
    jacuzzi BOOLEAN,
    -- KITCHEN --
    kitchen BOOLEAN,
    fridge BOOLEAN,
    cooker BOOLEAN,
    oven BOOLEAN,
    microwave BOOLEAN,
    cutlery BOOLEAN,
    cooking_essentials BOOLEAN,
    coffee BOOLEAN,
    kettle BOOLEAN,
    blender BOOLEAN,
    dishwasher BOOLEAN,
    -- GENERAL --
    essentials BOOLEAN,
    wifi BOOLEAN,
    tv BOOLEAN,
    iron BOOLEAN,
    heating BOOLEAN,
    air_conditioning BOOLEAN,
    desk BOOLEAN,
    free_parking BOOLEAN,
    paid_parking BOOLEAN,
    security_cameras BOOLEAN,
    safe BOOLEAN,
    smoke_detectors BOOLEAN,
    balcony BOOLEAN,
    outdoor_space BOOLEAN,

    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS address(
    id_address BIGSERIAL PRIMARY KEY,
    id_property BIGINT UNIQUE,
    street_and_number VARCHAR(50),
    neighbourhood VARCHAR(50),
    city VARCHAR(30),
    region VARCHAR(30),
    country VARCHAR(30),
    postal_code VARCHAR(30),
    lat VARCHAR(10),
    lng VARCHAR(10),
    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS photos(
    id_photos BIGSERIAL PRIMARY KEY,
    id_property BIGINT UNIQUE,
    big_picture TEXT,
    small_pic_1 TEXT,
    small_pic_2 TEXT,
    small_pic_3 TEXT,
    small_pic_4 TEXT,
    CONSTRAINT fk_property
    FOREIGN KEY(id_property) REFERENCES properties(id_property) ON DELETE CASCADE
);