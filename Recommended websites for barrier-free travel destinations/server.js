const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const { decode } = require('html-entities');
const multer = require('multer');
const mysql = require('mysql2');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const port = 3000;
const saltRounds = 10;
require('dotenv').config(); // 환경 변수 설정
// 공공 데이터 API 서비스 키
const serviceKey = process.env.SERVICE_KEY;
// 날씨 API 키
const weatherApiKey = process.env.WEATHER_API_KEY;


// 지역 코드 매핑
const areaCodes = { 
  '서울': '1',
  '인천': '2',
  '대전': '3',
  '경기도': '31',
  '강원특별자치도': '32',
  '충청북도': '33',
  '충청남도': '34',
  '경상북도': '35',
  '경상남도': '36',
  '전북특별자치도': '37',
  '전라남도': '38',
  '제주도': '39',
  '대구': '4',
  '광주': '5',
  '부산': '6',
  '울산': '7',
  '세종특별자치시': '8'
};

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// uploads 폴더가 없으면 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 업로드 폴더 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(cors());  // CORS 설정
app.use(express.json());  // JSON 요청
app.use(express.urlencoded({ extended: true }));  // URL 인코딩된 요청 파싱

// 정적 파일 경로 설정
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// 세션 설정
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// MySQL 데이터베이스 연결
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0517',
    database: 'webserver3'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// 기본 라우트 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/area-detail/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'area-detail.html'));
});

app.get('/details', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'details.html'));
});

app.get('/details/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'details.html'));
});

app.get('/tourist-spot/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tourist-spot.html'));
});

app.get('/tourist-spot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tourist-spot.html'));
});

// API 엔드포인트: 지역별 여행지 검색
app.post('/search-region', async (req, res) => {
  const { region, pageNo } = req.body;
  const areaCode = areaCodes[region];
  const apiKey = serviceKey;
  const apiUrl = `https://apis.data.go.kr/B551011/KorWithService1/areaBasedList1?MobileOS=ETC&MobileApp=Web&serviceKey=${apiKey}&numOfRows=5&pageNo=${pageNo}&listYN=Y&arrange=O&_type=json&contentTypeId=12&areaCode=${areaCode}`;

  console.log(`Requesting data from API: ${apiUrl}`);

  try {
    const response = await axios.get(apiUrl);
    console.log(`API Response: ${JSON.stringify(response.data)}`);
    const items = response.data.response.body.items.item;
    const totalCount = response.data.response.body.totalCount;

    res.json({ items: items || [], totalCount: totalCount || 0 });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data.');
  }
});

// 배리어 프리 정보 API
app.post('/barrier-free-info', async (req, res) => {
  const { contentId } = req.body;
  const apiKey = 'K02B7xjfQanY0D0uqbmZ4%2F4wpTBKpZfbm9%2FJ1phXZxRFiDw6dPUGZ4NyeP9MZTiKro6k5aSEjG1InPCB6UNW%2BA%3D%3D';
  const apiUrl = `https://apis.data.go.kr/B551011/KorWithService1/detailCommon1?MobileOS=ETC&MobileApp=AppTest&contentId=${contentId}&defaultYN=Y&overviewYN=Y&addrinfoYN=Y&mapinfoYN=Y&_type=json&serviceKey=${apiKey}`;

  console.log(`Requesting barrier-free info data from API: ${apiUrl}`); // 로그 추가

  try {
      const response = await axios.get(apiUrl);
      console.log('Barrier-free info API response:', response.data); // 로그 추가
      res.json(response.data);
  } catch (error) {
      console.error('Error fetching barrier-free info data:', error.message); // 로그 추가
      res.status(500).send('Error fetching barrier-free info data');
  }
});

