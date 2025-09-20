# Panduan Kontribusi

point satu jangan ragu-ragu buat kontribusi kepikiran apa langsung terapkan

Usahakan ketika Pull Request jangan semua commit di masukin semisal change middleware, cors, headers, cookies, router.

Bisa 1 konteks dulu misal mau Refactor middleware selesaiin dulu lalu Pull Request konteksnya ubah middleware jadi gampang di maintanance.

1 atau 2 konteks dalam Pull Request masih bisa di toleransi lah

## NodeJS
jika ingin kontribusi pastikan nodejs kamu berada tepat di versi 20

## Workspace

Folder `packages` itu folder core system gamanjs seperti `@gaman/core` `@gaman/common` `@gaman/cli` `create-gaman` jadi ketika salah satu di ubah dan di publish ke `npm` maka library lain versinya bakal ngikut ke update

Folder `plugins` adalah library gamanjs seperti `@gaman/cors` `@gaman/static` jadi ini adalah pendukung aja, ekosistem lah

## Konsep
konsep proyek gamanjs disini adalah pakai `monorepo` jadi banyak library dalam 1 proyek contohnya kek workspace tadi