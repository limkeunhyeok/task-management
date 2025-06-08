import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidateDataTask {
  constructor() {}

  async execute() {
    console.log('validate!');
  }
}
