<?php
if(!empty($field['config']['placeholder'])){
	$field_placeholder = 'placeholder="'. esc_attr(Caldera_Forms::do_magic_tags($field['config']['placeholder'])) .'"';
}

$mask = '(999) 999-9999';
if( $field['config']['type'] == 'international' ){
	$mask = '+99 99 999 9999';
}elseif ( $field['config']['type'] == 'custom' ) {
	$mask = $field['config']['custom'];
}

?><?php echo $wrapper_before; ?>
	<?php echo $field_label; ?>
		<input <?php echo $field_placeholder; ?> type="tel" pattern="\([0-9]{3}\) [0-9]{3}-[0-9]{4}" data-field="<?php echo esc_attr( $field_base_id ); ?>" class="<?php echo esc_attr( $field_class ); ?>" id="<?php echo esc_attr( $field_id ); ?>" name="<?php echo esc_attr( $field_name ); ?>" value="<?php echo esc_attr( $field_value ); ?>" <?php echo $field_required; ?> <?php echo $field_structure['aria']; ?>>
		<?php echo $field_caption; ?>
<?php echo $wrapper_after; ?>
