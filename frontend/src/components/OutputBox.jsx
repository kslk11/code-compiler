const OutputBox = ({ result }) => {
  return (
    <div className="mt-4 p-3 border rounded bg-black text-green-400 min-h-[100px]">
      {result?.success && <pre>{result.output}</pre>}

      {!result?.success && (
        <pre className="text-red-400">
          {result?.type}: {result?.error}
        </pre>
      )}
    </div>
  );
};

export default OutputBox;