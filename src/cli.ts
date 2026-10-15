import { Command } from "commander";
import { printBanner } from "./ui/banner.js";
import { requireApiKey } from "./config/env.js";
import chalk from "chalk";
import { runQuery } from "./agent/run_query.js";

export function createCli() {
  const program = new Command()
    .name("Daemon-cli")
    .description("Integrating AI-chats/features like Antigravity-CLI")
    .version("0.1.0");

  program
    .command("hello")
    .description("Greet")
    .action(() => {
      console.log("Hello from the cli");
    });

  program
    .command("banner")
    .description("Showing the welcome banner")
    .action(() => {
      printBanner();
    });

  program
    .command("analyze")
    .description("checking environment")
    .action(async () => {
      const { execa } = await import("execa");
      const { stdout } = await execa("node", ["-v"]);
      const majorVersion = Number(stdout.match(/^v(\d+)/)?.[1]);

      if (!Number.isFinite(majorVersion) || majorVersion < 18) {
        throw new Error("Node.js version should be 18 or higher");
      }

      const apiKey = requireApiKey();
      if (!apiKey) {
        throw new Error("API Key is not available");
      }

      console.log(chalk.green("✅ Node.js is >= 18"));
      console.log(chalk.green("✅ API key is set"));
    });

  program
    .command("talk")
    .description("Send one shot prompt to the agent")
    .argument("<prompt>", "The prompt send to the agent")
    .option("-v, --verbose", "Show verbose output")
    .action(async (prompt: string, opts: {verbose?: boolean}) => {
      requireApiKey();
      await runQuery(prompt, {verbose: opts.verbose});
    });

  program.action(() => {
    program.help();
  });

  return program;
}
