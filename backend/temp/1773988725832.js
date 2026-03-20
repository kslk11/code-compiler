process.stdin.on("data", function(data) {
  const [a, b] = data.toString().split(" ").map(Number);
  console.log(a + b);
});