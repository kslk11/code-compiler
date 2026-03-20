const ProblemList = ({ problems, setSelectedProblem }) => {
  return (
    <div className="w-1/4 border-r p-2">
      <h2 className="font-bold mb-2">Problems</h2>

      {problems.map((p) => (
        <div
          key={p.id}
          onClick={() => setSelectedProblem(p)}
          className="p-2 cursor-pointer hover:bg-gray-200 rounded"
        >
          {p.title}
        </div>
      ))}
    </div>
  );
};

export default ProblemList;