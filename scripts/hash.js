const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2] || 'admin'; // 실행 시 인자로 비밀번호 전달 가능
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('원본 비밀번호:', password);
  console.log('해시된 비밀번호:', hash);
  
  // 해시된 비밀번호로 DB 업데이트하는 SQL문
  console.log('\nDB 업데이트 SQL:');
  console.log(`UPDATE admin_profile SET password = '${hash}' WHERE id = 'admin';`);
}

generateHash(); 