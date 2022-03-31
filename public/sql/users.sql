CREATE TABLE IF NOT EXISTS users (
   id_user serial PRIMARY KEY,
   firstname VARCHAR(100) NOT NULL,
   lastname VARCHAR(100) NOT NULL,
   email VARCHAR(50) NOT NULL,
   phone VARCHAR(15),
   password VARCHAR(100) NOT NULL,
   join_date DATE DEFAULT current_date,
   birthday DATE,
   profile_picture VARCHAR(300),
   token VARCHAR(50),
   confirmed BOOLEAN
);