import React from 'react';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Modal, Grid, Loader, Button } from 'semantic-ui-react';
import PrepareModalTask from './PrepareModalTask';
import { useTranslation } from 'react-i18next';
import ErrorMessage from 'app/sharedComponents/form/ErrorMessage';

interface IProps {
	movieReady: boolean;
}

const PrepareModal: React.FC<IProps> = ({ movieReady }) => {
	const rootStore = useContext(RootStoreContext);
	const {
		prepareModalOpen,
		closePrepareModal,
		prepareTasks,
		prepareMode,
		prepareError,
	} = rootStore.movieStore;
	const { t } = useTranslation();

	return (
		<Modal
			onClose={closePrepareModal}
			open={prepareModalOpen}
			size="mini"
			dimmer="inverted"
		>
			<Modal.Header>{t('preparing_movie')}</Modal.Header>
			<Modal.Content style={{ minHeight: '249px' }}>
				{!prepareMode && <Loader />}
				{prepareMode && (
					<Grid columns="equal">
						{prepareTasks.torrent !== 'disabled' && (
							<PrepareModalTask
								text={t('searching_torrent')}
								status={prepareTasks.torrent}
							/>
						)}
						{prepareTasks.metadata !== 'disabled' && (
							<PrepareModalTask
								text={t('fetching_metadata')}
								status={prepareTasks.metadata}
							/>
						)}
						{prepareTasks.subtitles !== 'disabled' && (
							<PrepareModalTask
								text={t('downloading_subtitles')}
								status={prepareTasks.subtitles}
							/>
						)}
						{prepareTasks.firstPieces !== 'disabled' && (
							<PrepareModalTask
								text={t('waiting_download')}
								status={prepareTasks.firstPieces}
							/>
						)}
					</Grid>
				)}
				{prepareError && (
					<ErrorMessage
						style={{
							paddingLeft: 10,
							paddingRight: 10,
							paddingTop: 7,
							paddingBottom: 7,
						}}
						message={prepareError}
					/>
				)}
			</Modal.Content>
			<Modal.Actions>
				<Button content={t('close')} onClick={closePrepareModal} />
				<Button
					color="teal"
					content={t('play_movie')}
					disabled={!movieReady}
					onClick={closePrepareModal}
				/>
			</Modal.Actions>
		</Modal>
	);
};

export default observer(PrepareModal);
