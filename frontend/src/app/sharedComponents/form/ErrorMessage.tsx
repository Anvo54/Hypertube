import React from 'react';
import { Message, MessageProps } from 'semantic-ui-react';

interface IProps extends MessageProps {
	message: string;
}

const ErrorMessage: React.FC<IProps> = ({ message, style }) => {
	return (
		<Message style={style} error>
			{message}
		</Message>
	);
};

export default ErrorMessage;
