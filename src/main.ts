#!/usr/bin/env node

import { CLIApplication } from './cli/cli-app.js';
import { HelpCommand } from './cli/commands/help.command.js';
import { ImportCommand } from './cli/commands/import.command.js';
import { VersionCommand } from './cli/commands/version.command.js';

function bootstrap() {
  const cliApplication = new CLIApplication();
  cliApplication.registerCommands([
    new VersionCommand(),
    new HelpCommand(),
    new ImportCommand(),
  ]);

  cliApplication.processCommand(process.argv);
}

bootstrap();
