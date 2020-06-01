export interface ConfigInterfaces {
  stingrayAppUrl: StingrayOptionInterface;
  stingrayImgUrl: StingrayOptionInterface;

  cliDir: string;
}

export interface StingrayOptionInterface {
  title: string;
  url: string;
}

export interface DownloadInitInterface {
  message: string;
  update: boolean;
  exist: boolean;
  done?: boolean;
}
