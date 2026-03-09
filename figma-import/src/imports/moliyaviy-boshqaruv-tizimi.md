arajatlarni toifalash vositasi
1. Kirish
Zamonaviy fintech va smart banking ilovalarda foydalanuvchilarning nafaqat xarajatlarini, balki daromadlari, balanslari, qarz va haqdorliklarini ham kompleks tarzda boshqarish muhim hisoblanadi. Ushbu task foydalanuvchining shaxsiy moliyasini to‘liq nazorat qilishga yo‘naltirilgan yengil, ammo funksional moliyaviy boshqaruv tizimini yaratishni nazarda tutadi.

2. Muammo bayoni
Ko‘pchilik foydalanuvchilar
xarajat va daromadlarni alohida tizimlarda yoki umuman qayd etmaydi;
qaysi karta yoki accountda qancha mablag‘ borligini real vaqtda bilmaydi;
qarzlari va boshqalardan olishi kerak bo‘lgan pullarni (haqdorlik) unutib qo‘yadi;
oylik byudjet va real sarf o‘rtasidagi farqni nazorat qila olmaydi.
Natijada shaxsiy moliyaviy intizom pasayadi va noto‘g‘ri qarorlar qabul qilinadi.

3. Vazifa tavsifi
Ishtirokchilar foydalanuvchi daromadlari (income), xarajatlari (expense), account va kartalari, balanslari, qarzlari va haqdorliklarini yagona tizimda boshqarish imkonini beruvchi fintech ilova (web yoki mobile) ishlab chiqishlari kerak. Qo’shimcha oila a’zolari bilan shared qilib ishlatish imkoniyati bo’lishi mumkin (Bunda xarjatlar va tushumlar umumiy hisoblanadi)

Tizim real hayotda personal finance, mobile banking va budgeting ilovalarga yaqin bo‘lishi, ammo hackathon doirasida MVP darajasida amalga oshirilishi lozim.

4. Asosiy funksional talablar
Account va kartalar
account va bank kartalarini qo‘shish (nomi, turi, valyuta, boshlang‘ich balans);
har bir account/karta uchun joriy balansni ko‘rish.
Xarajatlar (Expenses)
xarajat qo‘shish (summa, sana, tavsif, kategoriya);
xarajat qaysi account, karta yoki naqd puldan qilinganini tanlash;
xarajat kiritilganda tegishli balans avtomatik kamayishi;
xarajatlarni tahrirlash va o‘chirish;
Daromadlar (Income)
daromad qo‘shish (summa, sana, manba, category);
daromad qaysi account yoki kartaga tushganini belgilash (yoki naqt pul);
daromad kiritilganda balans avtomatik oshishi.
Transferlar
bir account/kartadan boshqasiga pul o‘tkazish;
transfer vaqtida bir balans kamayib, boshqasi oshishi.
ikki xil valyutada bo’lsa valyuta kursi orqali kovertatsiya qilish.
Qarzlar va haqdorliklar
berilgan qarzlarni (kimga, qancha) qayd etish;
olinishi kerak bo‘lgan mablag‘larni (haqdorlik) yuritish;
qarz/haqdorlik holatini (OPEN, CLOSED) kuzatish.
Byudjet va rejalashtirish
oylik daromad (income) uchun byudjet belgilash;
oylik xarajat limitlarini kategoriya bo‘yicha belgilash;
reja va real holatni solishtirish.
Ko‘rish va tahlil
xarajat va daromadlarni birgalikda ko‘rsatadigan statistika. Bunda umumiy statistika, Har bir kategoriya bo’yicha hisoblangan statistika, Yillik, oylik, haftalik, kunlik statitistika (Tushumlar uchun ham xuddi shunday);
kategoriya bo‘yicha xarajatlar vs tushumlar tahlili;
calendar view orqali kunlik xarajat va daromadlarni ko‘rish.
Oila a’zolar bilan ulashish (Qo’shimcha, ixtiyoriy)
Oila a’zolarni taklif qilish va birgalikda xarajatlar va tushumlarni boshqarish
5. AI va avtomatlashtirish (ixtiyoriy / bonus)
xarajat tavsifi asosida avtomatik kategoriya aniqlash;
foydalanuvchi odatlariga qarab xarajatlarni tahlil qilish;
- ogohlantirishlar (notification)
bu oy ma’lum kategoriya bo‘yicha odatdagidan ko‘p sarfladingiz;
kommunal yoki telefon to‘lovini qilish vaqti keldi;
AI/ML yoki oddiy rule-based yondashuvdan foydalanish mumkin.
6. Asosiy ishlash holatlari (Use Cases)
1. Foydalanuvchi yangi karta qo‘shadi va boshlang‘ich balans kiritadi.
2. Foydalanuvchi xarajat kiritadi va balans avtomatik kamayadi.
3. Foydalanuvchi daromad kiritadi va balans oshadi.
4. Foydalanuvchi bir kartadan boshqasiga transfer qiladi.
5. Foydalanuvchi qarz yoki haqdorlikni qayd etadi.
6. Tizim oylik byudjet va real xarajatlarni solishtiradi.
7. (Bonus) AI foydalanuvchiga moliyaviy ogohlantirish yoki tavsiya beradi.
7. Texnik talablar
Backend: REST API (Java tavsiya etiladi);
Frontend: Web yoki Mobile ilova (React, Flutter, Vue va h.k.);
Ma’lumotlar bazasi: PostgreSQL tavsiya etiladi;
AI integratsiya: majburiy emas, ammo qo‘llab-quvvatlanadi.
8. Kutilayotgan natija
Hackathon yakunida ishtirokchilar
yuqorida sanab o‘tilgan barcha funksionalliklarni o‘z ichiga olgan ishlaydigan web yoki mobile ilova;
foydalanuvchining shaxsiy moliyasini to‘liq boshqarish imkoniyatini;
(ixtiyoriy) AI asosidagi avtomatlashtirish va ogohlantirishlarni namoyish qilib berishlari kerak