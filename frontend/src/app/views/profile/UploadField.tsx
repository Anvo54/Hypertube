import React, { createRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Form } from 'semantic-ui-react';
import ImgPreview from './ImgPreview';

interface IProps {
	fileName: string;
	setImgFile: (file: File | null) => void;
}

const UploadField: React.FC<IProps> = ({ fileName, setImgFile }) => {
	const { t } = useTranslation();
	const [img, setImg] = useState<string | null>(null);
	const inputRef: React.LegacyRef<HTMLInputElement> = createRef();

	const uploadImage = (e: React.FormEvent<HTMLButtonElement>): void => {
		e.preventDefault();
		inputRef.current!.click();
	};

	const removeImage = (e: React.FormEvent<HTMLButtonElement>): void => {
		e.stopPropagation();
		if (img) setImg(null);
		setImgFile(null);
	};

	const fileChange = (e: React.FormEvent<HTMLInputElement>): void => {
		if (e.currentTarget.files && e.currentTarget.files[0]) {
			const allowedTypes = ['image/jpeg', 'image/png'];
			const file = e.currentTarget.files[0];
			if (file.size > 5242880 || !allowedTypes.includes(file.type)) {
				toast.error(t('error_invalid_file'));
				return;
			}
			setImgFile(file);
			const reader = new FileReader();
			reader.onload = () => setImg(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const btnText =
		fileName === 'blank-profile.png' && !img
			? t('upload_pic')
			: t('change_pic');

	return (
		<>
			<Form.Field>
				<Form.Group widths="equal" style={{ alignItems: 'center' }}>
					<Button
						content={btnText}
						labelPosition="left"
						icon="file"
						onClick={uploadImage}
						basic
						color="teal"
						size="small"
						style={{ marginLeft: '7px' }}
						type="button"
					/>
					<input ref={inputRef} type="file" hidden onChange={fileChange} />
					<ImgPreview removeImg={removeImage} img={img} fileName={fileName} />
				</Form.Group>
			</Form.Field>
		</>
	);
};

export default UploadField;
