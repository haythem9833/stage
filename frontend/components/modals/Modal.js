export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top:0, left:0, width:"100%", height:"100%",
      background:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center"
    }}>
      <div style={{ background:"#fff", padding:"2rem", borderRadius:"8px", width:"500px" }}>
        <h2>{title}</h2>
        <button onClick={onClose} style={{ float:"right" }}>X</button>
        {children}
      </div>
    </div>
  );
}
