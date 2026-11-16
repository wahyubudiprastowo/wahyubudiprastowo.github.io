# PANDUAN UPLOAD — Website Portfolio Wahyu Budi Prastowo ke GitHub Pages

Website ini di-desain agar bisa langsung di-upload ke **GitHub Pages** (sama seperti
situs referensi popolab-tw.github.io). Semua langkah di bawah bisa dilakukan dari
browser, tanpa install apapun.

> Isi website memakai **bahasa Inggris** (gaya POPOLAB), panduan ini tetap
> bahasa Indonesia karena untuk pemakaian pribadi Anda.

---

## Fitur motion & efek dinamis (v4 — POPOLAB layout)

Situs kini mengikuti layout & efek situs POPOLAB persis (direplikasi dari kode
sumbernya) — semuanya otomatis dan bisa dimatikan:

| Efek | Detail |
| --- | --- |
| **Swarm cursors (kursor berlarian)** | 10 kursor **skill** bernama (Azure, AWS, Google Cloud, Terraform, Kubernetes, Python, PowerShell, Ansible, Docker, Wazuh) terbang masuk saat halaman dibuka, lalu: saat mouse bergerak mereka mengorbit mouse anda seperti kolaborator di Figma; saat mouse diam mereka "bekerja" sendiri — membaca teks (menyapu highlight warna), mengklik tombol (kotak seleksi + ripple, hanya visual), dan membingkai gambar/judul dengan kotak berukuran W × H ala aplikasi desain. Versi seluler mendapat 4 kursor. **Kartu projek kini memakai poster seni lokal bergaya POPOLAB** (judul raksasa Anton, angka ghost, glow merah bergantian) — bukan lagi tangkapan OpenGraph GitHub. |
| **Mega name ala POPOLAB** | Tulisan raksasa WAHYU gradien merah di belakang hero, terpotong rapi di tepi layar, bergeser parallax saat scroll. |
| **Foto GTA VI ala header POPOLAB** | Hero memakai **cutout transparan** gaya *GTA VI* (`public/gta-cut.webp`) — Wahyu tampak "muncul" dari tulisan raksasa seperti maskot POPOLAB, mengapung lembut (mascot float), dengan glow merah + drop shadow. Di bagian kontak ada kartu miring 3D (tilt-card) berisi potret Wahyu + tulisan "PLAYER 1 READY.". Ganti filenya (nama sama) untuk ganti foto. |
| **Custom cursor** | Titik merah + ring yang mengikuti mouse; membesar di link; berubah jadi bulatan merah "OPEN" di atas kartu projek. Nonaktif di perangkat sentuh. |
| **Marquee ticker** | Pita merah miring raksasa (Cloud Security ✦ Automation ✦ Azure ✦ …) setelah hero + pita outline sebelum Journey. Berhenti saat di-hover. |
| **Typewriter** | Nama di hero diketik ulang setiap halaman dibuka, caret merah berkedip. |
| **Scroll-spy nav** | Titik merah di menu header pindah otomatis mengikuti section yang sedang dilihat (Work / Numbers / Craft / Journey / Contact). |
| **Scramble nav** | Teks menu "berantakan" lalu normal saat hover. |
| **Count-up + jam live** | Statistik (14+ / 2.9B / 99.99%) berhitung naik; jam Jakarta (WIB) berdetak di footer. |
| **Intro stagger** | Bagian hero muncul berurutan; semua section fade-in saat discroll. |
| **Magnetic + micro-interactions** | Tombol CKA tertarik mengikuti kursor; panah bergerak saat hover; gambar kartu projek zoom halus; timeline Journey buka-tutup. |
| **Scroll progress** | Garis merah tipis di atas = sisa halaman. |

Semua efek mati bila tombol **Motion → Off** (tersimpan di browser) atau bila OS
user mengaktifkan *reduced motion*.

---

## Yang perlu dipahami dulu (2 menit)

| Bagian | Fungsi |
| --- | --- |
| `src/` | Kode tampilan website (tidak perlu diubah untuk ganti isi) |
| `public/content.json` | **SELURUH ISI WEBSITE** — teks, projek, statistik, angka, timeline, sertifikasi, kontak, ticker |
| Edit Mode (tombol di website) | Ubah isi langsung di browser, tanpa koding |
| `.github/workflows/deploy-pages.yml` | Otomatis membangun & menayangkan website setiap kali repo di-update |

**Alur kerja yang disarankan:** edit isi lewat Edit Mode di browser → klik
**Export** (mengunduh `content.json`) → ganti file `public/content.json` di GitHub
→ website otomatis ter-update untuk semua pengunjung.

---

## BAGIAN 1 — Upload website (sekali saja)

### Cara A: lewat web GitHub (paling mudah, tanpa terminal)

