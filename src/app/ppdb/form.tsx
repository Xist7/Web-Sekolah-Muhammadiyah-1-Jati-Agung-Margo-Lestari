"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UploadBox } from "./upload-box";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type FileKey = "foto" | "skl";

const DRAFT_KEY = "ppdb-draft-2026";
const REQUIRED = "input[required]:not([type=radio]), select[required], textarea[required]";

const msgs: Record<string, string> = {
  nisn: "NISN harus 10 digit angka.",
  nama: "Isi nama lengkap sesuai akta kelahiran.",
  sd: "Isi asal sekolah dasar.",
  tempat: "Isi tempat lahir.",
  tgl: "Pilih tanggal lahir yang valid.",
  email: "Masukkan alamat email yang valid.",
  ortu: "Isi nama orang tua / wali.",
  hub: "Pilih hubungan dengan calon siswa.",
  wa: "Gunakan nomor WhatsApp format 08xx.",
  jalan: "Isi nama jalan / dusun.",
  rt: "Isi RT (angka).",
  rw: "Isi RW (angka).",
  desa: "Isi desa / kelurahan.",
  kec: "Isi kecamatan.",
  kab: "Isi kabupaten / kota.",
};

const infoOptions = ["Sosial Media", "Keluarga", "Website", "Saudara", "Teman", "Guru", "Tetangga"];

const store = {
  get(): Record<string, string | boolean> | null {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null"); } catch { return null; }
  },
  set(v: unknown) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); return true; } catch { return false; }
  },
  del() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  },
};

const fieldKey = (el: Field) =>
  el.type === "checkbox" ? el.id || `${el.name}:${el.value}` : el.id || el.name;

