import { describe, it } from 'mocha';
import { expect } from 'chai';

import UserValidator from '../../../src/app/domain/usecases/user/user-validator';
import { IEmailValidator } from '../../../src/app/domain/validators/email-validator';

const makeSut = () => {
  class EmailValidatorSpy implements IEmailValidator {
    email: any;

    valid(email: string) {
      this.email = email;
      if (email === 'invalidEmail') {
        return false;
      }

      return true;
    }
  }

  const data = {
    firstName: 'validFirstName',
    lastName: 'validLastName',
    email: 'valid@mail.com',
    password: 'validPassword',
  };

  const EmailValidator = new EmailValidatorSpy();
  const sut = new UserValidator(EmailValidator);


  return ({
    EmailValidator,
    sut,
    data,
  });
};

describe('Create User Test Suite', () => {
  it('test if a null error is returned when receive a valid data', () => {
    const { sut, data } = makeSut();

    const result = sut.create(data);
    expect(result).to.be.deep.equal({ error: null });
  });

  it('test if email validator is called with correct values', () => {
    const { EmailValidator, sut, data } = makeSut();

    sut.create(data);
    expect(EmailValidator.email).to.be.equal('valid@mail.com');
  });

  it('test if email throw a error when dont received a valid email', () => {
    const { sut, data } = makeSut();
    data.email = 'invalidEmail';

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"email" has a incorrect format' });
  });

  it('test if first name is more than 3 length', () => {
    const { sut, data } = makeSut();

    data.firstName = '123';

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"firstName" need to have more than 3 length' });
  });

  it('test if first name throw a error when dont received a string', () => {
    const { sut, data } = makeSut();

    (data.firstName as any) = 123;

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"firstName" must be a string' });
  });

  it('test if last name is more than 3 length', () => {
    const { sut, data } = makeSut();

    data.lastName= '123';

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"lastName" need to have more than 3 length' });
  });

  it('test if last name throw a error when dont received a string', () => {
    const { sut, data } = makeSut();

    (data.lastName as any) = 123;

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"lastName" must be a string' });
  });

  it('test if password is more than 6 length', () => {
    const { sut, data } = makeSut();

    data.password = '12345';

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"password" need to have more than 6 length' });
  });

  it('test if password throw a error when dont received a string', () => {
    const { sut, data } = makeSut();

    (data.password as any) = 12345;

    const result = sut.create(data);

    expect(result).to.be.deep.equal({ error: '"password" must be a string' });
  });
});

