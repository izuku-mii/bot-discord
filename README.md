---

# 🤖 Bot Discord

Bot Discord sederhana berbasis **Bot-discord** dengan library **discord.js**.  
Gunakan untuk belajar atau jadi base project pribadi.

---

## ⚙️ Cara Ambil Token Bot & Aktifkan All Mode

1. Buka [Discord Developer Portal](https://discord.com/developers/applications)  
2. Klik **New Application** lalu buat nama bot kamu  
3. Masuk ke tab **Bot** → klik **Add Bot**  
4. Klik **Reset Token** → salin tokennya  
5. Aktifkan semua mode (**Privileged Gateway Intents**)  
   - ✅ PRESENCE INTENT  
   - ✅ SERVER MEMBERS INTENT  
   - ✅ MESSAGE CONTENT INTENT  

> Simpan token di file config.example.js ganti ke config.js.

---

## 🔗 Cara Gabung ke Server (Link Developer)

1. Masuk ke **OAuth2 → URL Generator**  
2. Centang:
   - Scope: `bot`, `applications.commands`  
   - Permission: `Administrator`  
3. Copy link hasilnya dan buka di browser untuk invite bot kamu.  

Contoh link:

https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=8

---

## 💡 Example Fitur Bot (cek di bot)

| Command | Fungsi |
|----------|--------|
| `!cekid` | Cek id atau stalk |
| `!menu` | Lihat semua command |
| `!example` | Example Fitur Bot|

---

## 📦 Jalankan Bot

```bash
npm install
npm start
```

---

❤️ Thanks

Thx Syai base nya sama library nya 🙏
cmd.add jangan di ubah teks nya.

---

Jangan Lupa Follow Github Gw Yah