export function PpdbForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nisnLen, setNisnLen] = useState(0);
  const [lainChecked, setLainChecked] = useState(false);
  const [files, setFiles] = useState<Partial<Record<FileKey, File>>>({});
  const [fileErrors, setFileErrors] = useState<Partial<Record<FileKey, string>>>({});
  const [saveStatus, setSaveStatus] = useState("Draf belum disimpan");
  const [toast, setToast] = useState<string>();
  const [done, setDone] = useState<{ name: string; no: string }>();

  const showToast = (m: string) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(undefined), 2600);
  };
  const setErr = (key: string, msg: string) => setErrors((e) => ({ ...e, [key]: msg }));

  function checkField(el: Field) {
    let ok = el.checkValidity();
    if (el.id === "nisn" && el.value.length !== 10) ok = false;
    if (el.id === "nama" && el.value.trim().length < 3) ok = false;
    if (el.id === "jalan" && el.value.trim().length < 3) ok = false;
    setErr(el.id, ok ? "" : msgs[el.id] || "Kolom ini wajib diisi.");
    return ok;
  }

  const fieldProps = (id: string) => ({
    id,
    name: id,
    onBlur: (e: { currentTarget: Field }) => checkField(e.currentTarget),
    onInput: (e: { currentTarget: Field }) => { if (errors[id]) checkField(e.currentTarget); },
  });
  const fieldClass = (id: string, extra = "") => `field${extra}${errors[id] ? " invalid" : ""}`;

  // Pulihkan draf + batas tanggal lahir (hanya di browser)
  useEffect(() => {
    const form = formRef.current;
    const tgl = form?.querySelector<HTMLInputElement>("#tgl");
    if (tgl) tgl.max = new Date().toISOString().slice(0, 10);
    const d = store.get();
    if (!d || !form) return;
    form.querySelectorAll<Field>("input, select, textarea").forEach((el) => {
      if (el.type === "file") return;
      if (el instanceof HTMLInputElement && el.type === "radio") el.checked = d[el.name] === el.value;
      else if (el instanceof HTMLInputElement && el.type === "checkbox") el.checked = !!d[fieldKey(el)];
      else if (fieldKey(el) in d) el.value = String(d[fieldKey(el)]);
    });
    const lain = form.querySelector<HTMLInputElement>("#infoLain");
    setLainChecked(!!lain?.checked);
    setNisnLen(form.querySelector<HTMLInputElement>("#nisn")?.value.length ?? 0);
    setSaveStatus("Draf sebelumnya dimuat");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDone(undefined); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function saveDraft() {
    const d: Record<string, string | boolean> = {};
    formRef.current?.querySelectorAll<Field>("input, select, textarea").forEach((el) => {
      if (el.type === "file") return;
      if (el instanceof HTMLInputElement && el.type === "radio") { if (el.checked) d[el.name] = el.value; }
      else if (el instanceof HTMLInputElement && el.type === "checkbox") d[fieldKey(el)] = el.checked;
      else d[fieldKey(el)] = el.value;
    });
    const ok = store.set(d);
    setSaveStatus(
      ok
        ? "Draf tersimpan " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : "Draf gagal disimpan (penyimpanan browser dinonaktifkan)",
    );
    showToast(ok ? "Draf tersimpan. Berkas unggahan perlu dipilih ulang saat melanjutkan." : "Draf tidak dapat disimpan di browser ini.");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    let first: HTMLElement | null = null;
    let bad = 0;
    const fail = (el: HTMLElement | null) => { bad++; first = first || el; };

    form.querySelectorAll<Field>(REQUIRED).forEach((el) => { if (!checkField(el)) fail(el); });
    if (!form.querySelector("input[name=jk]:checked")) {
      setErr("jk", "Pilih jenis kelamin.");
      fail(form.querySelector("input[name=jk]"));
    }
    const lainTxt = form.querySelector<HTMLInputElement>("#infoLainTxt");
    if (lainChecked && !lainTxt?.value.trim()) fail(lainTxt);
    (["foto", "skl"] as const).forEach((k) => {
      if (!files[k]) {
        setFileErrors((fe) => ({ ...fe, [k]: "Berkas ini wajib diunggah." }));
        fail(form.querySelector(`[data-upload=${k}] .pick`));
      }
    });

    if (bad) {
      const el = first as HTMLElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return showToast(`${bad} isian perlu diperbaiki.`);
    }

    // TODO (backend): kirim ke server, mis. server action / fetch('/api/ppdb') dengan new FormData(form) + files.foto / files.skl.
    const name = form.querySelector<HTMLInputElement>("#nama")?.value ?? "";
    setDone({ name, no: "PPDB-2026-" + String(Math.floor(Math.random() * 9000) + 1000) });
    store.del();
  }

  function closeModal() {
    setDone(undefined);
    formRef.current?.reset();
    router.push("/");
  }

  return (
    <>
      <form id="ppdb" ref={formRef} noValidate autoComplete="on" onSubmit={onSubmit}>
        {/* 1. Biodata */}
        <section className="card form-card" aria-labelledby="h-bio">
          <header><div className="t"><span className="ic" aria-hidden="true">🪪</span><h2 id="h-bio">Biodata Calon Siswa Baru</h2></div></header>
          <div className="fields">
            <div className={fieldClass("nisn")}>
              <label htmlFor="nisn">Nomor Induk Siswa Nasional (NISN)<span className="req">*</span></label>
              <input
                {...fieldProps("nisn")}
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Contoh: 0098765432"
                required
                pattern="\d{10}"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.value = el.value.replace(/\D/g, "").slice(0, 10);
                  setNisnLen(el.value.length);
                  if (errors.nisn) checkField(el);
                }}
              />
              <span className="counter">{nisnLen}/10</span>
              <span className="hint">10 digit angka</span><span className="err">{errors.nisn}</span>
            </div>
            <div className={fieldClass("nama")}>
              <label htmlFor="nama">Nama Lengkap Calon Siswa<span className="req">*</span></label>
              <input
                {...fieldProps("nama")}
                type="text"
                placeholder="Sesuai akta kelahiran resmi"
                required
                minLength={3}
                onInput={(e) => {
                  const el = e.currentTarget;
                  const pos = el.selectionStart;
                  el.value = el.value.toUpperCase();
                  el.setSelectionRange(pos, pos);
                  if (errors.nama) checkField(el);
                }}
              />
              <span className="hint">Gunakan huruf balok atau penulisan baku.</span><span className="err">{errors.nama}</span>
            </div>
            <fieldset className={fieldClass("jk")} id="f-jk">
              <legend>Jenis Kelamin<span className="req">*</span></legend>
              <div className="radios">
                <label className="radio"><input type="radio" name="jk" value="L" required onChange={() => setErr("jk", "")} /> Laki-laki</label>
                <label className="radio"><input type="radio" name="jk" value="P" onChange={() => setErr("jk", "")} /> Perempuan</label>
              </div>
              <span className="err">{errors.jk}</span>
            </fieldset>
            <div className={fieldClass("sd")}>
              <label htmlFor="sd">Asal Sekolah Dasar (SD/MI)<span className="req">*</span></label>
              <input {...fieldProps("sd")} type="text" placeholder="Contoh: SDN 1 Margo Lestari" required />
              <span className="err">{errors.sd}</span>
            </div>
            <div className={fieldClass("tempat")}>
              <label htmlFor="tempat">Tempat Lahir (Kota/Kabupaten)<span className="req">*</span></label>
              <input {...fieldProps("tempat")} type="text" placeholder="Contoh: Lampung Selatan" required />
              <span className="err">{errors.tempat}</span>
            </div>
            <div className={fieldClass("tgl")}>
              <label htmlFor="tgl">Tanggal Lahir<span className="req">*</span></label>
              <input {...fieldProps("tgl")} type="date" required min="2005-01-01" />
              <span className="hint">Usia calon siswa maksimal 15 tahun pada 1 Juli 2026.</span><span className="err">{errors.tgl}</span>
            </div>
          </div>
        </section>

        {/* 2. Kontak */}
        <section className="card form-card" aria-labelledby="h-kontak">
          <header><div className="t"><span className="ic" aria-hidden="true">✉️</span><h2 id="h-kontak">Kontak Calon Siswa</h2></div></header>
          <div className="fields">
            <div className={fieldClass("email", " full")}>
              <label htmlFor="email">Email<span className="req">*</span></label>
              <input {...fieldProps("email")} type="email" placeholder="Contoh: rusman@gmail.com" required />
              <span className="hint">Masukkan email aktif untuk mendapatkan pengumuman PPDB.</span><span className="err">{errors.email}</span>
            </div>
          </div>
        </section>

        {/* 3. Orang tua */}
        <section className="card form-card" aria-labelledby="h-ortu">
          <header><div className="t"><span className="ic" aria-hidden="true">👪</span><h2 id="h-ortu">Data Orang Tua / Wali Murid</h2></div></header>
          <div className="fields">
            <div className={fieldClass("ortu")}>
              <label htmlFor="ortu">Nama Lengkap Orang Tua / Wali<span className="req">*</span></label>
              <input {...fieldProps("ortu")} type="text" placeholder="Contoh: Ir. Bambang Hermanto, M.M." required />
              <span className="err">{errors.ortu}</span>
            </div>
            <div className={fieldClass("hub")}>
              <label htmlFor="hub">Hubungan dengan Calon Siswa<span className="req">*</span></label>
              <select {...fieldProps("hub")} required defaultValue="">
                <option value="">Pilih hubungan…</option>
                <option>Ayah Kandung</option><option>Ibu Kandung</option><option>Wali</option>
              </select>
              <span className="err">{errors.hub}</span>
            </div>
            <div className={fieldClass("wa")}>
              <label htmlFor="wa">Nomor WhatsApp Aktif<span className="req">*</span></label>
              <input
                {...fieldProps("wa")}
                type="tel"
                inputMode="tel"
                placeholder="081234567890"
                required
                pattern="(\+62|62|0)8[0-9]{8,12}"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.value = el.value.replace(/[^\d+]/g, "");
                  if (errors.wa) checkField(el);
                }}
              />
              <span className="hint">Format: 08xx</span><span className="err">{errors.wa}</span>
            </div>
            <div className="field">
              <label htmlFor="kerja">Pekerjaan Utama</label>
              <select id="kerja" name="kerja">
                <option>Karyawan Swasta / BUMN</option><option>PNS / TNI / Polri</option><option>Wiraswasta</option>
                <option>Petani / Pekebun</option><option>Guru / Dosen</option><option>Lainnya</option>
              </select>
            </div>
            <div className={fieldClass("jalan", " full")}>
              <label htmlFor="jalan">Jalan / Dusun<span className="req">*</span></label>
              <input {...fieldProps("jalan")} type="text" placeholder="Contoh: Jl. Hadi Subroto No. 12" required />
              <span className="err">{errors.jalan}</span>
              </div>
            <div className={fieldClass("rt")}>
              <label htmlFor="rt">RT<span className="req">*</span></label>
              <input
                {...fieldProps("rt")}
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="04"
                required
                pattern="\d{1,3}"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.value = el.value.replace(/\D/g, "");
                  if (errors.rt) checkField(el);
                }}
              />
              <span className="err">{errors.rt}</span>
            </div>
            <div className={fieldClass("rw")}>
              <label htmlFor="rw">RW<span className="req">*</span></label>
              <input
                {...fieldProps("rw")}
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="02"
                required
                pattern="\d{1,3}"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.value = el.value.replace(/\D/g, "");
                  if (errors.rw) checkField(el);
                }}
              />
              <span className="err">{errors.rw}</span>
            </div>
          <div className={fieldClass("desa")}>
  <label htmlFor="desa">Desa / Kelurahan<span className="req">*</span></label>
  <input {...fieldProps("desa")} type="text" placeholder="Contoh: Margo Lestari" required />
  <span className="err">{errors.desa}</span>
          </div>
          <div className={fieldClass("kec")}>
            <label htmlFor="kec">Kecamatan<span className="req">*</span></label>
            <input {...fieldProps("kec")} type="text" placeholder="Contoh: Jati Agung" required />
            <span className="err">{errors.kec}</span>
          </div>
          <div className={fieldClass("kab", " full")}>
            <label htmlFor="kab">Kabupaten / Kota<span className="req">*</span></label>
            <input {...fieldProps("kab")} type="text" placeholder="Contoh: Lampung Selatan" required />
            <span className="err">{errors.kab}</span>
          </div>
          </div>
        </section>

        {/* 4. Info PPDB */}
        <section className="card form-card" aria-labelledby="h-info">
          <header><div className="t"><span className="ic" aria-hidden="true">📣</span><h2 id="h-info">Informasi PPDB</h2></div></header>
          <fieldset style={{ border: 0, padding: 0, minInlineSize: 0 }}>
            <legend className="sr-only">Dari mana Anda mengetahui PPDB ini?</legend>
            <p style={{ padding: "20px 24px 0", fontSize: 14, fontWeight: 600 }}>Dari mana Anda mengetahui PPDB ini?</p>
            <div className="checks">
              {infoOptions.map((o) => (
                <label className="check" key={o}><input type="checkbox" name="info" value={o} /> {o}</label>
              ))}
              <label className="check">
                <input
                  type="checkbox"
                  id="infoLain"
                  checked={lainChecked}
                  onChange={(e) => {
                    setLainChecked(e.target.checked);
                    const txt = formRef.current?.querySelector<HTMLInputElement>("#infoLainTxt");
                    if (!txt) return;
                    if (e.target.checked) setTimeout(() => txt.focus());
                    else txt.value = "";
                  }}
                />{" "}
                Yang lain :
                <input type="text" id="infoLainTxt" name="infoLain" placeholder="Sebutkan…" disabled={!lainChecked} aria-label="Sumber informasi lainnya" />
              </label>
            </div>
          </fieldset>
        </section>

        {/* 5. Unggah */}
        <section className="card form-card" aria-labelledby="h-up">
          <header><div className="t"><span className="ic" aria-hidden="true">📎</span><h2 id="h-up">Unggah Berkas</h2></div></header>
          <div className="uploads">
            <div data-upload="foto">
              <UploadBox
                title="1. Pas Foto Siswa"
                hint={<>Format JPG/PNG, ukuran maks. 2 MB. Foto akan dicetak pada Kartu Pelajar &amp; Buku Induk.</>}
                icon="📷"
                dropText="Tarik & letakkan foto di sini"
                pickText="Pilih Foto"
                accept={["image/jpeg", "image/png"]}
                maxMb={2}
                formatsLabel="JPG / PNG • Maks. 2 MB"
                formatError="Format tidak didukung. Gunakan JPG atau PNG."
                file={files.foto}
                error={fileErrors.foto}
                onFile={(f) => setFiles((x) => ({ ...x, foto: f }))}
                onError={(m) => setFileErrors((x) => ({ ...x, foto: m }))}
              >
                <div className="photo-guide">
                  <div><b>✓ Foto diterima</b>• Wajah menghadap depan (70–80% area)<br />• Latar belakang polos (merah/biru)<br />• Berkerah rapi / seragam SD</div>
                  <div className="bad"><b>✗ Foto ditolak</b>• Selfie / sudut miring<br />• Memakai filter atau kacamata hitam<br />• Gambar pecah / kurang dari 300 px</div>
                </div>
              </UploadBox>
            </div>
            <div data-upload="skl">
              <UploadBox
                title="2. Surat Keterangan Lulus (SKL) / Keterangan Kelas 6"
                hint={<>Dari Kepala Sekolah Dasar asal calon siswa, bertanda tangan basah &amp; cap stempel resmi. Format PDF atau foto JPG/PNG, maks. 5 MB.</>}
                icon="📄"
                dropText="Tarik & letakkan berkas SKL di sini"
                pickText="Pilih File SKL"
                accept={["application/pdf", "image/jpeg", "image/png"]}
                maxMb={5}
                formatsLabel="PDF / JPG / PNG • Maks. 5 MB"
                formatError="Format tidak didukung. Gunakan PDF, JPG, atau PNG."
                file={files.skl}
                error={fileErrors.skl}
                onFile={(f) => setFiles((x) => ({ ...x, skl: f }))}
                onError={(m) => setFileErrors((x) => ({ ...x, skl: m }))}
              />
            </div>
          </div>
        </section>

        <div className="action-bar">
          <span className="status" aria-live="polite">{saveStatus}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-soft" onClick={saveDraft}>💾 Simpan Draf Formulir</button>
            <button type="submit" className="btn btn-primary">Kirim &amp; Lanjutkan Unggah Dokumen →</button>
          </div>
        </div>
      </form>

      <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
      <div className={`modal${done ? " show" : ""}`} role="dialog" aria-modal="true" aria-labelledby="mt">
        <div className="modal-box">
          <div className="big">🎉</div>
          <h2 id="mt">Pendaftaran Terkirim</h2>
          <p>
            Terima kasih, <b>{done?.name}</b>. Nomor pendaftaran Anda <code>{done?.no}</code>. Simpan nomor ini;
            pengumuman akan dikirim ke email dan WhatsApp yang didaftarkan.
          </p>
          {done && <button className="btn btn-primary" autoFocus onClick={closeModal}>Tutup</button>}
        </div>
      </div>
    </>
  );
}
