import { PrepareTaskStatus } from 'app/stores/movieStore';
import React from 'react';
import { Grid, Loader, Icon } from 'semantic-ui-react';

interface IProps {
	text: string;
	status: PrepareTaskStatus;
}

const PrepareModalTask: React.FC<IProps> = ({ text, status }) => {
	return (
		<Grid.Row>
			<Grid.Column>
				{status === 'loading' && <Loader size="mini" />}
				{status === 'done' && <Icon name="check" color="teal" />}
				{status === 'error' && <Icon name="delete" color="red" />}
			</Grid.Column>
			<Grid.Column width={14}>{text}</Grid.Column>
		</Grid.Row>
	);
};

export default PrepareModalTask;