// 키워드 검색 API
app.post('/search-keyword', async (req, res) => {
  const keyword = req.body.keyword;
  const pageNo = req.body.pageNo || 1;

  const encodedKeyword = encodeURIComponent(keyword);
  const numOfRows = 5;
  const url = `https://apis.data.go.kr/B551011/KorWithService1/searchKeyword1?MobileOS=ETC&MobileApp=web&keyword=${encodedKeyword}&_type=json&numOfRows=${numOfRows}&pageNo=${pageNo}&serviceKey=${serviceKey}`;

  console.log(`Requesting data from API: ${url}`); // 추가된 로그

  try {
    const response = await axios.get(url);
    console.log(`API Response: ${JSON.stringify(response.data)}`); // 추가된 로그
    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).send('No data found');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message); // 추가된 로그
    res.status(500).send('Error fetching data');
  }
});

// 공통 정보 가져오기 API
app.post('/get-common-info', async (req, res) => {
  const contentId = req.body.contentId;

  const url = `https://apis.data.go.kr/B551011/KorWithService1/detailCommon1?MobileOS=ETC&MobileApp=web&contentId=${contentId}&defaultYN=Y&overviewYN=Y&addrinfoYN=Y&mapinfoYN=Y&_type=json&serviceKey=${encodeURIComponent(serviceKey)}`;

  try {
    const response = await axios.get(url);
    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).send('No data found');
    }
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// 장애인 정보 및 이미지 가져오기 API-키워드 조회
app.post('/get-disability-info-and-images', async (req, res) => {
  const contentId = req.body.contentId;

  const disabilityInfoUrl = `https://apis.data.go.kr/B551011/KorWithService1/detailWithTour1?MobileOS=ETC&MobileApp=web&contentId=${contentId}&_type=json&serviceKey=${serviceKey}`;
  const imagesUrl = `https://apis.data.go.kr/B551011/KorWithService1/detailImage1?MobileOS=ETC&MobileApp=web&contentId=${contentId}&imageYN=Y&subImageYN=Y&_type=json&serviceKey=${serviceKey}`;
  const introInfoUrl = `https://apis.data.go.kr/B551011/KorWithService1/detailIntro1?MobileOS=ETC&MobileApp=web&contentId=${contentId}&contentTypeId=12&_type=json&serviceKey=${serviceKey}`;
  const commonInfoUrl = `https://apis.data.go.kr/B551011/KorWithService1/detailCommon1?MobileOS=ETC&MobileApp=web&contentId=${contentId}&defaultYN=Y&overviewYN=Y&addrinfoYN=Y&mapinfoYN=Y&_type=json&serviceKey=${serviceKey}`;

  try {
      const [disabilityInfoResponse, imagesResponse, introInfoResponse, commonInfoResponse] = await Promise.all([
          axios.get(disabilityInfoUrl),
          axios.get(imagesUrl),
          axios.get(introInfoUrl),
          axios.get(commonInfoUrl)
      ]);

      console.log('Disability info API response:', disabilityInfoResponse.data); // 로그 추가
      console.log('Images API response:', imagesResponse.data); // 로그 추가
      console.log('Intro info API response:', introInfoResponse.data); // 로그 추가
      console.log('Common info API response:', commonInfoResponse.data); // 로그 추가

      res.json({
          disabilityInfo: disabilityInfoResponse.data,
          images: imagesResponse.data,
          introInfo: introInfoResponse.data,
          commonInfo: commonInfoResponse.data
      });
  } catch (error) {
      console.error('Error fetching data from APIs:', error.message); // 로그 추가
      res.status(500).send('Error fetching data from APIs');
  }
});

// 날씨 정보 가져오기 API
app.post('/get-weather', async (req, res) => {
  const { lat, lon } = req.body;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=kr`;

  try {
    const response = await axios.get(url);
    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).send('No data found');
    }
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// 회원가입 핸들러
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
          return res.status(500).json({ error: '서버 오류' });
      }
      // 해시된 비밀번호를 데이터베이스에 저장
      const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
      db.query(query, [name, email, hash], function(err) {
          if (err) {
              return res.status(500).json({ error: '회원가입 실패' });
          }
          res.status(200).json({ message: '회원가입 성공' });
      });
  });
});

// 로그인 핸들러
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;

  db.query(query, [email], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send('로그인 중 오류가 발생했습니다.');
      }

      if (results.length > 0) {
          bcrypt.compare(password, results[0].password, (err, isMatch) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send('로그인 중 오류가 발생했습니다.');
              }

              if (isMatch) {
                  req.session.loggedin = true;
                  req.session.userId = results[0].id; // userId를 세션에 저장
                  req.session.email = email;
                  return res.status(200).json({ username: results[0].name });
              } else {
                  return res.status(400).send('아이디 또는 비밀번호가 잘못되었습니다.');
              }
          });
      } else {
          return res.status(400).send('아이디 또는 비밀번호가 잘못되었습니다.');
      }
  });
});

//로그아웃 핸들러
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
      }
      res.clearCookie('connect.sid'); // 세션 쿠키 삭제
      res.redirect('/'); // 로그아웃 후 리다이렉트
  });
});

// 회원탈퇴 핸들러
app.delete('/delete-account', (req, res) => {
  if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
  }
  const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
  db.query(deleteUserQuery, [req.session.userId], (err, result) => {
      if (err) {
          return res.status(500).send('Database error');
      }
      req.session.destroy();
      // 남아있는 회원이 있는지 확인
      const checkUsersQuery = 'SELECT COUNT(*) AS count FROM users';
      db.query(checkUsersQuery, (err, results) => {
          if (err) {
              return res.status(500).send('Failed to check remaining users');
          }
          if (results[0].count === 0) {
              // 남아있는 회원이 없으면 AUTO_INCREMENT 값 재설정
              const resetAutoIncrementQuery = 'ALTER TABLE users AUTO_INCREMENT = 1';
              db.query(resetAutoIncrementQuery, (err, result) => {
                  if (err) {
                      return res.status(500).send('Failed to reset AUTO_INCREMENT');
                  }
                  // 리뷰 테이블 초기화 및 AUTO_INCREMENT 재설정
                  const deleteAllReviewsQuery = 'DELETE FROM reviews';
                  db.query(deleteAllReviewsQuery, (err, result) => {
                      if (err) {
                          return res.status(500).send('Failed to delete reviews');
                      }
                      const resetReviewAutoIncrementQuery = 'ALTER TABLE reviews AUTO_INCREMENT = 1';
                      db.query(resetReviewAutoIncrementQuery, (err, result) => {
                          if (err) {
                              return res.status(500).send('Failed to reset reviews AUTO_INCREMENT');
                          }
                          res.send('Account deleted and AUTO_INCREMENT reset successfully');
                      });
                  });
              });
          } else {
              res.send('Account deleted successfully');
          }
      });
  });
});

// 리뷰 제출
app.post('/submit-review', upload.single('reviewImage'), (req, res) => {
  const userId = req.session.userId; // 세션에서 userId 가져오기
  const spotId = req.body.spotId;
  const reviewText = req.body.reviewText;
  const reviewImage = req.file ? req.file.filename : null;

  if (!userId) {
      return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const query = 'INSERT INTO reviews (user_id, spot_id, content, image) VALUES (?, ?, ?, ?)';
  db.query(query, [userId, spotId, reviewText, reviewImage], (error, results) => {
      if (error) {
          console.error(error);
          res.json({ success: false, message: '리뷰 제출 중 오류가 발생했습니다.' });
      } else {
          res.json({ success: true });
      }
  });
});

// 리뷰 가져오기
app.get('/reviews', (req, res) => {
  const { contentId } = req.query;

  const query = `
      SELECT reviews.*, users.name AS user
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      WHERE reviews.spot_id = ?
  `;
  db.query(query, [contentId], (error, results) => {
      if (error) {
          console.error('Error fetching reviews:', error);
          res.status(500).json({ success: false, message: '리뷰를 가져오는데 실패했습니다.' });
      } else {
          res.json({ success: true, reviews: results });
      }
  });
});

// 내 리뷰 가져오기
app.post('/user-reviews', (req, res) => {
  const userId = req.body.userId; // req.body에서 userId 가져오기
  const query = 'SELECT * FROM reviews WHERE user_id = ?';

  db.query(query, [userId], (error, results) => {
      if (error) {
          console.error('Error fetching reviews:', error);
          res.json({ success: false, message: 'Error fetching reviews' });
      } else {
          res.json({ success: true, reviews: results });
      }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});