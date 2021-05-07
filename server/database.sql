-- DATABASE CONFIG FOR DEPLOYMENT USE

CREATE DATABASE interests;

CREATE TABLE users (
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_name varchar(255) NOT NULL,
	user_email varchar(255) NOT NULL,
	user_password varchar(255) NOT NULL,
	profile_id uuid
);

CREATE TABLE profile (
	profile_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	profile_name varchar(255),
	profile_picture varchar(761),
	profile_info varchar(3071)
);

CREATE TABLE friends (
	_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	friend_id uuid NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (friend_id) REFERENCES users (user_id)
);

CREATE TABLE posts (
	post_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	time_stamp timestamp,
	post varchar(3071),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE forum_posts (
	forum_post_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	forum_title varchar(3071),
	forum_post varchar(3071),
	view_count int,
	time_stamp timestamp,
	FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE forum_comments (
	forum_comment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	forum_post_id uuid NOT NULL,
	time_stamp timestamp,
	forum_comment varchar(3071),
	parent_comment_id uuid,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (forum_post_id) REFERENCES forum_posts (forum_post_id)
);

-- INSERT INTO posts (user_id, time_stamp, post)
-- VALUES ('678fde77-6d41-4228-905d-0360ca10c922', to_timestamp(1610907548), 'Whats up fam boiisssss')

-- INSERT INTO comments (post_id, user_id, time_stamp, comment)
-- VALUES ('e6584f5e-6eb4-4321-b741-101406dec46d', '678fde77-6d41-4228-905d-0360ca10c922', to_timestamp(1610911433), 'Sell it for $1 and we good fam')

CREATE TABLE likes (
	like_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	FOREIGN KEY (post_id) REFERENCES posts (post_id),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE comments (
	comment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	time_stamp timestamp,
	comment varchar(3071),
	FOREIGN KEY (post_id) REFERENCES posts (post_id),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE groups(
	group_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	group_name varchar(255),
	group_picture varchar(761),
	group_info varchar(3071)
);

CREATE TABLE user_group (
	_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	group_id uuid NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (group_id) REFERENCES groups (group_id)
);


-- COPY THIS TABLE BELOW FOR THE FYP REPORT

CREATE TABLE users (
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_name varchar(255) NOT NULL,
	user_email varchar(255) NOT NULL,
	user_password varchar(255) NOT NULL,
	profile_id uuid,
  	FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

CREATE TABLE profile (
	profile_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	profile_name varchar(255),
	profile_picture varchar(761),
	profile_info varchar(3071)
);

CREATE TABLE friends (
	_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	friend_id uuid NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (friend_id) REFERENCES users (user_id)
);

CREATE TABLE posts (
	post_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	group_name varchar(255),
	time_stamp timestamp,
	post varchar(3071),
	FOREIGN KEY (user_id) REFERENCES users (user_id),
);

CREATE TABLE forum_posts (
	forum_post_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	group_id uuid NOT NULL,
	forum_title varchar(3071),
	forum_post varchar(3071),
	view_count int,
	time_stamp timestamp,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (group_id) REFERENCES groups (group_id)
);

CREATE TABLE forum_comments (
	forum_comment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	forum_post_id uuid NOT NULL,
	time_stamp timestamp,
	forum_comment varchar(3071),
	parent_comment_id uuid,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (forum_post_id) REFERENCES forum_posts (forum_post_id)
);

CREATE TABLE likes (
	like_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	FOREIGN KEY (post_id) REFERENCES posts (post_id),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE comments (
	comment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	time_stamp timestamp,
	comment varchar(3071),
	FOREIGN KEY (post_id) REFERENCES posts (post_id),
	FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE groups(
	group_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	group_name varchar(255),
	group_picture varchar(761),
	group_info varchar(3071),
	administrator uuid NOT NULL,
	FOREIGN KEY (administrator) REFERENCES users (user_id)
);

CREATE TABLE user_group (
	_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	group_id uuid NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (group_id) REFERENCES groups (group_id)
);

CREATE TABLE notifications(
	notification_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	other_user_id uuid NOT NULL,
	time_stamp timestamp,
	notification varchar(512),
	seen boolean,
	FOREIGN KEY (user_id) REFERENCES users (user_id),
	FOREIGN KEY (other_user_id) REFERENCES users (user_id)
);