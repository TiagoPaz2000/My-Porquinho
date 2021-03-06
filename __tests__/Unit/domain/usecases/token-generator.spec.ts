import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { ITokenAdapter } from '../../../../src/app/domain/protocols';
import User from '../../../../src/app/domain/entities/user/user';
import TokenGenerator from '../../../../src/app/domain/usecases/token/token-generator';

const makeTokenAdapter = (): ITokenAdapter => {
  class TokenAdapterStub implements ITokenAdapter {
    generate(userId: User['id'],
      expireDate: string,
    ): string {
      return 'valid_token';
    }
  }

  return new TokenAdapterStub();
};

const makeSut = () => {
  const tokenAdapter = makeTokenAdapter();
  const sut = new TokenGenerator(tokenAdapter);

  return { sut, tokenAdapter };
};

describe('Token Generator', () => {
  it('Should return a token with successfuly', () => {
    const { sut } = makeSut();
    const userId = 1;
    const token = sut.create(userId);

    expect(token.token).to.be.equal('valid_token');
  });

  it('Test if generator is called with correct arg', () => {
    const { sut, tokenAdapter } = makeSut();
    const userId = 1;
    const config = { expireData: '7d' };
    const tokenAdapterSpy = sinon.spy(tokenAdapter, 'generate');
    sut.create(userId);

    expect(tokenAdapterSpy
      .calledWith(userId, config.expireData))
      .true;
  });
});
