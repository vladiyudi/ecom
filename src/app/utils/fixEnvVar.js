export const formatPrivateKey = (key) => {
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    const content = key.replace(/\\n/g, '\n').replace(header, '').replace(footer, '').trim();
    return `${header}\n${content}\n${footer}`;
  };