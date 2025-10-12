# PermaFit  
### Pendamping Kebugaran Digital Anda Melawan Sarcopenia  

**PermaFit** adalah aplikasi web yang dirancang untuk melawan *sarcopenia* (kehilangan massa otot akibat penuaan) dengan menyediakan pengalaman latihan yang aman, mudah diakses, dan personal untuk para lansia.  
Dengan menggunakan **computer vision berbasis AI**, PermaFit bertindak sebagai pelatih pribadi virtual, memberikan umpan balik secara real-time pada postur latihan untuk mencegah cedera dan memaksimalkan efektivitas.

---

## Tentang Proyek  
Proyek ini dikembangkan untuk **Study 2 Challenge 2025: “Bridging Global Problems: Tech for a Better Tomorrow”**.

---

## Demo Langsung  
Coba aplikasi yang telah di-deploy di Vercel:  
👉 [https://perma-fit.vercel.app/](https://perma-fit.vercel.app/)

---

## Fitur Utama  

### Pengenalan Gerakan & Koreksi Postur Real-Time  
Dengan teknologi **computer vision**, aplikasi mendeteksi postur tubuh secara langsung dan memberikan umpan balik instan untuk memastikan setiap gerakan dilakukan dengan benar dan aman.

### Progress Tracker  
Pantau semua kemajuan Anda melalui dasbor yang intuitif.  
Lacak konsistensi latihan, kualitas repetisi (*repetisi baik vs. buruk*), dan perkembangan dari waktu ke waktu untuk tetap termotivasi.

### Perencana Cerdas  
Sistem menyusun rencana latihan berdasarkan data awal dan tujuan Anda.  
Meskipun saat ini menggunakan set latihan yang telah ditentukan, sistem ini dirancang untuk beradaptasi secara dinamis di masa depan.

### Penjadwalan Fleksibel  
Atur jadwal latihan mingguan sesuai ketersediaan Anda saat proses onboarding untuk membangun kebiasaan olahraga yang konsisten dan efektif.

---

## Halaman Aplikasi  

### 1. Onboarding  
Pengguna baru menyelesaikan orientasi sederhana, memberikan informasi penting dan ketersediaan mingguan untuk mengatur jadwal awal.

### 2. Beranda (Home)  
Dasbor utama memberikan gambaran komprehensif tentang perjalanan kebugaran.  
Menampilkan ringkasan latihan yang selesai, sesi yang terlewat, total repetisi yang benar, dan data performa historis.

### 3. Jadwal Latihan  
Menampilkan rencana latihan mingguan Anda agar tetap teratur dan berkomitmen pada rutinitas.

### 4. Sesi Latihan  
Inti dari PermaFit.  
Selama sesi, aplikasi menggunakan kamera perangkat untuk memantau gerakan secara real-time.  
Anda dapat melihat jadwal hari ini, melacak kemajuan, dan melihat pratinjau gerakan sebelum memulai.

---

## Cara Penggunaan  

Untuk hasil maksimal dari fitur deteksi gerakan, perhatikan panduan berikut:  

**Posisi Kamera:**  
Pastikan seluruh tubuh Anda terlihat di dalam bingkai kamera.  

**Posisi Tubuh (Penting):**  
1. Berdiri menyamping, menghadap ke arah kiri Anda.  
2. Pastikan kamera menangkap sisi kanan tubuh dan kepala Anda dalam sudut 90°.  
3. Deteksi tidak akan berfungsi jika Anda menghadap ke depan, ke belakang, atau memperlihatkan sisi kiri tubuh Anda ke kamera.  

---

## Teknologi yang Digunakan  

| Kategori | Teknologi |
|-----------|------------|
| **Framework** | Next.js |
| **Database** | IndexedDB |
| **AI / Computer Vision** | MediaPipe Pose |
| **UI / Styling** | Tailwind CSS |

---

## Menjalankan Secara Lokal  

### Prasyarat  
Pastikan Anda telah menginstal **Node.js (v18 atau lebih baru)** dan **npm**.
```bash
npm install npm@latest -g
```

## Instalisasi
Clone Repositori
```bash
git clone https://github.com/5calvinw/PermaFit.git
```
Masuk ke Direktori Proyek
```bash
cd PermaFit
```
Instal Dependensi
```bash
npm install
```
Jalankan Server
```bash
npm run dev
```
Buka http://localhost:3000 di browser untuk melihat hasilnya.

## Status Proyek  

| Status | Fitur |
|:------:|:------|
| ✅ | Onboarding dan Autentikasi Pengguna |
| ✅ | Deteksi Pose Real-Time dengan MediaPipe |
| ✅ | Dasbor dengan Analitik Latihan |
| ✅ | Jadwal yang bisa Ditentukan |
---

## Tim Pengembang  

Proyek ini dibuat dan dikelola oleh mahasiswa dari **BINUS University**:

- **Joshua Alexander Larido**  
- **Calvin Wu**  
- **Alexsandro**

---

## Tujuan  

Memberdayakan lansia untuk mempertahankan kebugaran otot mereka melalui teknologi berbasis AI yang ramah pengguna, aman, dan mudah diakses.

