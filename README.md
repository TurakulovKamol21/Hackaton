# Xarajatlarni toifalash vositasi

Hackathon uchun tayyorlangan MVP personal finance ilova:

- `backend/`: Spring Boot REST API, H2 database, seeded demo data
- `frontend/`: React + Vite dashboard

## Qamrab olingan funksiyalar

- account va kartalar yaratish, joriy balansni ko‘rish
- income/expense qo‘shish, tahrirlash, o‘chirish
- transfer va valyuta konvertatsiyasi
- qarz va haqdorliklar, `OPEN/CLOSED` holati
- oylik income target va category bo‘yicha expense limit
- dashboard statistikasi: umumiy balans, category stats, daily/weekly/monthly/yearly trend, calendar view

## Ishga tushirish

Backend:

```bash
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

- Database hozircha H2 bilan ishlaydi; `application.yml` orqali PostgreSQL ga ko‘chirish oson.
- Oila a'zolari bilan shared workflow bonus sifatida ochiq qoldirilgan.
# Hackaton
