import { request as httpRequest } from 'https';

// superagent.js replacement

export default class request {

  static get = (url: string) => new request(url);
  static post = (url: string) => new request(url, 'POST');

  constructor(
    private url: string,
    private method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    private headers: { [id: string]: string; } = {}
  ) { }

  set(key: string, value: string) {
    this.headers[key] = value;
    return this;
  }

  send(data?: any): Promise<{ status: number, data: string }> {
    return new Promise((resolve, reject) => {
      let options = {
        method: this.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...this.headers
        }
      };

      const req = httpRequest(this.url, options, res => {

        let status = res.statusCode ?? 0;
        if (!(status >= 200 && status < 300)) {
          return reject(new Error(`Response status code: ${res.statusCode}`));
        }

        let body: any[] = [];
        res.on('data', d => {
          body.push(d);
        }).on('end', () => {
          resolve({ status: status, data: Buffer.concat(body).toString() });
        });
      });

      req.on('error', error => {
        reject(error);
      });

      if (data) {
        req.write(data);
      }
      req.end();
    });
  }
}