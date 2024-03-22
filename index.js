#!/usr/bin/env node
import { program } from "commander";
import downloadCommand from "./commands/download.js";
import watchCommand from "./commands/watch.js";
import syncCommand from "./commands/sync.js";
import loginCommand from "./commands/login.js";
import logoutCommand from "./commands/logout.js";

program.version("1.0.0").description("My CLI Tool");

// Register your commands
program.addCommand(loginCommand, { name: "login" });
program.addCommand(downloadCommand, { name: "pull" });
program.addCommand(syncCommand, { name: "sync" });
program.addCommand(watchCommand, { name: "watch" });
program.addCommand(logoutCommand, { name: "logout" });

program.parse(process.argv);
