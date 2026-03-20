let input = "";

process.stdin.on("data", (data) => {
  input += data;
});

process.stdin.on("end", () => {
  const [a, b] = input.trim().split(" ").map(Number);
  console.log(a + b);
});