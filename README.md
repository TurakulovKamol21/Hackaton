# Xarajatlarni toifalash vositasi

Hackathon uchun tayyorlangan MVP personal finance ilova:

- `backend/`: Spring Boot REST API, PostgreSQL, session-based security, Google OAuth2 support
- `frontend/`: React + Vite dashboard

## Qamrab olingan funksiyalar

- account va kartalar yaratish, joriy balansni ko‘rish
- income/expense qo‘shish, tahrirlash, o‘chirish
- transfer va valyuta konvertatsiyasi
- qarz va haqdorliklar, `OPEN/CLOSED` holati
- oylik income target va category bo‘yicha expense limit
- dashboard statistikasi: umumiy balans, category stats, daily/weekly/monthly/yearly trend, calendar view
- rule-based insight va ogohlantirishlar: budget oshishi, cashflow warning, debt due-date eslatmasi
- telefon raqam + parol orqali register/login
- `confirm password` validatsiyasi
- Google orqali login (`GOOGLE_CLIENT_ID` va `GOOGLE_CLIENT_SECRET` berilganda)
- har bir user faqat o‘ziga tegishli finance ma’lumotlarini ko‘radi

## Infra

Default konfiguratsiya:

- Postgres host: `localhost:5432`
- database: `finance_app`
- username: `postgres`
- password: `postgres`

Lokal Postgres yo‘q bo‘lsa, `docker compose up -d postgres` bilan ko‘tarish mumkin.

## Ishga tushirish

Backend:

```bash
docker compose up -d postgres
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173`, backend `http://localhost:8080` da ishlaydi.

## Google login

Google login ishlashi uchun backend ishga tushirishdan oldin env larni bering:

```bash
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Test va build

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run build
```

## Izoh

- Oila a'zolari bilan shared workflow bonus sifatida ochiq qoldirilgan.
# Hackaton
