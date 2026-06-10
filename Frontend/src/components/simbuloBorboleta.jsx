//size — tamanho da borboleta em pixels. O padrão é 44px mas você pode passar qualquer valor, por exemplo <ButterflyIcon size={120} /> para a tela de login ou <ButterflyIcon size={40} /> para a topbar.
//opacity — transparência. Usamos opacity={0.04} quando ela aparece como marca d'água no fundo das telas.
export function Borboleta({ size = 44, opacity = 1 }) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 44 38" fill="none" style={{ opacity }}>
      <polygon points="22,16 1,9 10,4" fill="#7ab4e8"/>
      <polygon points="22,16 10,4 2,14" fill="#4a94d8"/>
      <polygon points="22,16 2,14 5,22" fill="#2472c8"/>
      <polygon points="22,16 5,22 15,23" fill="#1054b8"/>
      <polygon points="22,16 43,9 34,4" fill="#7ab4e8"/>
      <polygon points="22,16 34,4 42,14" fill="#4a94d8"/>
      <polygon points="22,16 42,14 39,22" fill="#2472c8"/>
      <polygon points="22,16 39,22 29,23" fill="#1054b8"/>
      <polygon points="22,16 15,23 16,32 21,29" fill="#0a40a8"/>
      <polygon points="21,29 16,32 18,37" fill="#082890"/>
      <polygon points="22,16 29,23 28,32 23,29" fill="#0a40a8"/>
      <polygon points="23,29 28,32 26,37" fill="#082890"/>
      <line x1="22" y1="16" x2="1" y2="9" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      <line x1="22" y1="16" x2="10" y2="4" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      <line x1="22" y1="16" x2="43" y2="9" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      <line x1="22" y1="16" x2="34" y2="4" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      <line x1="22" y1="6" x2="22" y2="36" stroke="#041060" strokeWidth="1" opacity="0.3"/>
      <line x1="22" y1="6" x2="15" y2="1" stroke="#4a94d8" strokeWidth="0.9"/>
      <line x1="22" y1="6" x2="29" y2="1" stroke="#4a94d8" strokeWidth="0.9"/>
      <circle cx="15" cy="1" r="1.4" fill="#4a94d8"/>
      <circle cx="29" cy="1" r="1.4" fill="#4a94d8"/>
    </svg>
  )
}