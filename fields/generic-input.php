<?php
/**
 * Generic HTML input field
 *
 * @package Caldera_Forms
 * @author    Josh Pollock <Josh@CalderaWP.com>
 * @license   GPL-2.0+
 * @link
 * @copyright 2016 CalderaWP LLC
 */
?>

<?php echo $field_label; ?>
<?php echo Caldera_Forms_Field_Input::html( $field, $field_structure, $form ); ?>
<?php echo $field_caption; ?>
