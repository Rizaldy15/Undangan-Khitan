# Menghubungkan Reservasi ke Google Sheets

1. Buat atau buka Google Spreadsheet yang akan digunakan sebagai daftar tamu.
2. Pilih **Extensions > Apps Script**.
3. Hapus kode contoh, lalu salin seluruh isi `google-apps-script.gs` ke editor Apps Script.
4. Klik **Deploy > New deployment**.
5. Pilih tipe **Web app**.
6. Atur **Execute as: Me** dan **Who has access: Anyone**.
7. Klik **Deploy**, berikan izin yang diminta, lalu salin URL Web App yang berakhiran `/exec`.
8. Buka `js/config.js` dan tempel URL tersebut:

   ```js
   window.RSVP_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec';
   ```

9. Commit dan push perubahan `js/config.js` ke GitHub Pages.
10. Kirim satu reservasi percobaan. Tab **Reservasi** akan otomatis dibuat di spreadsheet.

Data yang tersimpan: waktu masuk, nama pada undangan, nama pengisi, status kehadiran, ucapan/doa, dan URL undangan.

Jika kode Apps Script diubah setelah deployment pertama, buka **Deploy > Manage deployments**, edit deployment, pilih versi baru, lalu deploy kembali.
