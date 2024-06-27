#!/usr/bin/env node
const { spawn } = require("child_process");
const readline = require("readline");
const color = require("colors");

const start = require("./start");

function runBuildScript() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let needPush = false;
  let isI18n = false;
  rl.question(`${color.green(`是否需要push到gitlab`)}? (y/n)  `, (res) => {
    rl.close();
    if (res.trim() === "y" || res.trim() === "Y") needPush = true;
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl2.question(`${color.green(`是海外项目吗`)}? (y/n)  `, (res) => {
      rl2.close();
      if (res.trim() === "y" || res.trim() === "Y") isI18n = true;
      else isI18n = false;

      const buildProcess = spawn(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["run", "build"],
        { stdio: "inherit" }
      );
      buildProcess.on("close", (code) => {
        if (code === 0) {
          console.log("打包成功");
          start(needPush, isI18n);
        } else {
          console.error("打包失败");
        }
      });
    });
  });
}
runBuildScript();
