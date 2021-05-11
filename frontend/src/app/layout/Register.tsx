import React from 'react';
import { Link } from 'react-router-dom';
import {
	Grid,
	Form,
	Header,
	Image,
	Segment,
	Button,
	Message,
} from 'semantic-ui-react';

export interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
	return (
		<Grid textAlign="center" style={{ height: '100vh' }} verticalAlign="middle">
			<Grid.Column style={{ maxWidth: 450 }}>
				<Header as="h2" color="teal" textAlign="center">
					<Image src="/logo_128.png" /> Register your account
				</Header>
				<Form size="large">	
					<Segment stacked>
						<Form.Input fluid placeholder="E-mail address" />
						<Form.Input fluid placeholder="Username" />
						<Form.Input fluid placeholder="Firstname" />
						<Form.Input fluid placeholder="Lastname" />
						<Form.Input
							fluid
							icon="lock"
							iconPosition="left"
							placeholder="Password"
							type="password"
						/>

						<Button color="teal" fluid size="large">
							Register
						</Button>
					</Segment>
				</Form>
				<Message>
        Have account? <Link to="/login">Login</Link>
      </Message>
			</Grid.Column>
		</Grid>
	);
};

export default Register;
