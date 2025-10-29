# FLOW FEATURE FOR INFORMATION

## Jenis Informasi

1. Umum → Berisi informasi umum seperti pengumuman pendaftaran, kegiatan
2. Galeri → Berisi mengenai informasi hasil kegiatan, berupa foto2 kegiatan yang sudah dilaksanakan
3. Artikel/Blog → Berisi informasi mengenai artikel/blog yang dibuat oleh admin

## Input Model Informasi

1. Umum → Judul (Wajib), Deskripsi (Wajib), Foto (Opsional)
2. Galeri → Judul (Wajib), Deskripsi (Opsional), Foto (Wajib)
3. Artikel/Blog → Judul (Wajib), Konten (Wajib), Foto Cover (Wajib)

### Flow Informasi

1. Semua pembuatan informasi diawali dari page /portal/informasi, button buat postingan. Akan trigger dialog untuk Pilih informasi yang akan dibuat.
   - Jika Pilih Umum, akan diarahkan ke halaman /portal/informasi/create-general
   - Jika Pilih Galeri, akan diarahkan ke halaman /portal/informasi/create-gallery
   - Jika Pilih Artikel/Blog, akan diarahkan ke halaman /portal/informasi/create-article
2. Masing2 halaman create akan memiliki form input sesuai dengan model informasi yang dipilih.
3. Khusus untuk artikel/blog, halaman harus mempunyai Rich Text Editor untuk menulis konten. Selain itu ada beberapa input field lain seperti Judul, Foto Cover.

# ANSWER

1. Data akan disimpan di convex. Termasuk gambar juga akan disimpan di convex storage. Schema nya belum ada, apakah anda punya rekomendasi schema? Hanya satu schema namanya iformasi tapi bisa mencakup ketiganya.
2. Untuk galeri bisa beberapa foto
3. Semua jenis format gambar diizinkan
4. Fitur yang diperlukan untuk RTE adalah:
   - dropdown teks type (H1, H2, H3, P, Quote, Code)
   - Font Size adjust button [-] 16 [+]
   - Text style (Bold, Italic, Underline, Strikethrough, Color)
   - Alignment (Left, Center, Right, Justify)
   - List (Ordered, Unordered)
   - Link (Wajib memiliki label)
   - Line Space adjust button [-] 1.5 [+]
   - Image (Wajib memiliki label)
   - Table
   - Highlight
   - Undo/Redo
5. Tidak perlu ada fitur ai assistant untuk artikel/blog.
6. Perlu status untuk bisa di publish. Status ada dua, draft dan publish. Tapi ada juga preview status untuk melihat hasil konten sebelum publish.
7. Perlu SEO fields seperti meta title, meta description, meta image.
8. Hak akses akan dilakukan nanti
9. Tidak ada desain khusus, hanya ikuti saja UI yang sudah diterapkan di project ini
10. Tidak ada validasi tambahan
11. Perlu toast notification untuk setiap aksi yang dilakukan. Redirect ke /porta/informasi saja
12. Path seperti di project sekarang ini

