process.stdin.resume();

process.stdin.on("data", (data) => {
  const [a, b] = data.toString().trim().split(" ").map(Number);
  console.log(a + b);
});