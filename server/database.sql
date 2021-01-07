CREATE DATABASE interests;

CREATE TABLE profile (
	profile_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	profile_name varchar(255),
	profile_picture bytea,
	profile_info varchar(3071)
)

CREATE TABLE friends (
	_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	friend_id uuid NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (friend_id) REFERENCES users (user_id)
)