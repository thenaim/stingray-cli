#!/usr/bin/env node

import { StingrayTVFetcher } from "./emulator/download";
import program from "commander";
import { spawn } from "child_process";
import { helper } from "./helper";
import Path from "path";

import chalk from "chalk";
import figlet from "figlet";
import Table from "cli-table";

import { Config } from "./config";

const pkg = require(Path.join(__dirname, "../package.json"));

// Log any unhandled exceptions...
process.on("uncaughtException", (err) =>
  console.log(`uncaughtException: ${err}`, err)
);
process.on("unhandledRejection", (err, promise) =>
  console.log(`unhandledRejection: ${err}`, err, promise)
);

program
  .command("init")
  .description("Install StingrayTV emulator and apps.")
  .action(async () => {
    const stingrayTVImg = new StingrayTVFetcher(Config.stingrayImgUrl);
    const stingrayTVApps = new StingrayTVFetcher(Config.stingrayAppUrl);

    await helper
      .mrdirProjectInit()
      .then(() => stingrayTVImg.downloadInit())
      .then((img: any) => {
        console.log(chalk.green(img.message));
        return stingrayTVApps.downloadInit();
      })
      .then((apps: any) => {
        console.log(chalk.green(apps.message));
        return helper.extractApps().then(() => apps);
      })
      .then((apps) => {
        if (!apps.exist) {
          console.log(
            chalk.red(
              figlet.textSync("Stingray cli", { horizontalLayout: "full" })
            )
          );
          program.outputHelp();
        }
      })
      .catch((err) => console.log(err));

    return process.exit(0);
  });

program
  .command("run")
  .alias("r")
  .description("Run emulator")
  .option(
    "--acard, --audiocard_number <audiocard_number>",
    "The audiocard number to run emulator."
  )
  .option(
    "--anumber, --audiodevice_number <audiodevice_number>",
    "The audiodevice number format to run emulator."
  )
  .action(async (options: any) => {
    if (!(await helper.checkDockerAsync())) {
      return console.log("Docker is not installed");
    }

    const command = `docker run\
    -e DISPLAY=$DISPLAY\
    -v /tmp/.X11-unix:/tmp/.X11-unix\
    -v ${Path.join(helper.homedir, `./apps:/opt/stingray/apps`)}\
    --group-add $(getent group audio | cut -d: -f3)\
    --device /dev/snd\
    stingray-emu stingray_runner\
    --audiocard-number=${options.audiocard_number || 1}\
    --audiodevice-number=${options.audiodevice_number || 0}`;

    const ls = spawn(command, {
      shell: true,
      cwd: helper.homedir,
    });

    ls.stdout.on("data", (data) => {
      console.log(`${data}`);
    });

    ls.stderr.on("data", (data) => {
      console.log(`${data}`);
    });

    ls.on("close", (close) => {
      console.log(`\nGet more information:`);
      console.log(`stingray --help`);
    });
  });

program
  .command("install [dir]")
  .alias("i")
  .description("Install app to emulator.")
  .action(async (dir: string) => {
    if (!(await helper.checkDockerAsync())) {
      return console.log("Docker is not installed");
    }

    let userAppPath = process.cwd();
    if (dir) {
      userAppPath = Path.join(userAppPath, dir);
    }

    const cliAppsPath = Path.join(helper.homedir, "./apps");
    const command = `docker run\
  -v ${userAppPath}:/tmp/mnt/apps${userAppPath}\
  -v ${cliAppsPath}:/tmp/mnt/dist${cliAppsPath}\
  stingray-emu install_app\
  -o /tmp/mnt/dist${cliAppsPath}\
  /tmp/mnt/apps${userAppPath}`;

    const ls = spawn(command, {
      shell: true,
      cwd: helper.homedir,
    });
    let isInstalled = true;

    ls.stdout.on("data", (data) => {
      isInstalled = false;
      console.log(`${data}`);
    });

    ls.stderr.on("data", (data) => {
      console.log(`${data}`);
    });

    ls.on("close", async (code) => {
      if (isInstalled) {
        console.log(
          chalk.green(
            `${
            dir ? dir.split("/").pop() : userAppPath.split("/").pop()
            } installed successfully.`
          )
        );
        console.log(`\nTry to run emulator:`);
        console.log(`stingray run`);
      } else {
        console.log(`\nApp is not installed.`);
        console.log(`\nGet more information:`);
        console.log(`stingray --help`);
      }
    });
  });

program
  .command("update <type>")
  .alias("u")
  .description("Update emulator or apps")
  .action(async (type) => {
    if (type === "emulator") {
      const stingrayTVImg = new StingrayTVFetcher(Config.stingrayImgUrl);
      await helper.existsAsync(helper.homedir).then(async (exist: boolean) => {
        if (exist) {
          await stingrayTVImg.downloadInit(true).then((download) => {
            console.log(chalk.green(download.message));
          });
        } else {
          console.log("Init cli first.");
        }
      });
    } else if (type === "apps") {
      const stingrayTVApps = new StingrayTVFetcher(Config.stingrayAppUrl);
      await stingrayTVApps
        .downloadInit(true)
        .then((download) => {
          console.log(chalk.green(download.message));
          return helper.extractApps();
        })
        .catch((err) => console.log(err));
    } else {
      console.log("Invalid command.\nTry:\nstingray update emulator|apps");
    }
  });

program
  .command("list")
  .alias("l")
  .description("Show installed apps.")
  .action(async () => {
    await helper.getInstalledApps().then((files) => {
      if (files.length) {
        const table = new Table({
          head: ["Index", "App name", "Installed at"],
          colWidths: [8, 25, 25],
        });

        files.forEach(async (element, index) => {
          if (!element.includes("controls")) {
            index += 1;
            const stat = helper.statSync(
              helper.pathJoin(helper.homedir, `./apps/${element}`)
            );
            const date = new Date(stat.atime.toString())
              .toISOString()
              .replace("T", " ")
              .replace(".000Z", "");

            table.push([index, element.split(".")[0], date]);
          }
        });

        console.log(table.toString());
        console.log(
          "Souce code (StingrayTV apps):\nhttps://github.com/GSGroup/stingray-js-apps"
        );
      }
    });
  });

program
  .command("delete <app_name>")
  .alias("d")
  .description("Delete app by name")
  .action(async (app_name: string) => {
    await helper
      .existsAsync(Path.join(helper.homedir, `./apps/${app_name}.pkg`))
      .then((exist: boolean) => {
        if (exist && !app_name.includes("controls")) {
          helper
            .unlinkAsync(Path.join(helper.homedir, `apps/${app_name}.pkg`))
            .then(() => {
              console.log(chalk.green(`${app_name} app is deleted!`));
            });
        } else {
          console.log("Invalid app name, try again.");
        }
      });
  });

program.version(pkg.version).parse(process.argv);
