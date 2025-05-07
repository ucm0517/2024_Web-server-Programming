-- 데이터베이스 사용
USE webserver3;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
select * from users;


-- reviews 테이블 삭제
DROP TABLE reviews;
-- reviews 테이블 재생성
CREATE TABLE `reviews` (
   `id` int NOT NULL AUTO_INCREMENT,
   `user_id` int NOT NULL,
   `spot_id` int NOT NULL,
   `content` text,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `image` varchar(255) DEFAULT NULL,
   PRIMARY KEY (`id`),
   KEY `user_id` (`user_id`),
   KEY `spot_id` (`spot_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- 현재 테이블 구조 확인
SHOW CREATE TABLE reviews;
-- 기존 외래 키 제약 조건 제거
ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_user;
-- 외래 키 제약 조건 추가 (다른 이름 사용)
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_user_new
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- 기존 데이터 확인
SELECT * FROM reviews;
SELECT * FROM users;