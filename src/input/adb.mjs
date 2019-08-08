import { spawn } from 'child_process'

// input
const start = (callback) => {
  const adb = spawn('adb', ['logcat']);

  adb.stdout.on('data', (data) => {
    callback(`${data}`)
  });

  adb.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  adb.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

export {
  start,
}
