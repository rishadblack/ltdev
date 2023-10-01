#!/usr/bin/env node
import { program } from "commander";
import downloadCommand from "./commands/download.js";
import watchCommand from "./commands/watch.js";
import loginCommand from "./commands/login.mjs";

program.version("1.0.0").description("My CLI Tool");

// Register your commands
program.addCommand(loginCommand, { name: "login" });
program.addCommand(downloadCommand, { name: "pull" });
program.addCommand(watchCommand, { name: "watch" });

program.parse(process.argv);
