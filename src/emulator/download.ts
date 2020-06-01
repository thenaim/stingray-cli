#!/usr/bin/env node

import Fs from "fs";
import Axios from "axios";
import ProgressBar from "progress";
import Path from "path";
import { helper } from "../helper";
import { DownloadInitInterface } from "../interfaces";

interface StingrayTVFetcherOptions {
  url: string;
  title: string;
}

export class StingrayTVFetcher {
  private options: StingrayTVFetcherOptions;
  private fileName: string;

  constructor(download_options: StingrayTVFetcherOptions) {
    this.options = download_options;
    this.fileName = download_options.url.split("/").pop() || "";
  }

  /**
   * Download init
   *
   * @param {boolean} reDownload
   * @return {Promise<DownloadInitInterface>}
   */
  public downloadInit(
    reDownload: boolean = false
  ): Promise<DownloadInitInterface> {
    return new Promise(async (resolve, reject) => {
      // check file exist and also check download again or not
      await helper
        .existsAsync(Path.join(helper.homedir, this.fileName))
        .then((exist: boolean) => {
          return new Promise<DownloadInitInterface>((resolve) => {
            let data: DownloadInitInterface = {
              message: `${this.options.title} is installed!`,
              update: false,
              exist: false,
            };
            if (exist) {
              if (reDownload) {
                data.message = `${this.options.title} is update!`;
                data.update = true;
                data.exist = true;
                return resolve(data);
              }
              data.message = `${this.options.title} is already installed!`;
              data.exist = true;
              return resolve(data);
            }
            return resolve(data);
          });
        })
        .then(async (done) => {
          // if file exist return
          if (done.exist && !done.update) {
            done.done = true;
            return resolve(done);
          }
          // download file
          await this.downloadFile(this.options.url, this.options.title)
            .then(async () => {
              // if downloaded, then rename downloaded file
              await helper
                .renameAsync(
                  Path.join(helper.homedir, `${this.fileName}.dl`),
                  Path.join(helper.homedir, this.fileName)
                )
                .then(() => {
                  done.done = true;
                  return resolve(done);
                })
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    });
  }

  /**
   * Download file
   *
   * @param {string} url
   * @param {string} title
   * @return {Promise<boolean>}
   */
  public downloadFile(url: string, title: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      await Axios({
        url,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        method: "GET",
        responseType: "stream",
        timeout: 10000,
      })
        .then((body) => {
          const { data, headers } = body;
          const progressBar = new ProgressBar(
            title + ": [:bar] :rate/bps :percent :etas",
            {
              width: 30,
              complete: "=",
              incomplete: " ",
              renderThrottle: 1,
              total: parseInt(headers["content-length"]),
            }
          );

          const writer = Fs.createWriteStream(
            Path.join(helper.homedir, `./${this.fileName}.dl`)
          );

          data.on("data", (chunk: any) => progressBar.tick(chunk.length));
          data.pipe(writer);

          writer.on("finish", () => resolve());
          writer.on("error", (error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }
}

module.exports = { StingrayTVFetcher };
