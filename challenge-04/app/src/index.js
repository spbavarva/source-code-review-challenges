#!/usr/bin/env node
'use strict';

/*
 * metrics-collector - tiny internal CLI.
 *
 * Reads a build-metrics JSON file and ships a summary to the Northwind dashboard.
 * The dependency wiring is the interesting part of this project, not this file.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { summarize } = require('@northwind/metrics-core');
const { sendMetrics } = require('@northwind/dashboard-client');

const program = new Command();

program
  .name('metrics-collector')
  .description('Collect build metrics and send them to the Northwind dashboard')
  .argument('<metrics-file>', 'path to a build-metrics JSON file')
  .action(async (metricsFile) => {
    const summary = summarize(metricsFile);
    console.log(chalk.green('Collected metrics:'), summary);
    await sendMetrics(summary);
    console.log(chalk.green('Done.'));
  });

program.parse();
