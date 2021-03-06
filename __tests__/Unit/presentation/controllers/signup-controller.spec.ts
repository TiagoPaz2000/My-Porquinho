import { describe, it } from 'mocha';
import { expect} from 'chai';
import sinon from 'sinon';
import { SignUpController } from '../../../../src/app/presentation/controllers/signup-controller';
import { badRequest } from '../../../../src/app/domain/helpers'
import { makeEmailExists, makeUserValidator, makeNewAccount, makePasswordEncrypter } from '../../mocks/usecases';

const makeSut = () => {
  const userValidator = makeUserValidator();
  const emailExists = makeEmailExists();
  const newAccount = makeNewAccount();
  const passwordEncrypter = makePasswordEncrypter()
  const sut = new SignUpController(userValidator, emailExists, newAccount, passwordEncrypter);

  return ({
    sut,
    userValidator,
    emailExists,
    newAccount,
    passwordEncrypter,
  });
};

describe('SignUpController', () => {
  it('Should encrypt password method is called with correct params', async () => {
    const { sut, passwordEncrypter } = makeSut();

    const passwordEncrypterSpy = sinon.spy(passwordEncrypter, 'encrypt');

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    await sut.handle(httpRequest.body);
    expect(passwordEncrypterSpy.calledWith(httpRequest.body.password)).true;
  });

  it('Should return status 500 if encrypter throws', async () => {
    const { sut, passwordEncrypter } = makeSut();

    sinon.stub(passwordEncrypter, 'encrypt').throws()

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest.body);
    expect(httpResponse.statusCode).to.be.equal(500);
    expect(httpResponse.body).to.be.eql({ error: 'internal server error' })
  });

  it('Should return status 400 if receive invalid user first name', async () => {
    const { sut, userValidator } = makeSut();

    sinon.stub(userValidator, 'valid').throws(badRequest({ error: new Error('"firstName" must be a string'), status: 400 }));

    const httpRequest = {
      body: {
        firstName: 'invalid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest.body);
    expect(httpResponse.statusCode).to.be.equal(400);
    expect(httpResponse.body).to.be.eql({ error: '"firstName" must be a string' })
  });

  it('Should return status 500 if some dependency throw an exception', async () => {
    const { sut, userValidator } = makeSut();

    sinon.stub(userValidator, 'valid').throws();

    const httpRequest = {
      body: {
        firstName: 'invalid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest.body);
    expect(httpResponse.statusCode).to.be.equal(500);
    expect(httpResponse.body).to.be.eql({ error: 'internal server error' })
  });

  it('Should valid user method is called with correct params', async () => {
    const { sut, userValidator } = makeSut();

    const userValidatorSpy = sinon.spy(userValidator, 'valid');

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    await sut.handle(httpRequest.body);

    expect(userValidatorSpy.calledWith(httpRequest.body)).true;
  });

  it('Should return status 400 if receive an email used', async () => {
    const { sut, emailExists } = makeSut();

    sinon.stub(emailExists, 'valid').throws(badRequest({ error: new Error('"email" already used'), status: 400 }));

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'used_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest.body);

    expect(httpResponse.statusCode).to.equal(400);
    expect(httpResponse.body).to.be.eql({ error: '"email" already used' })
  });

  it('Should return a token when new account is created', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest.body);

    expect(httpResponse.body).to.deep.equal({ token: 'valid_token' });
  });

  it('Should return a status 201 new account is created', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest.body);

    expect(httpResponse.statusCode).to.equal(201);
  });

  it('Should new account method is called with correct params', async () => {
    const { sut, newAccount } = makeSut();

    const newAccountSpy = sinon.spy(newAccount, 'create');

    const httpRequest = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const expectBody = {
      body: {
        firstName: 'valid_firstName',
        lastName: 'valid_lastName',
        email: 'valid_email',
        password: 'encrypted_password',
      },
    }

    await sut.handle(httpRequest.body);

    expect(newAccountSpy.calledWith(expectBody.body)).to.be.true;
  });
});