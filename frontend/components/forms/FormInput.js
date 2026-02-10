export default function FormInput({ label, value, onChange, type="text" }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        style={{ display: "block", width: "100%", padding: "0.5rem" }}
      />
    </div>
  );
}
