process.stdin.on("data", function(data) {
  const n = data.toString().trim();
  console.log(n.split("").reverse().join(""));
});