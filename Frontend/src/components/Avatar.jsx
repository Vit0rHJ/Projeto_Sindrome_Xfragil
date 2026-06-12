import { UPLOADS_URL } from "../services/api";

// avatar padrao do sistema: mostra a foto quando existe, senao a inicial
// do nome no circulo azul. usado em todas as listas e na sidebar.
export default function Avatar({ nome, foto, size = 26 }) {
  if (foto) {
    return (
      <img
        src={`${UPLOADS_URL}/${foto}`}
        alt={nome || "foto"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid #1a6fff",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#0d1a33",
        border: "1px solid #1a6fff44",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(9, Math.round(size * 0.36)),
        fontWeight: 700,
        color: "#1a6fff",
        flexShrink: 0,
      }}
    >
      {nome?.[0]?.toUpperCase() || "?"}
    </div>
  );
}
