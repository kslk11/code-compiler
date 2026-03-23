import { exec } from "child_process";

export const executeCode = (language, code, input = "") => {
  return new Promise((resolve) => {
    let isResolved = false;

    const safeResolve = (data) => {
      if (!isResolved) {
        isResolved = true;
        resolve(data);
      }
    };

    let command = "";

    if (language === "python") {
      command = `docker run --rm -i runner-python sh -c "cat > code.py && python3 code.py"`;
    } 
    else if (language === "javascript") {
      command = `docker run --rm -i runner-js sh -c "cat > code.js && node code.js"`;
    } 
    else if (language === "java") {
      command = `docker run --rm -i runner-java sh -c "cat > Main.java && javac Main.java && java Main"`;
    } 
    else {
      return safeResolve({
        success: false,
        error: "Unsupported language"
      });
    }

    console.log("🐳 Running:", command);

    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        return safeResolve({
          success: false,
          type: "runtime_error",
          error: stderr || error.message
        });
      }

      safeResolve({
        success: true,
        output: stdout
      });
    });

    // ✅ send code directly
    process.stdin.write(code);
    process.stdin.end();

    setTimeout(() => {
      process.kill("SIGKILL");
      safeResolve({
        success: false,
        type: "timeout_error",
        error: "Execution timed out"
      });
    }, 5000);
  });
};