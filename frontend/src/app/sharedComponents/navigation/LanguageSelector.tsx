import { RootStoreContext } from 'app/stores/rootStore';
import { Languages } from 'app/stores/userStore';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { changeLanguage, languagesSelect } from 'translations/i18n';

interface IProps {
	isMobile?: boolean;
}

const LanguageSelector: React.FC<IProps> = ({ isMobile = false }) => {
	const { i18n } = useTranslation();
	const rootStore = useContext(RootStoreContext);
	const { token, updateLanguage } = rootStore.userStore;

	const activeLanguageName = () => {
		const activeLng = languagesSelect.find((row) => row.key === i18n.language);
		return activeLng!.text;
	};

	const handleChange = (
		e: React.SyntheticEvent<HTMLElement, Event>,
		{ value }: DropdownProps
	) => {
		changeLanguage(value as string);
		if (token) {
			updateLanguage(value as Languages);
		}
	};

	return (
		<Dropdown
			item
			icon={isMobile ? 'world' : null}
			pointing={isMobile ? 'top right' : 'top'}
			options={languagesSelect}
			text={activeLanguageName()}
			onChange={handleChange}
			value={i18n.language}
			style={{ justifyContent: 'center' }}
		/>
	);
};

export default LanguageSelector;
