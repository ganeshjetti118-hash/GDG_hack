import app from '../server/index.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: any, res: any) {
  return app(req, res);
}
