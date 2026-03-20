// Read input and print sum
process.stdin.on("data", (data) => {
  const [a, b] = data.toString().split(" ").map(Number);
  console.log(a + b);
});