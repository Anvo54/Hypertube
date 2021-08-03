import { ValidationResult } from '@lemoncode/fonk/typings/model';
import { IFieldValidatorArgs, ValidatorFunction } from './types';

export const getTranslatedPasswordComplexity = (
	errorText: string,
	isEmptyOk = false
): ValidatorFunction => {
	return (fieldValidatorArgs: IFieldValidatorArgs): ValidationResult => {
		const { value } = fieldValidatorArgs;

		const validationResult = {
			succeeded: false,
			type: 'PASSWORD_COMPLEXITY',
			message: errorText,
		};

		if (
			(/[A-Za-z]+/.test(value) &&
				/\d+/.test(value) &&
				value.length > 3 &&
				value.length < 256) ||
			(isEmptyOk && value === undefined)
		) {
			validationResult.succeeded = true;
			validationResult.message = '';
		}
		return validationResult;
	};
};
