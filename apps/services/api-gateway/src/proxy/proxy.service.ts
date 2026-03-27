import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { getServiceUrl } from '@voxhire/config';

@Injectable()
export class ProxyService {
  async forward(
    serviceName: string,
    method: string,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
  ) {
    const baseUrl = getServiceUrl(serviceName);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig['method'],
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 30000,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Service unavailable';
      throw new HttpException(message, status);
    }
  }
}
