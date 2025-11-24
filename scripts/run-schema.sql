-- 데이터베이스 스키마 실행 스크립트
-- 사용법: mysql -h [host] -u [user] -p < scripts/run-schema.sql

USE personal_blog;

-- 기존 테이블 삭제 (주의: 모든 데이터 삭제됨)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admin_profile;

-- 카테고리 테이블
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 관리자 프로필 테이블
CREATE TABLE admin_profile (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'admin',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    github_username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 게시글 테이블
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id INT,
    author_id VARCHAR(50) NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    github_commit_url VARCHAR(500),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES admin_profile(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_created_at (created_at)
);

-- 댓글 테이블
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
);

-- 좋아요 테이블
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, device_id),
    INDEX idx_post_id (post_id)
);

-- 초기 데이터 삽입
INSERT INTO categories (name, slug, description) VALUES
('기술', 'tech', '기술 관련 게시글'),
('일상', 'daily', '일상 관련 게시글'),
('프로젝트', 'project', '프로젝트 관련 게시글');

INSERT INTO admin_profile (id, name, email, password, avatar_url, github_username) VALUES 
('admin', '김개발', 'admin@example.com', '$2a$10$PLACEHOLDER', '/placeholder.svg', 'developer');

SELECT '✅ 스키마 실행 완료!' AS result;

