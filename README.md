# ChatGPT Command Line Interface

Enables access to the ChatGPT model via the command line using
[transitive-bullshit/chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api) package.

![Demo](img/demo_1.png)

Provides a live preview of the result:

![Demo](img/demo_2.gif)

## Installation

### with clone

```bash
git clone https://github.com/YanWittmann/gpt-cmd
cd gpt-cmd
npm install
```

### without clone

```bash
npm install
```

## Usage

1. Define a `OPENAI_KEY` environment variable with your OpenAI API key. You can obviously also edit the source code in
   [gpt.js](gpt.js) to hardcode your key.

   ```JavaScript
   const api = new ChatGPTAPI({
       apiKey: process.env.OPENAI_KEY
   })
   ```
2. Add the project directory to your PATH variable.  
   The `gpt.bat` file will be used to launch the program on Windows, and `gpt.sh` on Linux and MacOS. I do not own a
   Mac, so I cannot test the `gpt.sh` file. If you have a problem with it and a potential solution, please open an
   issue.
3. You can optionally pass an initial text by specifying it as argument:

   ```bash
   gpt <text>
   ```

   In any case, the interactive mode will be activated, and you can type your text in the console.

    - Enter a (multiline) prompt and press `Enter` twice to generate a response
    - `Ctrl+C`, `exit`, `quit` to exit
    - `reset` to reset the conversation
    - `cp`, `copy` to copy the last response to the clipboard
    - `info`, `help` to display a message similar to this one
