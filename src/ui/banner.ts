import boxen from "boxen";
import chalk from "chalk";
import figlet from "figlet";


export function printBanner() {
    const title = figlet.textSync("Daemon - CLI", {font:"Standard", });
    const panel = boxen(
        chalk.greenBright("Chat with AI\n") +
        chalk.dim("In CLI"),
        {padding:1, borderColor: "cyan"}
    );

    console.log(title);
    console.log(panel);
}