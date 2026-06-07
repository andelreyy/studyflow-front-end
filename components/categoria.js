export function Categoria({
  categoria,
  onDelete,
  disabled,
}) {
  return (
    <li>
      <strong>{categoria.nome}</strong>
      {" - "}
      {categoria.cor}

      <button
        style={{
          color: "red", 
          marginLeft: "10px",
        }}
        onClick={() => onDelete(categoria)}
        disabled={disabled}
      >
        🗑
      </button>
    </li>
  );
}