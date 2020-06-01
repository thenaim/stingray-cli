<h1 align="center">
    <a href="https://github.com/thenaim/stingray-cli#readme">
        <img src="https://capella.pics/232659d6-6ff8-43e9-ae2e-06587e0eb435.jpg">
    </a>
</h1>

<h4 align="center">
The StingrayTV CLI is a command-line interface tool that you use to run, install, update and delete with StingrayTV applications.</br>
    <a href="https://devstingray.gs-labs.tv/" target="_blank">
        StingrayTV JS framework.
    </a>
</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/stingray-cli" target="_blank">
    <img src="https://flat.badgen.net/npm/v/stingray-cli?icon=npm">
  </a>
    <a href="https://github.com/thenaim/stingray-cli/releases" target="_blank">
    <img src="https://flat.badgen.net/github/release/thenaim/stingray-cli">
  </a>
    <a href="https://github.com/thenaim/stingray-cli/commits/master" target="_blank">
    <img src="https://flat.badgen.net/github/last-commit/thenaim/stingray-cli">
  </a>
</p>

# Installation Guide

To use stingray-cli, you'll need [Node.js](https://nodejs.org/en/download/) and (Docker see [StingrayTV](https://devstingray.gs-labs.tv/emulator) docs) installed.

```bash
sudo npm i -g stingray-cli
```

#### Install StingrayTV dist files

```bash
stingray init
```

# Usage

#### Run emulator

```bash
stingray run
stingray run --audiocard_number=1 --audiodevice_number=0
stingray run --acard=1 --anumber=0
```

#### App install

```bash
stingray install
stingray install <dir>
```

#### Apps list

```bash
stingray list
```

#### Delete app

```bash
stingray delete <app_name>
```

#### Update StingrayTV emulator or example apps

```bash
stingray update emulator|apps
```

## License

License MIT (see the [LICENSE](https://github.com/thenaim/stingray/blob/master/LICENSE) file for the full text)
