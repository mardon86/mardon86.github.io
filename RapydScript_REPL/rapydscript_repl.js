import rapydscript_loader from "./rapydscript_loader.js";

export default function(options){
    const {
        container_id,
        width,
        height
    } = options;

    function cloneCommandNode(el) {
        const line = el.cloneNode(true);
        const input = line.querySelector('.input');

        input.autofocus = false;
        input.readOnly = true;
        const temp_el = document.createElement("div")
        temp_el.className = "command"
        temp_el.innerHTML = input.value
        line.appendChild(temp_el)
        //input.insertAdjacentHTML('beforebegin', input.value);
        input.parentNode.removeChild(input);
        line.classList.add('line');

        return line;
    }

    const markup = ({ shell: { prompt, separator } }) => (`
        <div class="container">
            <div class="output"></div>
            <div class="command">
                <div class="prompt">${prompt}${separator}</div>
                <input class="input" spellcheck="false" autofocus />
            </div>
        </div>
    `);

    const { addEventListener, localStorage } = window;
    const KEY = 'VanillaTerm';

    const COMMANDS = {
        '%clear': terminal => terminal.clear(),

        '%wipe': (terminal) => {
            terminal.prompt('Are you sure remove all your commands history? Y/N', (value) => {
                if (value.trim().toUpperCase() === 'Y') {
                    localStorage.removeItem(KEY);
                    terminal.history = []; // eslint-disable-line
                    terminal.historyCursor = 0; // eslint-disable-line
                    terminal.output('History of commands wiped.');
                }
            });
        },
    };

    class Terminal {
        constructor(props = {}) {
            const {
                container_id = 'terminal',
                commands = {},
                welcome = '',
                prompt = '',
                separator = '&gt;'
            } = props;
            this.commands = Object.assign({}, commands, COMMANDS);
            this.history = localStorage[KEY] ? JSON.parse(localStorage[KEY]) : [];
            this.historyCursor = this.history.length;
            this.welcome = welcome;
            this.shell = { prompt, separator };
            this.temp_compl_cmd = '';

            const el = document.getElementById(container_id);
            if (el) {
                this.cacheDOM(el);
                this.addListeners();
                if (welcome) this.output(welcome);
            } else throw Error(`Container #${container_id} doesn't exists.`);
        }

        state = {
            prompt: undefined,
            idle: undefined,
        };

        cacheDOM = (el) => {
            el.classList.add(KEY);
            el.insertAdjacentHTML('beforeEnd', markup(this));

            // Cache DOM nodes
            const container = el.querySelector('.container');
            this.DOM = {
                container,
                output: container.querySelector('.output'),
                command: container.querySelector('.command'),
                input: container.querySelector('.command .input'),
                prompt: container.querySelector('.command .prompt'),
            };
        }

        addListeners = () => {
            const { DOM } = this;
            DOM.output.addEventListener('DOMSubtreeModified', () => {
              setTimeout(() => DOM.input.scrollIntoView(), 10);
            }, false);

            addEventListener('click', () => DOM.input.focus(), false);
            DOM.output.addEventListener('click', event => event.stopPropagation(), false);
            DOM.input.addEventListener('keyup', this.onKeyUp, false);
            DOM.input.addEventListener('keydown', this.onKeyDown, false);
            DOM.command.addEventListener('click', () => DOM.input.focus(), false);

            addEventListener('keyup', (event) => {
                DOM.input.focus();
                event.stopPropagation();
                event.preventDefault();
            }, false);
        }

        onKeyUp = (event) => {
            const { keyCode } = event;
            const { DOM, history = [], historyCursor } = this;

            if (keyCode === 27) { // ESC key
                DOM.input.value = '';
                event.stopPropagation();
                event.preventDefault();
            } else if ([38, 40].includes(keyCode)) {
                if (keyCode === 38 && historyCursor > 0) this.historyCursor -= 1; // {38} UP key
                if (keyCode === 40 && historyCursor < history.length - 1) this.historyCursor += 1; // {40} DOWN key

                if (history[this.historyCursor]) DOM.input.value = history[this.historyCursor];
            }
        }

        onKeyDown = ({ keyCode }) => {
            const {
                commands = {}, DOM, history, onInputCallback, state,
            } = this;
            if (keyCode !== 13) return;

            const command = DOM.input.value;

            if (state.prompt) {
                state.prompt = false;
                this.onAskCallback(command);
                this.setPrompt();
                this.resetCommand();
                return;
            }

            // Save command line in history
            if (command !== "") {
                history.push(command);
            }
            localStorage[KEY] = JSON.stringify(history);
            this.historyCursor = history.length;

            // Clone command as a new output line
            DOM.output.appendChild(cloneCommandNode(DOM.command));

            // Clean command line
            DOM.command.classList.add('hidden');
            DOM.input.value = '';

            // Dispatch command
            if (Object.keys(commands).includes(command)) {
                const callback = commands[command];
                if (callback) callback(this);
            } else {
                if (onInputCallback) onInputCallback(command);
            }
        }

        resetCommand = () => {
            const { DOM } = this;

            DOM.input.value = '';
            DOM.command.classList.remove('input');
            DOM.command.classList.remove('hidden');
            if (DOM.input.scrollIntoView) DOM.input.scrollIntoView();
        }

        clear() {
            this.DOM.output.innerHTML = '';
            this.resetCommand();
        }

        idle() {
            const { DOM } = this;

            DOM.command.classList.add('idle');
            DOM.prompt.innerHTML = '<div class="spinner"></div>';
        }

        prompt(prompt, callback = () => {}) {
            this.state.prompt = true;
            this.onAskCallback = callback;
            this.DOM.prompt.innerHTML = `${prompt}:`;
            this.resetCommand();
            this.DOM.command.classList.add('input');
        }

        onInput(callback) {
            this.onInputCallback = callback;
        }

        output(html = '&nbsp;') {
            this.DOM.output.insertAdjacentHTML('beforeEnd', `<span>${html}</span>`);
            this.resetCommand();
        }

        welcome_el() {
            return document.querySelectorAll(".output span")[0];
        }

        setPrompt(prompt = this.shell.prompt) {
            const { DOM, shell: { separator } } = this;

            this.shell = { prompt, separator };
            DOM.command.classList.remove('idle');
            DOM.prompt.innerHTML = `${prompt}${separator}`;
            DOM.input.focus();
        }
    }

    const terminal_style = document.createElement("style")
    terminal_style.innerHTML = `* {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body {
        margin: 0;
        padding: 0;
      }

      .VanillaTerm {
        all: revert;
        background-color: #222222;
        color: white;
        font-family: "Inconsolata", "Courier New", Courier, monospace;
        font-weight: normal;
        font-size: 80%;
        overflow: hidden;
        padding: 0.5em 0.5em;
        width: ${width};
        height: ${height};
      }
      
        .VanillaTerm .container {
          width: 100%;
          height: 100%;
          overflow-y: scroll;
          margin: 0;
          padding: 0;
        }
          .VanillaTerm .container ::selection {
            background-color: #6d6d6d;
            text-shadow: none !important;
          }
      
          .VanillaTerm .output {
            clear: both;
            line-height: 1.25em;
            width: 100%;
            margin: 0;
            padding: 0;
          }
            
          .VanillaTerm .output span {
            display: block;
            font-weight: normal;
            color: #dddddd;
            white-space: pre-wrap;
          }
      
          .VanillaTerm .prompt, .VanillaTerm a {
            color: #dddddd;
            font-weight: normal;
          }
      
          .VanillaTerm .prompt {
            line-height: 1.5em;
            margin-right: 0em;
            padding: 0em;
            white-space: pre-wrap;
          }
      
          .VanillaTerm .command {
            display: flex;
            white-space: pre-wrap;
          }
      
            .VanillaTerm .command.input .prompt {
              all: revert;
              color: #dddddd;
              font-weight: normal;
              white-space: pre-wrap;
            }
      
            .VanillaTerm .command.idle .input {
              display: none;
              white-space: pre-wrap;
            }
      
            .VanillaTerm .command.hidden .prompt {
              display: none;
            }
      
            .VanillaTerm .command.hidden .input {
              max-width: 1px;
              white-space: pre-wrap;
            }
      
            .VanillaTerm .command .input {
              all: revert;
              background-color: transparent;
              border: none;
              color: #dddddd;
              font: inherit;
              flex: 1;
              margin: 0;
              outline: none;
              padding: 0;
              white-space: pre-wrap;
            }
      
            .VanillaTerm .command .spinner:before {
              display: inline-block;
              content: '⠋';
              animation: spin 1s linear infinite;
              vertical-align: middle;
              margin-right: 10px;
            }
      
      
      @keyframes spin {
         0% { content: '⠋' }
        10% { content: '⠙' }
        20% { content: '⠹' }
        30% { content: '⠸' }
        40% { content: '⠼' }
        50% { content: '⠴' }
        60% { content: '⠦' }
        70% { content: '⠧' }
        80% { content: '⠇' }
        90% { content: '⠏' }
    }`

    document.head.appendChild(terminal_style);

    const term = new Terminal({
        container_id: container_id,
        welcome: 'Please wait. Loading...',
        prompt: '>>> ',
        separator: ''
    });

    function __repr__(x){
        if (typeof x === 'undefined') {
            return 'undefined';
        } else if (Object(x).toString() === '[object Object]') {
            if (JSON.stringify(x) === 'null') {
                return 'null';
            } else {
                return x.constructor.name + ": " + JSON.stringify(x);
            }
        } else if (x.length >= 0 && x.constructor.name !== "String" && x.constructor.name !== "Function"){
            return x.constructor.name + ": " + "[" + Object(x).toString() + "]";
        } else {
            return x.constructor.name + ": " + Object(x).toString();
        }
    }

    function eval_repr(inp) {
        const out_eval = eval.call(window, inp); //the actual eval
        return __repr__(out_eval)
    }

    function compile(command) {
        const rs_out = rapydscript.compile(command, {private_scope: false, beautify: true}).replace("var __name__ = \"__main__\";\n","").replace(/^\n|;$/g, "");
        const out_retval = eval_repr(rs_out)
        return out_retval;
    }

    term.onInput((command, parameters) => {
        if (command === '') {
            if (term.temp_compl_cmd !== '') {
                try {
                    const out_retval = compile(term.temp_compl_cmd.replace(/^\n/g, '') + "\n");
                    term.output(out_retval);
                } catch (err) {
                    term.output(err.stack);
                    throw err;
                } finally {
                    term.temp_compl_cmd = '';
                    term.resetCommand();
                    term.setPrompt(">>> ");
                }
            } else {
                term.resetCommand();
            }
        } else {
            term.temp_compl_cmd = term.temp_compl_cmd + "\n" + command;
            term.resetCommand();
            term.setPrompt("... ");
        }
    });

    rapydscript_loader(function () {
        term.welcome_el().innerHTML = term.welcome_el().innerHTML + '.';
    },
    function () {
        term.welcome_el().innerHTML = "RapydScript " + localStorage.getItem("ՐՏ_version") + " REPL on " + window.navigator.userAgent
    },
    function () {
        term.welcome_el().innerHTML = 'Failed to get rapydscript';
    });

}