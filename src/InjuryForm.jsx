// Simple placeholder
export default function InjuryForm({ onSave }) {
  const [selected, setSelected] = useState([]);

  const injuries = ["shoulders", "back", "legs", "chest"];

  const toggle = (type) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="text-white p-4 bg-gray-800 rounded-xl mb-4">
      <h3 className="font-semibold mb-2">🩹 Report an Injury</h3>
      <div className="flex gap-2 flex-wrap">
        {injuries.map((type) => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`px-3 py-1 rounded ${selected.includes(type) ? "bg-red-500" : "bg-gray-600"}`}
          >
            {type}
          </button>
        ))}
      </div>
      <button
        className="mt-4 bg-blue-600 py-2 px-4 rounded"
        onClick={() => {
          localStorage.setItem("reportedInjuries", JSON.stringify(selected));
          onSave();
        }}
      >
        Save
      </button>
    </div>
  );
}
