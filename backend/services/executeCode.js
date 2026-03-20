import { exec } from "child_process";
import fs from "fs";
import path from "path";

const TEMP_DIR = "./temp";

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

export const executeCode = (language, code, input = "") => {
  return new Promise((resolve) => {
    const jobId = Date.now();
    const jobDir = path.join(TEMP_DIR, jobId.toString());

    fs.mkdirSync(jobDir);

    let fileName = "";
    let image = "";
    let runCommand = "";

    // 🔹 Language setup
    if (language === "python") {
      fileName = "code.py";
      image = "code-python";
      
    } 
    else if (language === "javascript") {
      fileName = "code.js";
      image = "code-js";
    } 
    else if (language === "java") {
      fileName = "Main.java";
      image = "code-java";
    }

    const filePath = path.join(jobDir, fileName);
    fs.writeFileSync(filePath, code);

    // 🔥 Docker Run Command
    runCommand = `docker run --rm -i \
      --memory="100m" \
      --cpus="0.5" \
      -v ${path.resolve(jobDir)}:/app \
      ${image}`;

    const process = exec(runCommand, (error, stdout, stderr) => {
      // 🧹 Cleanup folder
      fs.rmSync(jobDir, { recursive: true, force: true });

      if (error) {
        return resolve({
          success: false,
          type: "runtime_error",
          error: stderr || error.message
        });
      }

      resolve({
        success: true,
        output: stdout
      });
    });

    if (input) {
      process.stdin.write(input);
    }
    process.stdin.end();

    setTimeout(() => {
      process.kill();
      resolve({
        success: false,
        type: "timeout_error",
        error: "Execution timed out"
      });
    }, 10000);
  });
};