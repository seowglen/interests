-- DATABASE CONFIG FOR DEPLOYMENT USE

CREATE DATABASE interests;

CREATE TABLE users (
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_name varchar(255) NOT NULL,
	user_email varchar(255) NOT NULL,
	user_password varchar(255) NOT NULL,
	profile_id uuid
)

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

CREATE TABLE posts (
	post_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	time_stamp timestamp,
	post varchar(3071),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
)

INSERT INTO posts (user_id, time_stamp, post)
VALUES ('678fde77-6d41-4228-905d-0360ca10c922', to_timestamp(1610907548), 'Whats up fam boiisssss')

INSERT INTO comments (post_id, user_id, time_stamp, comment)
VALUES ('e6584f5e-6eb4-4321-b741-101406dec46d', '678fde77-6d41-4228-905d-0360ca10c922', to_timestamp(1610911433), 'Sell it for $1 and we good fam')

CREATE TABLE likes (
	like_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	FOREIGN KEY (post_id) REFERENCES posts (post_id),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
)

CREATE TABLE comments (
	comment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	time_stamp timestamp,
	comment varchar(3071),
	FOREIGN KEY (post_id) REFERENCES posts (post_id),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
)