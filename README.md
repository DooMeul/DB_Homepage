# 📁 Portfolio Homepage - GitHub 포트폴리오 공유 웹 서비스

로그인한 사용자가 자신의 GitHub 프로젝트를 올리고, 다른 사람이 올린 프로젝트를 둘러볼 수 있는 포트폴리오 공유 웹 서비스입니다.
프로젝트마다 설명, 기술 스택, 카테고리, GitHub·데모 링크를 함께 등록할 수 있습니다.

- **기간**: 2025.11 (약 2주)
- **인원**: 1명 (개인 프로젝트)
- **구분**: 인하공업전문대학 데이터베이스설계및구축 기말 과제
- **배포**: AWS EC2

<br>

## 🛠 Tech Stack

| 구분 | 사용 기술 |
|---|---|
| 서버 | Node.js, Express |
| 화면 | EJS, CSS |
| 데이터베이스 | MySQL (mysql2) |
| 인증 | express-session |
| 배포 | AWS EC2 |

<br>

## ✨ 주요 기능

- **회원가입 / 로그인**: 세션 기반 로그인·로그아웃, 이미 가입된 이메일이면 안내 메시지 표시
- **포트폴리오 등록·조회·수정·삭제**: 제목, 설명, 기술 스택, 카테고리, GitHub URL, 데모 URL 입력
- **작성자 권한 확인**: 수정·삭제는 작성자 본인만 가능하고, 다른 사람이 시도하면 403 응답
- **로그인 필요 기능 제한**: 등록·수정·삭제는 로그인한 사용자만 접근 가능
- **목록 페이지네이션**: 최신순으로 한 페이지에 6개씩 표시
- **카테고리**: 웹, 모바일, 데이터 사이언스, 인프라, 게임, 기타 중 선택

<br>

## 🗄 DB 구조

```
users                          portfolios
─────────────                  ──────────────────
user_id (PK)  ◀──────────┐     portfolio_id (PK)
user_name                └──── user_id (FK)
email (UNIQUE)                 title
password                       description
                               technologies
                               category
                               github_url
                               demo_url
                               created_at
```

- 회원 한 명이 여러 포트폴리오를 가질 수 있는 1:N 관계입니다.
- 카테고리는 기능을 나중에 추가하면서 마이그레이션 SQL(`migrations/add_category_column.sql`)로 기존 테이블에 컬럼을 더했습니다.

<br>

## 🏗 폴더 구조

```
src
├── app.js                 # 서버 설정, 세션, 라우터 연결
├── config/db.js           # MySQL 연결
├── routes
│   ├── index.js           # 홈, 로그인, 회원가입, 로그아웃
│   └── portfolios.js      # 포트폴리오 등록·조회·수정·삭제, 권한 확인
├── views                  # EJS 화면 (홈, 로그인, 회원가입, 포트폴리오 목록·상세·작성·수정)
└── public/css             # 스타일
```

<br>

## ▶ 실행 방법

**1. DB 준비 (MySQL)**

```sql
CREATE DATABASE portfolio_db;
USE portfolio_db;

CREATE TABLE users (
    user_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_name  VARCHAR(50)  NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL
);

CREATE TABLE portfolios (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT,
    title        VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL,
    technologies VARCHAR(255),
    category     VARCHAR(100) DEFAULT NULL,
    github_url   VARCHAR(255) NOT NULL,
    demo_url     VARCHAR(255),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

카테고리 컬럼이 없는 예전 테이블이라면 `migrations/add_category_column.sql`을 실행하면 됩니다.

**2. 실행**

DB 접속 정보는 코드에 넣지 않고 환경변수로 넘깁니다. (`DB_HOST`, `DB_USER`, `DB_NAME`은 생략하면 `localhost`, `root`, `portfolio_db`)

```bash
npm install
DB_PASSWORD=비밀번호 npm start        # 개발 중에는 npm run dev (nodemon)
```

Windows PowerShell에서는 `$env:DB_PASSWORD="비밀번호"; npm start` 로 실행합니다.

브라우저에서 `http://localhost:3000` 으로 접속합니다.

<br>

## 💡 배운 점 / 개선하고 싶은 점

- 수업에서 배운 Express·MySQL 구조를 다른 서비스에 응용해 보면서 라우터, DB, 화면의 역할을 나누는 방법을 익혔습니다.
- 수정·삭제 요청이 들어올 때 서버에서 작성자를 다시 확인해야 한다는 것을 직접 구현하며 알게 됐습니다.
- 개선할 점
  - 비밀번호를 해시(bcrypt 등)로 저장하기
  - 카테고리·기술 스택으로 목록을 걸러 보는 검색 기능 추가
