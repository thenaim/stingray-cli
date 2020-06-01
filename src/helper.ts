import Fs from "fs";
import Path from "path";
import os from "os";
import { promisify } from "util";
import { exec } from "child_process";
import sudoPrompt from "sudo-prompt";
import Tar from "tar";

import { Config } from "./config";

const readdirAsync = promisify(Fs.readdir.bind(Fs));
const renameAsync = promisify(Fs.rename.bind(Fs));
const mkdirAsync = promisify(Fs.mkdir.bind(Fs));
const unlinkAsync = promisify(Fs.unlink.bind(Fs));
const chmodAsync = promisify(Fs.chmod.bind(Fs));
const execureAsync = promisify(exec.bind(exec));
const statSync = Fs.statSync;
const homedir = Path.join(os.homedir(), Config.cliDir);

/**
 * Create stingray cli directory
 *
 * @return {Promise<boolean>}
 */
function mrdirProjectInit(): Promise<boolean> {
  return new Promise<any>(async (resolve) => {
    if (!(await existsAsync(homedir))) {
      await mkdirAsync(homedir)
        .then(() => resolve(true))
        .catch((error) => resolve(error));
    } else {
      resolve(true);
    }
  });
}

/**
 * Extract example apps from archive
 *
 * @return {Promise<boolean>}
 */
function extractApps(): Promise<boolean> {
  return new Promise<any>(async (resolve, reject) => {
    await getInstalledApps().then(async (apps) => {
      if (!apps.length || !(await existsAsync(Path.join(homedir, "./apps")))) {
        await Tar.extract({
          file: Path.join(
            homedir,
            <string>Config.stingrayAppUrl.url.split("/").pop()
          ),
          C: homedir,
        })
          .then(() => resolve())
          .catch((err) => reject(err));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Check file exist
 *
 * @param {string} filePath
 * @return {Promise<boolean>}
 */
function existsAsync(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    Fs.access(filePath, (err) => resolve(!err));
  });
}

/**
 * Prompt the user for execute shell commands
 *
 * @return {Promise<boolean>}
 */
function trySudoPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    sudoPrompt.exec(
      "echo stingray-cli",
      {
        name: "Stingray cli",
      },
      (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

/**
 * Check docker install
 *
 * @return {Promise<boolean>}
 */
function checkDockerAsync(): Promise<boolean> {
  return new Promise(async (resolve) => {
    await execureAsync("docker -v")
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

/**
 * Get installed apps
 *
 * @return {Promise<string[]>}
 */
function getInstalledApps(): Promise<string[]> {
  return new Promise(async (resolve) => {
    await readdirAsync(Path.join(homedir, "./apps"))
      .then((files) => resolve(files))
      .catch(() => resolve([]));
  });
}

/**
 * Join paths
 *
 * @param {string} first
 * @param {string} second
 * @return {string}
 */
function pathJoin(first: string, second: string): string {
  return Path.join(first, second);
}

export const helper = {
  promisify,
  homedir,

  existsAsync,
  checkDockerAsync,
  trySudoPrompt,
  mrdirProjectInit,
  extractApps,
  pathJoin,
  getInstalledApps,

  readdirAsync,
  renameAsync,
  mkdirAsync,
  unlinkAsync,
  chmodAsync,
  statSync,
};
