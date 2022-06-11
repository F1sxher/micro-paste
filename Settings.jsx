const { React } = require('powercord/webpack');
const { TextInput, SwitchItem, SelectInput } = require('powercord/components/settings');

const TYPE_OPTIONS = [
  { label: "Markdown", value: "md" },
  { label: "Plain Text", value: "txt" },
  { label: "HTML", value: "html" },
  { label: "JSON", value: "json" },
  { label: "XML", value: "xml" },
  { label: "SQL", value: "sql" },
  { label: "JavaScript", value: "js" },
  { label: "TypeScript", value: "ts" },
  { label: "JSX", value: "jsx" },
  { label: "TSX", value: "tsx" },
  { label: "CSS", value: "css" },
  { label: "SCSS", value: "scss" },
  { label: "SASS", value: "sass" },
  { label: "LESS", value: "less" },
  { label: "GraphQL", value: "graphql" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "cs" },
  { label: "Python", value: "py" },
  { label: "R", value: "r" },
  { label: "Ruby", value: "rb" },
  { label: "Shell", value: "sh" },
  { label: "Java", value: "java" },
  { label: "Kotlin", value: "kt" },
  { label: "Go", value: "go" },
  { label: "Swift", value: "swift" },
  { label: "Rust", value: "rs" },
  { label: "YAML", value: "yaml" },
  { label: "PHP", value: "php" },
  { label: "Perl", value: "pl" },
  { label: "PowerShell", value: "ps1" },
  { label: "Batch", value: "bat" },
];

module.exports = ({ getSetting, updateSetting, toggleSetting }) => (
  <div>
    <TextInput
      note='The domain used for the paste server.'
      defaultValue={getSetting('domain', 'https://micro.sylo.digital')}
      required={true}
      onChange={val => updateSetting('domain', val.endsWith('/') ? val.slice(0, -1) : val)}
    >
      Domain
    </TextInput>
    <TextInput
      note='The authorization header name for your domain.'
      defaultValue={getSetting('authHeaderName', 'Authorization')}
      required={false}
      onChange={val => updateSetting('authHeaderName', val)}
    >
      Auth Header Name
    </TextInput>
    <TextInput
      note='The authorization key for your domain.'
      defaultValue={getSetting('authKey', '')}
      required={false}
      onChange={val => updateSetting('authKey', val)}
    >
      Auth Key
    </TextInput>
    <TextInput
      note='Number of hours until it expires.'
      defaultValue={getSetting('expiry', 24)}
      required={false}
      onChange={val => updateSetting('expiry', val)}
    >
      Expiration
    </TextInput>
    <SelectInput
      note='Default File/Markdown Extension'
      value={getSetting('ext', 'md')}
      options={TYPE_OPTIONS}
      required={true}
      onChange={opt => updateSetting('ext', opt.value)}
    >Default Extension
    </SelectInput>
    <SwitchItem
      note='Whether the link is sent in chat by default or not.'
      value={getSetting('send', false)}
      onChange={() => toggleSetting('send')}
    >
      Send Link
    </SwitchItem>
    <SwitchItem
      note='Whether the command grabs from clipboard automatically'
      value={getSetting('clip', true)}
      onChange={() => toggleSetting('clip')}
    >
      Clipboard
    </SwitchItem>
    <SwitchItem
      note='Whether to encrypt the paste content, requiring the encryption key to be in the url'
      value={getSetting('encrypt', true)}
      onChange={() => toggleSetting('encrypt')}
    >
      Encrypt Paste
    </SwitchItem>
    <SwitchItem
      note='Whether to generate the paste id with 12 characters instead of 6'
      value={getSetting('paranoid', false)}
      onChange={() => toggleSetting('paranoid')}
    >
      Paranoid ID
    </SwitchItem>
    <SwitchItem
      note='Whether to delete the paste once it has been viewed.'
      value={getSetting('burn', false)}
      onChange={() => toggleSetting('burn')}
    >
      Burn Paste
    </SwitchItem>
  </div>
);
