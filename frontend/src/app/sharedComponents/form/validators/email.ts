import { ValidationResult } from '@lemoncode/fonk/typings/model';
import { IFieldValidatorArgs, ValidatorFunction } from './types';

export const getTranslatedEmailValidator = (
	errorText: string
): ValidatorFunction => {
	const EMAIL_REGEX =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	return (fieldValidatorArgs: IFieldValidatorArgs): ValidationResult => {
		const { value } = fieldValidatorArgs;

		const validationResult = {
			succeeded: false,
			type: 'EMAIL_COMPLEXITY',
			message: errorText,
		};

		if (EMAIL_REGEX.test(value)) {
			validationResult.succeeded = true;
			validationResult.message = '';
		}
		return validationResult;
	};
};
