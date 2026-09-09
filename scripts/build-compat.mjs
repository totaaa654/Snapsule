// Let Rolldown's native Windows handles settle before the CLI forces process exit.
// Build failures retain the CLI's original exit status.
if (process.platform === 'win32') {
  const exit = process.exit.bind(process);
  process.exit = (code = 0) => {
    if (Number(code) !== 0) return exit(code);
    setTimeout(() => exit(code), 1000);
  };
}
