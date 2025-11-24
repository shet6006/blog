-- 배포 전 데이터베이스의 avatar_url을 상대 경로로 수정하는 SQL 스크립트

-- 1. 현재 avatar_url 확인
SELECT id, name, avatar_url FROM admin_profile;

-- 2. localhost URL을 상대 경로로 변경
UPDATE admin_profile 
SET avatar_url = REPLACE(avatar_url, 'http://localhost:3000', '')
WHERE avatar_url LIKE 'http://localhost%';

-- 3. 127.0.0.1 URL을 상대 경로로 변경
UPDATE admin_profile 
SET avatar_url = REPLACE(avatar_url, 'http://127.0.0.1:3000', '')
WHERE avatar_url LIKE 'http://127.0.0.1%';

-- 4. 결과 확인
SELECT id, name, avatar_url FROM admin_profile;

-- 5. 기본값으로 재설정 (필요한 경우)
-- UPDATE admin_profile 
-- SET avatar_url = '/placeholder.png'
-- WHERE id = 'admin' AND (avatar_url IS NULL OR avatar_url = '');

