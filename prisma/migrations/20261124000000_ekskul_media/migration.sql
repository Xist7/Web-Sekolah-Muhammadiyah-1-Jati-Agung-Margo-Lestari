-- Slider ekskul di beranda sekarang membaca konten dari panel admin (dulu isinya ditulis di kode).
-- Supaya foto Pramuka & video Tapak Suci tidak hilang dari beranda, pindahkan ke konten yang sudah tersimpan.
-- Hanya item yang belum punya kolom "video"; gambar yang sudah diunggah admin tidak ditimpa.
UPDATE "SiteContent" SET "data" = jsonb_set("data", '{daftar}', (
  SELECT jsonb_agg(
    CASE
      WHEN item ? 'video' THEN item
      WHEN lower(trim(item->>'nama')) = 'pramuka' AND item->'media'->>'jenis' = 'emoji'
        THEN item || jsonb_build_object('video', '', 'media', (item->'media') || '{"jenis": "gambar", "gambar": "/ekskul/pramuka.jpeg"}'::jsonb)
      WHEN lower(trim(item->>'nama')) = 'tapak suci' AND item->'media'->>'jenis' = 'emoji'
        THEN item || '{"video": "/ekskul/silat.mp4"}'::jsonb
      ELSE item || '{"video": ""}'::jsonb
    END ORDER BY urut)
  FROM jsonb_array_elements("data"->'daftar') WITH ORDINALITY AS t(item, urut)
))
WHERE "key" = 'ekskul'
  AND jsonb_typeof("data"->'daftar') = 'array'
  AND jsonb_array_length("data"->'daftar') > 0;
