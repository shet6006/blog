-- 블로그 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog;

-- 카테고리 테이블
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
);

-- 게시글 테이블
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    category_id INT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    github_commit_url VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    author_id VARCHAR(50) DEFAULT 'admin',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_public (is_public),
    INDEX idx_created (created_at)
);

-- 댓글 테이블
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_created (created_at)
);

-- 좋아요 테이블
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, device_id),
    INDEX idx_post (post_id)
);

-- 관리자 프로필 테이블
CREATE TABLE admin_profile (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'admin',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL, -- 비밀번호 해시 저장
    avatar_url VARCHAR(500),
    github_username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 초기 데이터 삽입
INSERT INTO categories (name, slug) VALUES 
('Frontend', 'frontend'),
('Backend', 'backend'),
('TypeScript', 'typescript'),
('React', 'react'),
('DevOps', 'devops');

INSERT INTO admin_profile (id, name, email, avatar_url, github_username) VALUES 
('admin', '김개발', 'admin@example.com', '/placeholder.svg?height=32&width=32', 'developer');

-- 샘플 게시글 데이터
INSERT INTO posts (title, content, excerpt, category_id, slug, github_commit_url, is_public, likes_count, comments_count) VALUES 
(
    'Next.js 14 App Router 완벽 가이드',
    '# Next.js 14 App Router 완벽 가이드\n\nNext.js 14에서 도입된 App Router는 React의 최신 기능들을 활용하여 더욱 강력하고 유연한 라우팅 시스템을 제공합니다.\n\n## 주요 특징\n\n### 1. 파일 시스템 기반 라우팅\nApp Router는 `app` 디렉토리 내의 폴더 구조를 기반으로 라우트를 생성합니다.',
    'Next.js 14의 새로운 App Router를 활용한 모던 웹 개발 방법을 알아봅시다.',
    1,
    'nextjs-14-app-router-guide',
    'https://github.com/user/repo/commit/abc123',
    TRUE,
    24,
    8
),
(
    'TypeScript 고급 타입 시스템',
    '# TypeScript 고급 타입 시스템\n\nTypeScript의 고급 타입 기능들을 활용하여 더 안전한 코드를 작성하는 방법을 알아보겠습니다.\n\n## 유니온 타입과 교차 타입\n\n### 유니온 타입 (Union Types)\n```typescript\ntype Status = ''loading'' | ''success'' | ''error''\n```',
    'TypeScript의 고급 타입 기능들을 활용하여 더 안전한 코드를 작성하는 방법',
    3,
    'typescript-advanced-types',
    'https://github.com/user/repo/commit/def456',
    TRUE,
    18,
    5
),
(
    'React Server Components 심화',
    '# React Server Components 심화\n\nReact Server Components의 동작 원리와 실제 프로젝트 적용 사례를 살펴보겠습니다.\n\n## Server Components란?\n\nServer Components는 서버에서 렌더링되는 React 컴포넌트입니다.',
    'React Server Components의 동작 원리와 실제 프로젝트 적용 사례',
    4,
    'react-server-components-deep-dive',
    NULL,
    FALSE,
    31,
    12
);

-- 샘플 댓글 데이터
INSERT INTO comments (post_id, author_name, content, device_id, is_admin) VALUES 
(1, '익명의 개발자', '정말 유용한 글이네요! App Router 마이그레이션을 고민하고 있었는데 많은 도움이 되었습니다.', 'device-1', FALSE),
(1, '김개발', '감사합니다! 추가로 궁금한 점이 있으시면 언제든 댓글로 남겨주세요.', 'admin-device', TRUE);

-- 샘플 좋아요 데이터
INSERT INTO likes (post_id, device_id) VALUES 
(1, 'device-1'),
(1, 'device-2'),
(2, 'device-1');
