export const buildCurl = (url: string, method: string, body: string): string => {
  let curl = `curl -X ${method.toUpperCase()} '${url}'`;
  if (body) {
    curl += ` -H 'Content-Type: application/json' -d '${body.replace(/'/g, "'\\''")}'`;
  }
  return curl;
};