1. Login di [github.com](https://github.com) dengan akun **wahyubudiprastowo**.
2. Klik **+** (kanan atas) → **New repository**.
   - Nama repo bebas, contoh: `portfolio`.
   - Pilih **Public** (wajib untuk GitHub Pages gratis).
   - Klik **Create repository**.
3. Di halaman repo baru, klik link **uploading an existing file** (atau tombol
   **Add file → Upload files**).
4. **Upload SEMUA file dan folder** proyek ini **KECUALI** folder
   `node_modules`, `.next`, `db`, dan `tests`.
   - Trik: jika browser tidak bisa drag-drop banyak folder, buat ZIP isinya
     dulu, ekstrak di komputer, lalu drag satu per satu.
   - Pastikan folder `.github` ikut ter-upload (inilah yang membuat website
     otomatis ter-build). Kalau folder `.github` tidak bisa dipilih karena
     tersembunyi, ganti nama sementara menjadi `github` saat upload, lalu setelah
     ter-upload rename kembali menjadi `.github` di GitHub (Edit/rename folder).
5. Tulis pesan commit, misalnya `upload website portfolio`, lalu klik
   **Commit changes**.
6. Buka tab **Settings** repo → menu **Pages** → pada **Build and deployment →
   Source**, pilih **GitHub Actions**.
7. Selesai. Buka tab **Actions** repo dan tunggu workflow **Deploy ke GitHub Pages**
   berwarna hijau (± 2-4 menit).
8. Website live di:
   - Repo `portfolio` → `https://wahyubudiprastowo.github.io/portfolio/`
   - Jika repo Anda bernama `wahyubudiprastowo.github.io` →
     `https://wahyubudiprastowo.github.io/` (alamat paling pendek dan rapi).

### Cara B: lewat terminal (jika terbiasa git)

```bash
git init
git add .
git commit -m "website portfolio wahyu"
git branch -M main
git remote add origin https://github.com/wahyubudiprastowo/portfolio.git
git push -u origin main
```

Lalu lanjut ke langkah 6 di atas (Settings → Pages → Source: **GitHub Actions**).

---

## BAGIAN 2 — Mengedit isi website

### Opsi 1: Edit Mode (tanpa koding, direkomendasikan)

1. Buka website Anda, klik tombol **Edit Mode** (di header kanan atas atau
   toolbar bawah).
2. **Klik teks mana pun** untuk mengubahnya: nama, deskripsi, statistik, chips,
   baris angka, timeline karier, sertifikasi, teks kontak, catatan footer —
   semuanya bisa langsung diketik ulang. Kursor swarm otomatis berhenti saat
   mode edit aktif supaya teks mudah diklik.
3. Untuk kartu projek: klik ikon **gerigi** di pojok kartu. Di situ Anda bisa
   mengubah judul, subjudul, hook, URL, bahasa, label, kategori, gambar, atau
   **menghapus** kartu.
4. Tombol **+ Add project** menambah kartu baru di bagian Work.
5. Perubahan otomatis tersimpan di **browser Anda** (localStorage).
   Tombol **Reset** membuang semua perubahan; **Import** memuat `content.json`.
6. Klik **Export** → file `content.json` terunduh. Ini versi final isi website.
7. Publikasikan: buka repo GitHub → `public/content.json` → ikon **pensil**
   (Edit) → hapus isinya, paste isi file hasil ekspor (buka file
   `content.json` dengan Notepad, salin semuanya) → **Commit changes**.
8. GitHub Actions otomatis rebuild ± 2 menit → semua pengunjung melihat isi baru.

> Catatan: perubahan yang hanya tersimpan di localStorage TIDAK terlihat oleh
> pengunjung lain. Ekspor + replace `public/content.json` adalah cara
> mempublikasikannya.

### Opsi 2: Edit `content.json` langsung di GitHub

Tanpa buka website sama sekali: repo → `public/content.json` → pensil → ubah
teks yang diinginkan (hati-hati dengan tanda kutip dan koma) → Commit.

Struktur singkat:

```json
{
  "hero": { "name": "Wahyu Budi Prastowo", "desc": "..." },
  "ticker": { "words": ["Cloud Security", "Automation", "Azure"] },
  "stats": [ { "n": "14", "small": "+", "t": "Years in infrastructure & cloud" } ],
  "numbers": { "rows": [ { "rt": "Monitoring cost cut", "rv": "50", "rvSmall": "%" } ] },
  "craft": { "steps": [ { "b": "Automate the repeat", "s": "..." } ] },
  "journey": { "items": [ { "when": "2023 — Now", "what": "Senior Cloud Infrastructure & Security Architect" } ] },
  "projects": [ { "title": "Agentic AI SOC", "url": "https://github.com/..." } ],
  "contact": { "items": [ ... ] }
}
```

---

## BAGIAN 3 — Yang perlu Anda cek / koreksi

1. **LinkedIn** — URL profil memakai pola
   `linkedin.com/in/wahyubudiprastowo` (tebakan dari nama). Kalau vanity URL
   Anda berbeda, klik teksnya di Mode Edit atau ubah `contact.items.3.href`
   dan `contact.ctaHref` di `public/content.json`.
2. **Foto hero & kontak** — sekarang keduanya memakai cutout Wahyu
   (`gta-cut.webp`). Ingin ganti gaya/foto? Timpa file di folder `public/`
   dengan nama sama.
3. **Deskripsi repo** yang belum punya deskripsi di GitHub sudah saya tulis
   perkiraan dari namanya — silakan koreksi lewat Mode Edit (gerigi kartu).
4. **Certs** — kartu sertifikasi menunjuk ke repo `WhoAmI`. Ganti `href`-nya ke
   Credly bila ingin lebih resmi.

---

## BAGIAN 4 — Mengembangkan lebih lanjut (opsional)

```bash
bun install        # pasang dependensi
bun run dev        # jalan di http://localhost:3000
bun run lint       # cek kualitas kode
```

Build versi Pages secara manual (hasil di folder `out/`):

```bash
PAGES_BUILD=1 PAGES_BASE_PATH=/portfolio bun x next build
```

- Mengganti warna aksen: variabel `--red` di `src/app/globals.css`.
- Mengganti font: `src/app/layout.tsx` (Anton / Inter / Caveat).
- Struktur lengkap tipe data: `src/lib/site-content.ts`.
