<?php


namespace calderawp\calderaforms\cf2\Fields\Handlers;
use calderawp\calderaforms\cf2\Exception;
use calderawp\calderaforms\cf2\Fields\FieldTypes\FileFieldType;
use calderawp\calderaforms\cf2\Transients\TransientApiContract;


class FileUpload
{

    /**
     * @var array
     */
    protected $field;
    /**
     * @var array
     */
    protected $form;

    /**
     * @var UploaderContract
     */
    protected  $uploader;
    public function __construct(array $field, array $form, UploaderContract $uploader )
    {
        $this->field = $field;
        $this->form = $form;
        $this->uploader = $uploader;
    }


    /**
     * @param array $files
     * @param array $hashes
     * @return array
     * @throws \Exception
     */
    public function processFiles(array $files,array $hashes  ){

        $i = 0;
        foreach ($files as  $file) {
            $isPrivate = \Caldera_Forms_Files::is_private($this->field);

            $expected = $hashes[$i];
            $actual      = md5_file( $file['tmp_name'] );

            if ( $expected !== $actual ) {
                throw new Exception(__( 'Content hash did not match expected.' ), 412 );
            }


            $this->uploader
                ->addFilter(
                    $this->field[ 'ID' ],
                    $this->form[ 'ID' ],
                    $isPrivate
            );

            if( ! $this->isAllowedType( $file ) ){
                throw new Exception(  __('This file type is not allowed. Please try another.', 'caldera-forms'), 415 );
            }
            $upload = wp_handle_upload($file, array( 'test_form' => false, 'action' => 'foo' ) );
            $this->uploader->removeFilter();
            if( !empty( $field['config']['media_lib'] ) ){
                \Caldera_Forms_Files::add_to_media_library( $upload, $field );
            }


            $uploads[] = $upload['url'];
            $i++;

        }



        return $uploads;
    }

    /**
     * Check if file type if allowed for this field
     *
     * @since 1.8.0
     *
     * @param $file
     * @return bool
     * @throws Exception
     */
    public function isAllowedType($file){
        if( empty( $this->field['config']['allowed'] )){
            return true;
        }
        $filetype = wp_check_filetype( basename( $file['tmp_name'] ), null );
       return in_array( strtolower( $filetype['ext'] ), $this->getAllowedTypes() );
    }

    /**
     * Get allowed file types for file field
     *
     * @since 1.8.0
     *
     * @return array
     */
    public function getAllowedTypes()
    {
        $types = ! empty( $this->field['config']['allowed'] ) ? $this->field['config']['allowed'] : [];
        if( ! is_array( $types ) ){
            $types = explode(',', $types );
        }
        return $types;
    }
}