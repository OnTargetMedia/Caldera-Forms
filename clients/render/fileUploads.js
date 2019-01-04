import { createMediaFromFile, hashFile, removeFromBlocking, removeFromPending, removeFromUploadStarted } from './util'

/**
 * Manage response of file upload requests
 *
 * @since 1.8.0
 *
 * @param {object} response generated by hashFile() => createMediaFromFile()
 * @param {object} cf2 fields config with status set
 * @param {object} $form object
 * @param {object} messages to be passed for different responses
 * @param {object] field we are processing files for
 */
export const handleFileUploadResponse = (response,cf2,$form,messages,field) => {

	const {fieldId} = field;
	if( 'object' !== typeof  response ){
		removeFromUploadStarted(fieldId,cf2);
		removeFromPending(fieldId,cf2);
		throw 'Upload Error';
	}
	else if (response.hasOwnProperty('control')) {
		removeFromPending(fieldId,cf2);
		removeFromBlocking(fieldId,cf2);
		cf2.uploadCompleted.push(fieldId);
		$form.submit();
	}else{
		if( response.hasOwnProperty('message') ){
			messages[field.fieldIdAttr] = {
				error: true,
				message: response.hasOwnProperty('message') ? response.message : 'Invalid'
			};
		}
		removeFromUploadStarted(fieldId,cf2);
		removeFromPending(fieldId,cf2);
		throw response;
	}
};

export const handleFileUploadError = (error, file) => {
	if( error.hasOwnProperty('message') ){
		console.log( error.message );
	}else{
		console.log( 'Error: ' + file.name + ' could not be processed');
	}

};

/**
 * Hash a file then upload it
 *
 * @since 1.8.0
 *
 * @param {File} file File blob
 * @param {string} verify Nonce token
 * @param {object} field field config
 * @param {string} fieldId ID for field
 */
export const hashAndUpload = (file, processData, processFunctions ) => {

	const {verify, field, cf2, $form, CF_API_DATA, messages} = processData;
	const {hashFile, createMediaFromFile, handleFileUploadResponse, handleFileUploadError} = processFunctions;

	const API_FOR_FILES_URL = CF_API_DATA.rest.fileUpload;
	const _wp_nonce = CF_API_DATA.rest.nonce;

	if (file instanceof File || file instanceof Blob) {

		hashFile(file, (hash) => {
			const additonalData = {
				hashes: [hash],
				verify,
				formId: field.formId,
				fieldId: field.fieldId,
				control: field.control,
				_wp_nonce,
				API_FOR_FILES_URL
			}
			createMediaFromFile(file, additonalData, fetch )
			.then(
				response => response.json()
			)
			.then(
				response => {
					handleFileUploadResponse(response,cf2,$form,messages,field);
				}
			)
			.catch(
				error => {
					handleFileUploadError(error, file);
				}
			);
		});

	}
}

/**
 * Trigger the process on array of files
 *
 * @since 1.8.0
 *
 * @param {array} files array of Files
 * @param {string} verify Nonce token
 * @param {object} field field config
 * @param {string} fieldId ID for field
 */
export const processFiles = (files, processData, processFunctions) => {

	const {hashAndUpload, handleFileUploadError} = processFunctions;

	files.forEach(file => {
			if( Array.isArray( file ) ){
				file = file[0];
			}

			try{
				hashAndUpload(file, processData, processFunctions);
			} catch(error){
				handleFileUploadError(error, file);
			}

		}
	);
}