-- 소개 페이지 테이블 추가
CREATE TABLE IF NOT EXISTS about_page (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT '소개',
    content LONGTEXT NOT NULL,
    tech_stack JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 초기 데이터 삽입
INSERT INTO about_page (title, content, tech_stack) VALUES 
(
    '소개',
    '# 안녕하세요! 👋\n\n개발자 블로그에 오신 것을 환영합니다.\n\n이 블로그에서는 웹 개발, 프로그래밍, 기술 스택 등에 대한 경험과 지식을 공유합니다.',
    JSON_ARRAY('Next.js', 'TypeScript', 'React', 'Node.js', 'MySQL', 'Tailwind CSS')
);

