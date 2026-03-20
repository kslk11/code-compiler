const InputBox = ({ input, setInput }) => {
  return (
    <textarea
      placeholder="Enter input..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="w-full p-2 border rounded mt-2"
      rows={4}
    />
  );
};

export default InputBox;