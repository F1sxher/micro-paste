const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');
const { clipboard } = require('electron');
const undici = require('undici');
const Settings = require('./Settings.jsx');

const microPost = async (url, body, authHeaderName, authKey) => {
  const req = await undici.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      [authHeaderName]: authKey
    },
    body
  });
  return req.body.json();
};

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const ENCRYPTION_LENGTH = 256;

function arrayBufferToBase64 (buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

async function encryptContent (content) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: ENCRYPTION_LENGTH
    },
    true,
    [ 'encrypt', 'decrypt' ]
  );

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv
    },
    key,
    new TextEncoder().encode(content)
  );

  const ivString = arrayBufferToBase64(iv);
  const encryptedString = arrayBufferToBase64(encryptedContent);
  const withIV = `${ivString}:${encryptedString}`;

  return {
    key: arrayBufferToBase64(await crypto.subtle.exportKey('raw', key)),
    encryptedContent: withIV
  };
}

/**
 * 
 * @param {[string]} args 
 * @returns 
 */
function getPassedText(args) {
  args.slice(args.indexOf('--text'))
  args.shift()
  return args.join(" ")
}

module.exports = class MicroPaste extends Plugin {
  startPlugin () {
    const domain = this.settings.get('domain', 'https://micro.sylo.digital');
    const authHeaderName = this.settings.get('authHeaderName', 'Authorization');
    const authKey = this.settings.get('authKey', '');

    powercord.api.settings.registerSettings('micro-paste', {
      category: this.entityID,
      label: 'Micro Paste',
      render: Settings
    });

    powercord.api.commands.registerCommand({
      command: 'paste',
      description: 'Lets you paste content to Micro',
      usage: '{c} [--send] <--clipboard | FILE_URL> <--encrypt> <--burn> <--paranoid> <--extension MD/whateveridk> <--text [your text here if you dont want to use clipboard]>',
      /**
       * 
       * @param {[string]} args 
       * @returns 
       */
      executor: async (args) => {
        /**
         * @type {boolean}
         */
        const send = args.includes('--send')
          ? !!args.splice(args.indexOf('--send'), 1)
          : this.settings.get('send', false);

        /**
         * @type {boolean | string}
         */
        const clipText = args.includes('--clipboard')
          ? clipboard.readText()
          : this.settings.get('clip', true) ? clipboard.readText() 
          : await this.parseArguments(args);

        /**
         * @type {boolean | string}
         */
        const passText = !!args.includes('--text')
          ? getPassedText(args)
          : await this.parseArguments(args)

        /**
         * @type {string}
         */
        const extension = !!args.includes('--extension')
          ? args[args.indexOf('--extension') + 1]
          : this.settings.get('ext', 'md');

        /**
         * @type {boolean}
         */
        const encrypt = !!args.includes('--encrypt')
        
        /**
         * @type {boolean}
         */
         const encryptS = !!this.settings.get('encrypt', false)
        
        /**
         * @type {boolean}
         */
        const noEncrypt = !!args.includes('--no-encrypt')

        /**
         * @type {boolean}
         */
        const paranoid = !!args.includes('--paranoid')

        /**
         * @type {boolean}
         */
        const paranoidS = !!this.settings.get('burn', false)

        /**
         * @type {boolean}
         */
        const noParanoid = !!args.includes('--no-paranoid')

        /**
         * @type {boolean}
         */
        const burn = !!args.includes('--burn')
        
        /**
         * @type {boolean}
         */
        const burnS = !!this.settings.get('burn', false)

        /**
         * @type {boolean}
         */
        const noBurn = !!args.includes('--no-burn')

        if (!clipText && !passText) {
          return {
            send: false,
            result: `Invalid arguments. Run \`${powercord.api.commands.prefix}help paste\` for more information.`
          };
        }
        console.log(encrypt)
        console.log(encryptS)
        console.log(noEncrypt)

        const body = {
          burn: (burn || (burnS && !noBurn)) ? true : false,
          content: passText || clipText,
          encrypted: (encrypt || (encryptS && !noEncrypt)) ? true : false,
          expiresAt: Date.now() + 3600000 * this.settings.get('expiry', 24),
          extension,
          paranoid: (paranoid || (paranoidS && !noParanoid)) ? true : false
        };

        let encryptionKey = false;

        if (encrypt) {
          const result = passText ? await encryptContent(passText) : await encryptContent(clipText);
          body.encrypted = true;
          body.content = result.encryptedContent;
          encryptionKey = result.key;
        }

        const pasteBody = JSON.stringify(body);

        try {
          const body = await microPost(`${domain}/api/paste`, pasteBody, authKey);
          return {
            send,
            result: encryptionKey === false ? `${domain}/p/${body.id}` : `${domain}/p/${body.id}#key=${encryptionKey}`
          };
        } catch (e) {
          return {
            send: false,
            result: `Upload to the specified domain ${domain} failed. Please check that the server is setup properly.`
          };
        }
      }
    });

    try {
      powercord.pluginManager.disable('pc-hastebin');
      this.shouldReenablePCHB = true
    } catch {
      this.shouldReenablePCHB = false
    }
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('micro-paste');
    powercord.api.commands.unregisterCommand('paste');
    if (this.shouldReenablePCHB) powercord.pluginManager.enable('pc-hastebin')
    this.forceUpdate()
  }

  parseArguments (args) {
    const input = args.join(' ');
    if (input.startsWith('https://cdn.discordapp.com/attachments')) {
      return get(input).then(res => res.raw);
    }

    return false;
  }
};
