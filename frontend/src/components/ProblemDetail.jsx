const ProblemDetail = ({ problem }) => {
  if (!problem) return <div>Select a problem</div>;

  return (
    <div className="mb-3">
      <h2 className="text-xl font-bold">{problem.title}</h2>
      <p className="mt-2">{problem.description}</p>
    </div>
  );
};

export default ProblemDetail;