import tunnel from 'tunnel';

class ApiService {
  get proxyRequest() {
    const agent = tunnel.httpsOverHttp({
      proxy: {
        host: 'http://proxy.example.com',
        port: 22225,
        proxyAuth: `username:password`,
      },
    });
    return axios.create({
      agent,
    })
  }
}
