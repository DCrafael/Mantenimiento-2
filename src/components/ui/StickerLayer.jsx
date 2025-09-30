export default function StickerLayer() {
  // Lista de stickers con posiciones; puedes mover/añadir a gusto
  const stickers = [
    { src: "/stickers/ecg-strip.png",        w: 220, x: "6%",   y: "18%", r: -2,  a: 0.85 },
    { src: "/stickers/emg.png",              w: 280, x: "74%",  y: "20%", r: 2,   a: 0.85 },
    { src: "/stickers/eeg-illustration.png", w: 260, x: "9%",   y: "72%", r: -4, a: 0.9  },
    { src: "/stickers/ekg-device.png",       w: 220, x: "78%",  y: "72%", r: 5,  a: 0.9  },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {stickers.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt=""
          style={{
            position: "absolute",
            width: s.w,
            left: s.x,
            top: s.y,
            transform: `rotate(${s.r}deg)`,
            opacity: s.a,
          }}
          className={`drop-shadow-xl select-none sticker-float-${(i % 3) + 1}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}
