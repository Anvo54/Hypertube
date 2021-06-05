export interface IRegisterFormValues {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	confirmPassword: string;
}

export interface IAccessToken {
	accessToken: string;
}

export interface ILoginFormValues {
	username: string;
	password: string;
}

export interface IResetPassword {
	password: string;
}

export interface IForgetPassword {
	email: string;
}
