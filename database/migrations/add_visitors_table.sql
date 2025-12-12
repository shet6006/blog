-- 방문자 테이블 생성
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    visit_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_visitor_per_day (ip_address, visit_date),
    INDEX idx_visit_date (visit_date),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- admin_profile 테이블에 방문자 수 표시 설정 추가
-- MySQL에서는 IF NOT EXISTS를 지원하지 않으므로, 컬럼이 없을 때만 추가
SET @dbname = DATABASE();
SET @tablename = 'admin_profile';
SET @columnname = 'show_visitor_count';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT TRUE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 기존 방문자 데이터 초기화 (필요시)
-- TRUNCATE TABLE visitors;

