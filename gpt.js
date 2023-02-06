import {ChatGPTAPI} from 'chatgpt'
import * as color from './ansi_colors.js'
import readline from "readline";
import clipboardy from "clipboardy";

const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_KEY
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})

const args = process.argv.slice(2)

let conversationId = uuidv4()
let parentMessageId = null
let lastLineCount = 0
let lastMessage = ""
while (true) {
    let message = (parentMessageId == null && args.length !== 0) ? args.join(" ") : await readMultilineString()

    if (message === "exit" || message === "quit") {
        process.exit(0)
    } else if (message === "reset") {
        conversationId = uuidv4()
        parentMessageId = null
        console.log("Conversation reset")
        continue
    } else if (message === "cp" || message === "copy") {
        if (lastMessage !== "") {
            clipboardy.writeSync(lastMessage)
        }
        continue;
    } else if (message === "info" || message === "help") {
        console.log("ChatGPT CLI implementation by Yan Wittmann, using transitive-bullshit/chatgpt-api")
        console.log("  | exit, quit   | Exit the program")
        console.log("  | reset        | Reset the conversation")
        console.log("  | cp, copy     | Copy the last response to the clipboard")
        console.log("  | info, help   | Show this help")
        console.log("Conversation ID:   " + conversationId)
        console.log("Parent Message ID: " + parentMessageId)
        continue;
    } else if (message === "") {
        continue
    }

    lastLineCount = 0
    let {id, text} = await followUpMessage(message, conversationId, parentMessageId)
    parentMessageId = id
    logResponse(text)
    process.stdout.write("\n")
    lastMessage = text
}


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function followUpMessage(message, conversationId, parentMessageId) {
    let messageId = uuidv4()
    let res = await api.sendMessage(message, {
        conversationId,
        parentMessageId,
        messageId,
        onProgress: (partialResponse) => {
            logResponse(partialResponse.text)
        }
    })
    return {id: messageId, text: res.text}
}

function logResponse(res) {
    if (res === undefined || res === null || res === "" || res === "undefined") {
        return
    }
    let split = res.split("\n")

    let maxCharsPerLine = process.stdout.columns - 5
    let lines = []
    for (let i = 0; i < split.length; i++) {
        let line = split[i]
        let buffer = ""
        for (let j = 0; j < line.length; j++) {
            if (buffer.length === maxCharsPerLine) {
                lines.push(buffer)
                buffer = ""
            }
            buffer += line[j]
        }
        if (buffer.length > 0) {
            lines.push(buffer)
        }
    }

    if (lines.length === 0 || lines[lines.length - 1] === undefined) {
        return
    }

    if (lastLineCount === 0) {
        process.stdout.write(color.colorize("     " + lines[lines.length - 1], color.FgGreen));
        lastLineCount = 1;
    } else {
        if (lastLineCount < lines.length) {
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(color.colorize("     " + lines[lines.length - 2], color.FgGreen))
            process.stdout.write("\n")
            lastLineCount = lines.length
        }
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(color.colorize("     " + lines[lines.length - 1], color.FgGreen));
    }
}

function readString(prefix = 'You: ') {
    return new Promise(resolve => rl.question(color.colorize(prefix, color.FgYellow), resolve))
}

async function readMultilineString() {
    let initial = await readString()
    if (initial === null || initial === undefined || initial === "") {
        return ""
    }
    if (["exit", "quit", "reset", "cp", "copy", "info", "help"].includes(initial)) {
        return initial
    }
    let builder = [initial]
    let timestamp = Date.now()
    while (true) {
        let next = await readString("...  ")
        if (next === null || next === undefined || next === "") {
            if (Date.now() - timestamp > 40) {
                break
            }
        }
        timestamp = Date.now()
        builder.push(next)
    }
    return builder.join("\n")
}
