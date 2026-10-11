import { Command } from "commander";

export function createCli() {
  const program = new Command()
    .name("daemon-cli")
    .description("integrating ai-chats/features like Antigravity-CLI")
    .version("0.1.0");

  program
    .command("hello")
    .description("Greet")
    .action(() => {
      console.log("Hello from the cli");
    });

  program.action(() => {
    program.help();
  });

  return program;
}
