"use client";

import { useState } from "react";

export type Eskul = { e: string; img?: string; name: string; sub: string; desc: string };

// Ikon ekskul: gambar unggahan admin, atau emoji
const Ic = ({ x }: { x: Eskul }) =>
  // eslint-disable-next-line @next/next/no-img-element
  x.img ? <img src={x.img} alt="" style={{ width: "1.4em", height: "1.4em", objectFit: "contain" }} /> : <>{x.e}</>;

// Klik salah satu ekskul → kartu penjelasannya tampil di bawah
export function EskulPicker({ items }: { items: Eskul[] }) {
  const [active, setActive] = useState(0);
  const cur = items[active];

  return (
    <div className="eskul-panel">
      <div className="eskul-chips" role="tablist" aria-label="Pilih ekstrakurikuler">
        {items.map((e, i) => (
          <button
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="eskul-detail"
            className={`eskul-chip${i === active ? " active" : ""}`}
            key={i}
            onClick={() => setActive(i)}
          >
            <div className="e"><Ic x={e} /></div>
            <b>{e.name}</b>
            <span>{e.sub}</span>
          </button>
        ))}
      </div>
      {cur && (
        <article className="card fac eskul-detail" id="eskul-detail" role="tabpanel" key={active}>
          <h3><Ic x={cur} /> {cur.name}</h3>
          <p>{cur.desc}</p>
        </article>
      )}
    </div>
  );
}
