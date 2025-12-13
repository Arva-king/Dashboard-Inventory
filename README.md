
# 🛒 Dashboard Inventory - Modern POS & Inventory System

**Dashboard Inventory** adalah aplikasi web berbasis *Client-Side* (Tanpa Backend) yang dirancang untuk membantu UMKM mengelola stok barang dan kasir (Point of Sale) dengan fitur-fitur canggih layaknya aplikasi enterprise.

Project ini dibuat menggunakan **Vanilla JavaScript**, **Bootstrap 5**, dan memanfaatkan **LocalStorage** browser sebagai database, sehingga sangat ringan dan cepat.

## ✨ Fitur Unggulan (Key Features)

Aplikasi ini dilengkapi dengan fitur-fitur modern yang jarang ditemukan pada web statis biasa:

### 🏪 Point of Sales (Kasir)
- **Real-time Search:** Pencarian barang instan tanpa reload.
- **Barcode Scanner:** Scan kode batang produk menggunakan kamera HP/Laptop.
- **Cek Ongkir Interaktif:** Hitung ongkir otomatis berdasarkan jarak menggunakan Peta (Leaflet.js).
- **Cetak Struk Thermal:** Layout khusus untuk printer thermal 58mm.
- **Kirim Struk via WA:** Kirim detail belanja langsung ke WhatsApp pelanggan.

### 📦 Manajemen Inventaris
- **CRUD Produk:** Tambah, Edit, Hapus produk dengan gambar.
- **Smart Restock:** Deteksi otomatis barang yang stoknya menipis (< 5).
- **Export Data:** Download laporan ke Excel/PDF.

### 🛡️ Keamanan & Sistem
- **Multi-User Login:** Akses berbeda untuk **Admin** (Full Akses) dan **Kasir** (Terbatas).
- **Auto Lock Screen:** Layar terkunci otomatis jika tidak ada aktivitas selama 1 menit.
- **Backup & Restore:** Simpan data ke file JSON agar tidak hilang saat ganti perangkat.
- **Voice Command:** Navigasi aplikasi menggunakan perintah suara.
- **Dark Mode:** Mode gelap untuk kenyamanan mata.
- **Gamifikasi:** Target penjualan harian dengan efek visual (Confetti) saat tercapai.

---

## 🚀 Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Bootstrap 5.3
- **Database:** LocalStorage (Browser)
- **Library Pihak Ketiga:**
  - `Chart.js` (Visualisasi Data)
  - `DataTables` (Tabel Interaktif & Export)
  - `SweetAlert2` (Notifikasi Cantik)
  - `Leaflet.js` (Peta Digital)
  - `Html5-Qrcode` (Barcode Scanner)
  - `Canvas Confetti` (Efek Gamifikasi)

---

## 🔐 Kredensial Login (Default)

Gunakan akun berikut untuk masuk ke dalam sistem:

| Peran (Role) | PIN Akses | Hak Akses |
| :--- | :--- | :--- |
| **Admin / Owner** | `1234` | Full Akses (Edit, Hapus, Backup, Settings) |
| **Kasir / Staff** | `0000` | Terbatas (Hanya Jualan, Tidak bisa Hapus/Edit Stok) |

> **Catatan:** Untuk membuka **Lock Screen**, gunakan PIN Default: `1234`

---

## 📦 Cara Instalasi & Menjalankan

Karena aplikasi ini berbasis web statis, kamu tidak perlu menginstall PHP, Python, atau Node.js.

1. **Clone Repositori ini**
   ```bash
   git clone [https://github.com/username-kamu/tokomajoo.git](https://github.com/username-kamu/tokomajoo.git)
````

2.  **Buka Folder Proyek**
    Masuk ke folder hasil download.

3.  **Jalankan Aplikasi**

      - Klik 2x pada file `index.html`.
      - **Rekomendasi:** Gunakan ekstensi **Live Server** di VS Code untuk pengalaman terbaik (terutama agar fitur Kamera/Scanner berjalan lancar).

-----

## 📂 Struktur Folder

```text
/tokomajoo
│
├── index.html       # Halaman Dashboard Utama
├── pos.html         # Halaman Kasir (Point of Sales)
├── products.html    # Halaman Data Inventaris
├── add-item.html    # Form Tambah/Edit Barang
├── history.html     # Log Aktivitas & Riwayat Transaksi
├── profile.html     # Profil, Backup & Restore Data
├── help.html        # Bantuan & FAQ
│
├── css/
│   └── style.css    # Styling Custom & Dark Mode
│
└── js/
    └── script.js    # Logika Utama Aplikasi
````
-----

## ⚠️ Catatan Penting

  - **Penyimpanan Data:** Semua data disimpan di **Cache Browser (LocalStorage)**. Jika kamu membersihkan cache browser, data akan hilang.
  - **Solusi:** Gunakan fitur **Backup (Download JSON)** secara berkala melalui menu Profil.

-----

## 🤝 Kontribusi

Pull Request dipersilakan\! Untuk perubahan besar, harap buka *issue* terlebih dahulu untuk mendiskusikan apa yang ingin kamu ubah.

-----

**Dibuat dengan ❤️ untuk UMKM Indonesia.**



### Tips Tambahan untuk GitHub Kamu:
1.  **Screenshot:** Agar repository kamu terlihat makin keren, ambil *screenshot* halaman Dashboard, Kasir, dan Mode Gelap, lalu upload ke folder `img` (buat folder baru) dan masukkan ke dalam README di atas.
2.  **Hosting Gratis:** Kamu bisa langsung menghosting web ini secara gratis menggunakan **GitHub Pages** atau **Netlify** (tinggal drag & drop folder projectnya). Fitur kamera & lokasi akan berjalan lebih lancar di sana karena sudah otomatis HTTPS.

