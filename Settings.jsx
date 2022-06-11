const { React } = require('powercord/webpack');
const { TextInput, SwitchItem } = require('powercord/components/settings');

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
      note='The auth key for your domain.'
      defaultValue={getSetting('authKey', '')}
      required={false}
      onChange={val => updateSetting('authKey', val)}
    >
      Auth Key
    </TextInput>
    <SwitchItem
      note='Whether the link is sent in chat by default or not.'
      value={getSetting('send', false)}
      onChange={() => toggleSetting('send')}
    >
      Send Link
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
